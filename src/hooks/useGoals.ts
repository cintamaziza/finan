import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logAuditAction } from './useAuditLogs';
import type { Goal } from '../types';

export const useGoals = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = useCallback(async () => {
        if (!user) {
            setGoals([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('deadline', { ascending: true });

            if (error) throw error;

            setGoals(data || []);
            setError(null);
        } catch (err) {
            // Ignore AbortError (happens during component remount)
            if (err instanceof Error && err.name === 'AbortError') return;
            if (err && typeof err === 'object' && 'message' in err && String(err.message).includes('AbortError')) return;
            console.error('Error fetching goals:', err);
            setError('Failed to load goals');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const addGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('goals')
            .insert({ ...goal, user_id: user.id })
            .select()
            .single();

        if (error) return { error: error.message };

        setGoals(prev => [...prev, data]);

        // Log audit action
        await logAuditAction(user.id, 'create', 'goal', data.id, goal.name);

        return { data };
    };

    const updateGoal = async (id: string, updates: Partial<Goal>) => {
        const { data, error } = await supabase
            .from('goals')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) return { error: error.message };

        setGoals(prev => prev.map(g => g.id === id ? data : g));

        // Log audit action (only for explicit updates, not addToGoal)
        if (user && updates.name !== undefined) {
            await logAuditAction(user.id, 'update', 'goal', id, data.name);
        }

        return { data };
    };

    const deleteGoal = async (id: string) => {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

        if (error) return { error: error.message };

        const goal = goals.find(g => g.id === id);
        setGoals(prev => prev.filter(g => g.id !== id));

        // Log audit action
        if (user) {
            await logAuditAction(user.id, 'delete', 'goal', id, goal?.name || 'Target');
        }

        return { success: true };
    };

    const addToGoal = async (id: string, amount: number) => {
        const goal = goals.find(g => g.id === id);
        if (!goal) return { error: 'Goal not found' };

        return updateGoal(id, {
            current_amount: Number(goal.current_amount) + amount,
        });
    };

    return {
        goals,
        isLoading,
        error,
        refetch: fetchGoals,
        addGoal,
        updateGoal,
        deleteGoal,
        addToGoal,
    };
};
