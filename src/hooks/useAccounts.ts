import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logAuditAction } from './useAuditLogs';
import type { Account } from '../types';

export const useAccounts = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        if (!user) {
            setAccounts([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) throw error;

            setAccounts(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching accounts:', err);
            setError('Failed to load accounts');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const addAccount = async (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('accounts')
            .insert({ ...account, user_id: user.id })
            .select()
            .single();

        if (error) return { error: error.message };

        setAccounts(prev => [...prev, data]);

        // Log audit action
        await logAuditAction(user.id, 'create', 'account', data.id, account.name);

        return { data };
    };

    const updateAccount = async (id: string, updates: Partial<Account>) => {
        const { data, error } = await supabase
            .from('accounts')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) return { error: error.message };

        setAccounts(prev => prev.map(a => a.id === id ? data : a));

        // Log audit action
        if (user) {
            await logAuditAction(user.id, 'update', 'account', id, data.name);
        }

        return { data };
    };

    const deleteAccount = async (id: string) => {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id);

        if (error) return { error: error.message };

        const account = accounts.find(a => a.id === id);
        setAccounts(prev => prev.filter(a => a.id !== id));

        // Log audit action
        if (user) {
            await logAuditAction(user.id, 'delete', 'account', id, account?.name || 'Akun');
        }

        return { success: true };
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    return {
        accounts,
        isLoading,
        error,
        refetch: fetchAccounts,
        addAccount,
        updateAccount,
        deleteAccount,
        totalBalance,
    };
};
