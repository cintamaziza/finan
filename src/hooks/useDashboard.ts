import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { DashboardStats, Transaction, Budget, Goal, BillReminder, Category } from '../types';

interface TransactionRow {
    id: string;
    amount: number;
    type: string;
    date: string;
    description: string;
    category_id: string;
    account_id: string;
    categories?: Category;
}

interface MonthlyChartData {
    month: string;
    income: number;
    expenses: number;
}

interface CategoryChartData {
    name: string;
    value: number;
    color: string;
}

export const useDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [monthlyChartData, setMonthlyChartData] = useState<MonthlyChartData[]>([]);
    const [categoryChartData, setCategoryChartData] = useState<CategoryChartData[]>([]);
    const [previousMonthStats, setPreviousMonthStats] = useState<{ income: number; expenses: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        if (!user) {
            setStats(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

            // Get 6 months ago for chart data
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];

            // Previous month for comparison
            const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
            const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

            // Fetch all data in parallel
            const [
                accountsRes,
                currentMonthTxRes,
                sixMonthTxRes,
                prevMonthTxRes,
                budgetsRes,
                goalsRes,
                billsRes,
            ] = await Promise.all([
                supabase.from('accounts').select('balance').eq('user_id', user.id),
                supabase
                    .from('transactions')
                    .select('*, categories(*)')
                    .eq('user_id', user.id)
                    .gte('date', startOfMonth)
                    .lte('date', endOfMonth)
                    .order('date', { ascending: false }),
                supabase
                    .from('transactions')
                    .select('*, categories(*)')
                    .eq('user_id', user.id)
                    .gte('date', sixMonthsAgo)
                    .lte('date', endOfMonth)
                    .order('date', { ascending: false }),
                supabase
                    .from('transactions')
                    .select('amount, type')
                    .eq('user_id', user.id)
                    .gte('date', startOfPrevMonth)
                    .lte('date', endOfPrevMonth),
                supabase
                    .from('budgets')
                    .select('*, categories(*)')
                    .eq('user_id', user.id),
                supabase
                    .from('goals')
                    .select('*')
                    .eq('user_id', user.id),
                supabase
                    .from('bill_reminders')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_paid', false)
                    .order('due_date', { ascending: true }),
            ]);

            // Calculate totals
            const totalBalance = (accountsRes.data || []).reduce(
                (sum, acc) => sum + Number(acc.balance), 0
            );

            const currentTransactions = currentMonthTxRes.data || [];
            const monthlyIncome = currentTransactions
                .filter((t: TransactionRow) => t.type === 'income')
                .reduce((sum: number, t: TransactionRow) => sum + Number(t.amount), 0);
            const monthlyExpenses = currentTransactions
                .filter((t: TransactionRow) => t.type === 'expense')
                .reduce((sum: number, t: TransactionRow) => sum + Number(t.amount), 0);

            // Previous month stats for comparison
            const prevTransactions = prevMonthTxRes.data || [];
            const prevIncome = prevTransactions
                .filter((t: { type: string }) => t.type === 'income')
                .reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0);
            const prevExpenses = prevTransactions
                .filter((t: { type: string }) => t.type === 'expense')
                .reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0);
            setPreviousMonthStats({ income: prevIncome, expenses: prevExpenses });

            // Aggregate 6 months of chart data
            const sixMonthTransactions = sixMonthTxRes.data || [];
            const monthlyData: Record<string, { month: string; income: number; expenses: number }> = {};

            sixMonthTransactions.forEach((t: TransactionRow) => {
                const date = new Date(t.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { month: monthLabel, income: 0, expenses: 0 };
                }

                if (t.type === 'income') {
                    monthlyData[monthKey].income += Number(t.amount);
                } else {
                    monthlyData[monthKey].expenses += Number(t.amount);
                }
            });

            const sortedMonthlyData = Object.entries(monthlyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([, data]) => data);
            setMonthlyChartData(sortedMonthlyData);

            // Aggregate category spending for current month
            const categoryData: Record<string, { name: string; value: number; color: string }> = {};
            currentTransactions
                .filter((t: TransactionRow) => t.type === 'expense')
                .forEach((t: TransactionRow) => {
                    const categoryId = t.category_id;
                    const category = t.categories;
                    const categoryName = category?.name || 'Other';
                    const categoryColor = category?.color || '#6B7280';

                    if (!categoryData[categoryId]) {
                        categoryData[categoryId] = { name: categoryName, value: 0, color: categoryColor };
                    }

                    categoryData[categoryId].value += Number(t.amount);
                });

            const sortedCategoryData = Object.values(categoryData).sort((a, b) => b.value - a.value);
            setCategoryChartData(sortedCategoryData);

            // Calculate spent per category for budgets
            const spentByCategory: Record<string, number> = {};
            currentTransactions
                .filter((t: TransactionRow) => t.type === 'expense')
                .forEach((t: TransactionRow) => {
                    if (t.category_id) {
                        spentByCategory[t.category_id] = (spentByCategory[t.category_id] || 0) + Number(t.amount);
                    }
                });

            // Map data with proper types
            const recentTransactions: Transaction[] = currentTransactions.slice(0, 5).map((t: TransactionRow) => ({
                ...t,
                type: t.type as 'income' | 'expense',
                user_id: user.id,
                is_recurring: false,
                created_at: t.date,
                updated_at: t.date,
                category: t.categories,
            }));

            const budgetProgress: Budget[] = (budgetsRes.data || []).map((b: { id: string; category_id: string; amount: number; period: string; start_date: string; created_at: string; categories?: Category }) => ({
                ...b,
                period: b.period as 'monthly' | 'yearly',
                user_id: user.id,
                category: b.categories,
                spent: spentByCategory[b.category_id] || 0,
            }));

            const goalProgress: Goal[] = (goalsRes.data || []) as Goal[];
            const upcomingBills: BillReminder[] = (billsRes.data || []) as BillReminder[];

            const savingsRate = monthlyIncome > 0
                ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
                : 0;

            setStats({
                totalBalance,
                monthlyIncome,
                monthlyExpenses,
                savingsRate,
                recentTransactions,
                upcomingBills,
                budgetProgress,
                goalProgress,
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError('Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return {
        stats,
        monthlyChartData,
        categoryChartData,
        previousMonthStats,
        isLoading,
        error,
        refetch: fetchDashboard,
    };
};

