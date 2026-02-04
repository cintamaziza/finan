import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Category } from '../types';

export const useCategories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        if (!user) {
            setCategories([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .or(`user_id.eq.${user.id},is_default.eq.true`)
                .order('name');

            if (error) throw error;

            setCategories(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (category: Omit<Category, 'id' | 'user_id'>) => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('categories')
            .insert({ ...category, user_id: user.id })
            .select()
            .single();

        if (error) return { error: error.message };

        setCategories(prev => [...prev, data]);
        return { data };
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) return { error: error.message };

        setCategories(prev => prev.map(c => c.id === id ? data : c));
        return { data };
    };

    const deleteCategory = async (id: string) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) return { error: error.message };

        setCategories(prev => prev.filter(c => c.id !== id));
        return { success: true };
    };

    return {
        categories,
        isLoading,
        error,
        refetch: fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        incomeCategories: categories.filter(c => c.type === 'income'),
        expenseCategories: categories.filter(c => c.type === 'expense'),
    };
};
