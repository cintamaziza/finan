import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logAuditAction } from './useAuditLogs';
import type { Budget, Category } from '../types';

interface BudgetWithCategory extends Omit<Budget, 'category'> {
    categories?: Category;
}

export const useBudgets = () => {
    const { user } = useAuth();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBudgets = useCallback(async () => {
        if (!user) {
            setBudgets([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            // Get budgets with categories
            const { data: budgetsData, error: budgetsError } = await supabase
                .from('budgets')
                .select(`
                    *,
                    categories(*)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (budgetsError) throw budgetsError;

            // Calculate spent amounts from transactions for current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

            const { data: transactionsData } = await supabase
                .from('transactions')
                .select('category_id, amount')
                .eq('user_id', user.id)
                .eq('type', 'expense')
                .gte('date', startOfMonth)
                .lte('date', endOfMonth);

            // Calculate spent per category
            const spentByCategory: Record<string, number> = {};
            (transactionsData || []).forEach(t => {
                if (t.category_id) {
                    spentByCategory[t.category_id] = (spentByCategory[t.category_id] || 0) + Number(t.amount);
                }
            });

            // Map budgets with spent amounts
            const mappedBudgets: Budget[] = (budgetsData || []).map((b: BudgetWithCategory) => ({
                ...b,
                category: b.categories,
                spent: spentByCategory[b.category_id] || 0,
            }));

            setBudgets(mappedBudgets);
            setError(null);
        } catch (err) {
            console.error('Error fetching budgets:', err);
            setError('Failed to load budgets');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const addBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'spent' | 'category'>) => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('budgets')
            .insert({ ...budget, user_id: user.id })
            .select(`
                *,
                categories(*)
            `)
            .single();

        if (error) return { error: error.message };

        const mappedBudget: Budget = {
            ...data,
            category: data.categories,
            spent: 0,
        };

        setBudgets(prev => [...prev, mappedBudget]);

        // Log audit action
        const categoryName = data.categories?.name || 'Anggaran';
        await logAuditAction(user.id, 'create', 'budget', data.id, categoryName);

        return { data: mappedBudget };
    };

    const updateBudget = async (id: string, updates: Partial<Budget>) => {
        const { category, spent, ...cleanUpdates } = updates;

        const { data, error } = await supabase
            .from('budgets')
            .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select(`
                *,
                categories(*)
            `)
            .single();

        if (error) return { error: error.message };

        const existingBudget = budgets.find(b => b.id === id);
        const mappedBudget: Budget = {
            ...data,
            category: data.categories,
            spent: existingBudget?.spent || 0,
        };

        setBudgets(prev => prev.map(b => b.id === id ? mappedBudget : b));

        // Log audit action
        if (user) {
            const categoryName = data.categories?.name || 'Anggaran';
            await logAuditAction(user.id, 'update', 'budget', id, categoryName);
        }

        return { data: mappedBudget };
    };

    const deleteBudget = async (id: string) => {
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id);

        if (error) return { error: error.message };

        const budget = budgets.find(b => b.id === id);
        setBudgets(prev => prev.filter(b => b.id !== id));

        // Log audit action
        if (user) {
            const categoryName = budget?.category?.name || 'Anggaran';
            await logAuditAction(user.id, 'delete', 'budget', id, categoryName);
        }

        return { success: true };
    };

    return {
        budgets,
        isLoading,
        error,
        refetch: fetchBudgets,
        addBudget,
        updateBudget,
        deleteBudget,
    };
};
