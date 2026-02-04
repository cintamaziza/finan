import { useMemo } from 'react';
import { useBillReminders } from './useBillReminders';
import { useBudgets } from './useBudgets';
import { useGoals } from './useGoals';

export interface NotificationAlert {
    id: string;
    type: 'bill_due' | 'bill_overdue' | 'budget_warning' | 'budget_exceeded' | 'goal_milestone';
    title: string;
    message: string;
    date: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    link?: string;
}

export const useNotificationAlerts = () => {
    const { bills, isLoading: billsLoading } = useBillReminders();
    const { budgets, isLoading: budgetsLoading } = useBudgets();
    const { goals, isLoading: goalsLoading } = useGoals();

    const alerts = useMemo(() => {
        const notifications: NotificationAlert[] = [];
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Check overdue bills
        bills.forEach(bill => {
            if (bill.is_paid) return;
            const dueDate = new Date(bill.due_date);
            const dueDateStr = bill.due_date;

            if (dueDate < now && dueDateStr < today) {
                notifications.push({
                    id: `bill-overdue-${bill.id}`,
                    type: 'bill_overdue',
                    title: 'Tagihan Terlambat',
                    message: `${bill.name} sudah jatuh tempo!`,
                    date: bill.due_date,
                    severity: 'error',
                    link: '/bills',
                });
            } else {
                // Check bills due within 3 days
                const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (daysUntilDue >= 0 && daysUntilDue <= 3) {
                    notifications.push({
                        id: `bill-due-${bill.id}`,
                        type: 'bill_due',
                        title: daysUntilDue === 0 ? 'Tagihan Jatuh Tempo Hari Ini' : 'Tagihan Segera Jatuh Tempo',
                        message: daysUntilDue === 0
                            ? `${bill.name} jatuh tempo hari ini!`
                            : `${bill.name} jatuh tempo dalam ${daysUntilDue} hari`,
                        date: bill.due_date,
                        severity: daysUntilDue === 0 ? 'warning' : 'info',
                        link: '/bills',
                    });
                }
            }
        });

        // Check budget warnings (>80% spent) and exceeded budgets
        budgets.forEach(budget => {
            const spent = budget.spent || 0;
            const limit = Number(budget.amount);
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const categoryName = budget.category?.name || 'Kategori';

            if (percentage >= 100) {
                notifications.push({
                    id: `budget-exceeded-${budget.id}`,
                    type: 'budget_exceeded',
                    title: 'Anggaran Terlampaui',
                    message: `${categoryName} telah melampaui batas (${percentage.toFixed(0)}%)`,
                    date: new Date().toISOString().split('T')[0],
                    severity: 'error',
                    link: '/budgets',
                });
            } else if (percentage >= 80) {
                notifications.push({
                    id: `budget-warning-${budget.id}`,
                    type: 'budget_warning',
                    title: 'Peringatan Anggaran',
                    message: `${categoryName} hampir mencapai batas (${percentage.toFixed(0)}%)`,
                    date: new Date().toISOString().split('T')[0],
                    severity: 'warning',
                    link: '/budgets',
                });
            }
        });

        // Check goal milestones (50%, 75%, 100%)
        goals.forEach(goal => {
            const current = Number(goal.current_amount);
            const target = Number(goal.target_amount);
            const percentage = target > 0 ? (current / target) * 100 : 0;

            if (percentage >= 100) {
                notifications.push({
                    id: `goal-complete-${goal.id}`,
                    type: 'goal_milestone',
                    title: 'Target Tercapai! 🎉',
                    message: `Selamat! ${goal.name} telah tercapai!`,
                    date: new Date().toISOString().split('T')[0],
                    severity: 'success',
                    link: '/goals',
                });
            }
        });

        // Sort by severity (error first, then warning, then info, then success)
        const severityOrder = { error: 0, warning: 1, info: 2, success: 3 };
        return notifications.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }, [bills, budgets, goals]);

    return {
        alerts,
        isLoading: billsLoading || budgetsLoading || goalsLoading,
        unreadCount: alerts.length,
    };
};
