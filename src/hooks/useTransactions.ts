import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logAuditAction } from './useAuditLogs';
import type { Transaction, Category, Account } from '../types';

interface TransactionWithRelations extends Omit<Transaction, 'category' | 'account'> {
    categories?: Category;
    accounts?: Account;
}

export const useTransactions = (filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
    type?: 'income' | 'expense';
    limit?: number;
}) => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            let query = supabase
                .from('transactions')
                .select(`
                    *,
                    categories(*),
                    accounts(*)
                `)
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (filters?.startDate) {
                query = query.gte('date', filters.startDate);
            }
            if (filters?.endDate) {
                query = query.lte('date', filters.endDate);
            }
            if (filters?.categoryId) {
                query = query.eq('category_id', filters.categoryId);
            }
            if (filters?.accountId) {
                query = query.eq('account_id', filters.accountId);
            }
            if (filters?.type) {
                query = query.eq('type', filters.type);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Map the response to match our Transaction type
            const mappedTransactions: Transaction[] = (data || []).map((t: TransactionWithRelations) => ({
                ...t,
                category: t.categories,
                account: t.accounts,
            }));

            setTransactions(mappedTransactions);
            setError(null);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Failed to load transactions');
        } finally {
            setIsLoading(false);
        }
    }, [user, filters?.startDate, filters?.endDate, filters?.categoryId, filters?.accountId, filters?.type, filters?.limit]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category' | 'account'>) => {
        if (!user) return { error: 'Not authenticated' };

        // First, get the current account balance
        const { data: accountData, error: accountError } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', transaction.account_id)
            .single();

        if (accountError) return { error: accountError.message };

        // Calculate new balance
        const currentBalance = Number(accountData.balance);
        const balanceChange = transaction.type === 'income' ? Number(transaction.amount) : -Number(transaction.amount);
        const newBalance = currentBalance + balanceChange;

        // Update account balance
        const { error: updateError } = await supabase
            .from('accounts')
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq('id', transaction.account_id);

        if (updateError) return { error: updateError.message };

        // Insert the transaction
        const { data, error } = await supabase
            .from('transactions')
            .insert({ ...transaction, user_id: user.id })
            .select(`
                *,
                categories(*),
                accounts(*)
            `)
            .single();

        if (error) return { error: error.message };

        const mappedTransaction: Transaction = {
            ...data,
            category: data.categories,
            account: data.accounts,
        };

        setTransactions(prev => [mappedTransaction, ...prev]);

        // Log audit action
        await logAuditAction(user.id, 'create', 'transaction', data.id, transaction.description || 'Transaksi');

        return { data: mappedTransaction };
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        const { category, account, ...cleanUpdates } = updates;

        const { data, error } = await supabase
            .from('transactions')
            .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select(`
                *,
                categories(*),
                accounts(*)
            `)
            .single();

        if (error) return { error: error.message };

        const mappedTransaction: Transaction = {
            ...data,
            category: data.categories,
            account: data.accounts,
        };

        setTransactions(prev => prev.map(t => t.id === id ? mappedTransaction : t));

        // Log audit action
        if (user) {
            await logAuditAction(user.id, 'update', 'transaction', id, data.description || 'Transaksi');
        }

        return { data: mappedTransaction };
    };

    const deleteTransaction = async (id: string) => {
        // Get transaction details first to update balance
        const transaction = transactions.find(t => t.id === id);

        if (!transaction) return { error: 'Transaction not found' };

        // Get current account balance
        const { data: accountData, error: accountError } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', transaction.account_id)
            .single();

        if (accountError) return { error: accountError.message };

        // Calculate new balance (reverse the transaction effect)
        const currentBalance = Number(accountData.balance);
        const balanceChange = transaction.type === 'income' ? -Number(transaction.amount) : Number(transaction.amount);
        const newBalance = currentBalance + balanceChange;

        // Delete the transaction
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) return { error: error.message };

        // Update account balance
        await supabase
            .from('accounts')
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq('id', transaction.account_id);

        setTransactions(prev => prev.filter(t => t.id !== id));

        // Log audit action
        if (user) {
            await logAuditAction(user.id, 'delete', 'transaction', id, transaction.description || 'Transaksi');
        }

        return { success: true };
    };

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
        transactions,
        isLoading,
        error,
        refetch: fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        totalIncome,
        totalExpenses,
    };
};
