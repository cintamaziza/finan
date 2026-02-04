import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (dateString: string, formatStr: string = 'MMM d, yyyy'): string => {
    return format(parseISO(dateString), formatStr);
};

export const getRelativeDate = (dateString: string): string => {
    const date = parseISO(dateString);

    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    if (isThisMonth(date)) return format(date, 'MMM d');
    return format(date, 'MMM d, yyyy');
};

export const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
};

export const calculatePercentage = (current: number, total: number): number => {
    if (total === 0) return 0;
    return Math.min((current / total) * 100, 100);
};

export const getProgressColor = (percentage: number): string => {
    if (percentage < 50) return 'var(--color-accent)';
    if (percentage < 80) return 'var(--color-warning)';
    return 'var(--color-error)';
};

export const getBudgetStatus = (spent: number, budget: number): 'success' | 'warning' | 'error' => {
    const percentage = (spent / budget) * 100;
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'error';
};

export const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
    return classes.filter(Boolean).join(' ');
};

export const truncate = (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
};

export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
};
