import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logAuditAction } from './useAuditLogs';
import type { BillReminder } from '../types';

export const useBillReminders = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<BillReminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBills = useCallback(async () => {
        if (!user) {
            setBills([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('bill_reminders')
                .select('*')
                .eq('user_id', user.id)
                .order('due_date', { ascending: true });

            if (error) throw error;

            setBills(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching bills:', err);
            setError('Failed to load bill reminders');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const addBill = async (bill: Omit<BillReminder, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('bill_reminders')
            .insert({ ...bill, user_id: user.id })
            .select()
            .single();

        if (error) return { error: error.message };

        setBills(prev => [...prev, data].sort((a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        ));

        // Log audit action
        await logAuditAction(user.id, 'create', 'bill', data.id, bill.name);

        return { data };
    };

    const updateBill = async (id: string, updates: Partial<BillReminder>) => {
        const { data, error } = await supabase
            .from('bill_reminders')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) return { error: error.message };

        setBills(prev => prev.map(b => b.id === id ? data : b).sort((a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        ));

        // Log audit action (only for updates with name changes)
        if (user && updates.name !== undefined) {
            await logAuditAction(user.id, 'update', 'bill', id, data.name);
        }

        return { data };
    };

    const deleteBill = async (id: string) => {
        const { error } = await supabase
            .from('bill_reminders')
            .delete()
            .eq('id', id);

        if (error) return { error: error.message };

        const bill = bills.find(b => b.id === id);
        setBills(prev => prev.filter(b => b.id !== id));

        // Log audit action
        if (user) {
            await logAuditAction(user.id, 'delete', 'bill', id, bill?.name || 'Tagihan');
        }

        return { success: true };
    };

    const markAsPaid = async (id: string) => {
        return updateBill(id, { is_paid: true });
    };

    const markAsUnpaid = async (id: string) => {
        return updateBill(id, { is_paid: false });
    };

    // Get upcoming unpaid bills (next 30 days)
    const upcomingBills = bills.filter(bill => {
        if (bill.is_paid) return false;
        const dueDate = new Date(bill.due_date);
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return dueDate <= thirtyDaysLater;
    });

    // Get overdue bills
    const overdueBills = bills.filter(bill => {
        if (bill.is_paid) return false;
        return new Date(bill.due_date) < new Date();
    });

    // Get total due this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const billsDueThisMonth = bills.filter(bill => {
        const dueDate = new Date(bill.due_date);
        return !bill.is_paid && dueDate >= startOfMonth && dueDate <= endOfMonth;
    });

    const totalDueThisMonth = billsDueThisMonth.reduce((sum, bill) => sum + Number(bill.amount), 0);

    return {
        bills,
        isLoading,
        error,
        refetch: fetchBills,
        addBill,
        updateBill,
        deleteBill,
        markAsPaid,
        markAsUnpaid,
        upcomingBills,
        overdueBills,
        totalDueThisMonth,
    };
};
