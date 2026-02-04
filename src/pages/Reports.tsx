import React, { useState, useMemo } from 'react';
import {
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    PieChart,
    BarChart3,
    ArrowUpRight,
    Loader2,
    FileText,
    ChevronDown
} from 'lucide-react';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from 'recharts';
import { Card, CardHeader, Button, Badge, Input } from '../components/ui';
import { formatCurrency, classNames } from '../lib/utils';
import { useTransactions, useCategories, useAccounts, useGoals, useBillReminders, useBudgets } from '../hooks';
import { useTranslation } from '../hooks/useTranslation';
import { useSettings } from '../context/SettingsContext';
import { exportTransactions, exportAccounts, exportGoals, exportBills, exportBudgets, exportAllData, exportReportToPDF } from '../lib/export';

export const Reports: React.FC = () => {
    const { t, language } = useTranslation();
    const { settings } = useSettings();
    const [selectedReport, setSelectedReport] = useState('spending');
    const [selectedRange, setSelectedRange] = useState('last-6-months');

    const formatAxis = (value: number) => {
        if (language === 'id') {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
        } else {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        }
        return value.toString();
    };
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    // Custom date range state
    const today = new Date();
    const [customStartDate, setCustomStartDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    );
    const [customEndDate, setCustomEndDate] = useState(
        new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
    );

    const reportTypes = [
        { id: 'spending', label: t('reports.spendingOverview'), icon: TrendingDown },
        { id: 'income', label: t('reports.incomeAnalysis'), icon: TrendingUp },
        { id: 'categories', label: t('reports.categoryBreakdown'), icon: PieChart },
        { id: 'trends', label: t('reports.trends'), icon: BarChart3 },
    ];

    const dateRanges = [
        { value: 'this-month', label: t('reports.thisMonth'), months: 0 },
        { value: 'last-month', label: t('reports.lastMonth'), months: 1 },
        { value: 'last-3-months', label: t('reports.last3Months'), months: 3 },
        { value: 'last-6-months', label: t('reports.last6Months'), months: 6 },
        { value: 'this-year', label: t('reports.thisYear'), months: 12 },
        { value: 'custom', label: t('reports.custom'), months: 0 },
    ];

    const { startDate, endDate } = useMemo(() => {
        if (selectedRange === 'custom') {
            return { startDate: customStartDate, endDate: customEndDate };
        }

        const now = new Date();
        const range = dateRanges.find(r => r.value === selectedRange);
        const months = range?.months ?? 6;

        let start: Date;
        let end: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        if (selectedRange === 'this-month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (selectedRange === 'last-month') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (selectedRange === 'this-year') {
            start = new Date(now.getFullYear(), 0, 1);
        } else {
            start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
        }

        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        };
    }, [selectedRange, customStartDate, customEndDate]);

    const { transactions, isLoading, totalIncome, totalExpenses } = useTransactions({
        startDate,
        endDate,
    });
    const { categories } = useCategories();
    const { accounts } = useAccounts();
    const { goals } = useGoals();
    const { bills } = useBillReminders();
    const { budgets } = useBudgets();

    const handleExport = (type: string) => {
        switch (type) {
            case 'transactions':
                exportTransactions(transactions);
                break;
            case 'accounts':
                exportAccounts(accounts);
                break;
            case 'goals':
                exportGoals(goals);
                break;
            case 'bills':
                exportBills(bills);
                break;
            case 'budgets':
                exportBudgets(budgets);
                break;
            case 'summary':
                exportAllData(transactions, accounts, goals, bills, budgets);
                break;
            case 'pdf':
                exportReportToPDF(transactions, accounts, goals, bills, budgets);
                break;
        }
        setIsExportMenuOpen(false);
    };


    // Aggregate monthly data for charts
    const monthlySpendingData = useMemo(() => {
        const monthlyData: Record<string, { month: string; income: number; expenses: number; sortKey: string }> = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            // Correctly format month based on current language
            const monthLabel = date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: '2-digit' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthLabel, income: 0, expenses: 0, sortKey: monthKey };
            }

            if (t.type === 'income') {
                monthlyData[monthKey].income += Number(t.amount);
            } else {
                monthlyData[monthKey].expenses += Number(t.amount);
            }
        });

        // Sort by date key (YYYY-MM) but display formatted label
        return Object.values(monthlyData)
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [transactions, language]);

    // Aggregate category spending for pie chart
    const categorySpendingData = useMemo(() => {
        const categoryData: Record<string, { name: string; value: number; color: string }> = {};

        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const categoryId = t.category_id;
                const category = t.category || categories.find(c => c.id === categoryId);
                const categoryName = category?.name || 'Other';
                const categoryColor = category?.color || '#6B7280';

                if (!categoryData[categoryId]) {
                    categoryData[categoryId] = { name: categoryName, value: 0, color: categoryColor };
                }

                categoryData[categoryId].value += Number(t.amount);
            });

        return Object.values(categoryData).sort((a, b) => b.value - a.value);
    }, [transactions, categories]);

    const avgMonthlyExpenses = monthlySpendingData.length > 0
        ? totalExpenses / monthlySpendingData.length
        : 0;
    const savingsRate = totalIncome > 0
        ? ((totalIncome - totalExpenses) / totalIncome) * 100
        : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('reports.title')}</h1>
                    <p className="text-[var(--color-text-muted)]">
                        {t('reports.subtitle')}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    {selectedRange === 'custom' && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <div>
                                <Input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="!py-1.5 !px-2 text-sm max-w-[140px]"
                                />
                            </div>
                            <span className="text-[var(--color-text-muted)]">-</span>
                            <div>
                                <Input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="!py-1.5 !px-2 text-sm max-w-[140px]"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-[var(--color-text-muted)]" />
                        <select
                            value={selectedRange}
                            onChange={(e) => setSelectedRange(e.target.value)}
                            className="input !py-2 !px-3 text-sm"
                        >
                            {dateRanges.map((range) => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <Button
                            variant="secondary"
                            leftIcon={<Download size={18} />}
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        >
                            {t('reports.exportCSV')}
                            <ChevronDown size={16} className="ml-1" />
                        </Button>
                        {isExportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[var(--color-border)] py-2 z-20 animate-scale-in">
                                <button
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-3"
                                    onClick={() => handleExport('transactions')}
                                >
                                    <FileText size={18} className="text-[var(--color-text-muted)]" />
                                    <span>{t('reports.transactions')}</span>
                                </button>
                                <button
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-3"
                                    onClick={() => handleExport('accounts')}
                                >
                                    <FileText size={18} className="text-[var(--color-text-muted)]" />
                                    <span>{t('reports.accounts')}</span>
                                </button>
                                <button
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-3"
                                    onClick={() => handleExport('goals')}
                                >
                                    <FileText size={18} className="text-[var(--color-text-muted)]" />
                                    <span>{t('reports.goals')}</span>
                                </button>
                                <button
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-3"
                                    onClick={() => handleExport('bills')}
                                >
                                    <FileText size={18} className="text-[var(--color-text-muted)]" />
                                    <span>{t('reports.bills')}</span>
                                </button>
                                <button
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-3"
                                    onClick={() => handleExport('budgets')}
                                >
                                    <FileText size={18} className="text-[var(--color-text-muted)]" />
                                    <span>{t('reports.budgets')}</span>
                                </button>
                                <hr className="my-2 border-[var(--color-border)]" />
                                <button
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-3 font-medium text-[var(--color-primary)]"
                                    onClick={() => handleExport('summary')}
                                >
                                    <Download size={18} />
                                    <span>{t('reports.summaryCSV')}</span>
                                </button>
                                <button
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-3 font-medium text-[var(--color-error)]"
                                    onClick={() => handleExport('pdf')}
                                >
                                    <FileText size={18} />
                                    <span>{t('reports.reportPDF')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Type Tabs */}
            <div className="flex flex-wrap gap-2">
                {reportTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedReport(type.id)}
                        className={classNames(
                            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all',
                            selectedReport === type.id
                                ? 'bg-[var(--color-primary)] text-white shadow-md'
                                : 'bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-secondary)] border border-[var(--color-border)]'
                        )}
                    >
                        <type.icon size={18} />
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <p className="text-sm text-[var(--color-text-muted)]">{t('reports.totalIncome')}</p>
                    <p className="text-2xl font-bold text-[var(--color-accent)] mt-1">
                        {formatCurrency(totalIncome, settings.currency)}
                    </p>
                    <Badge variant="success" size="sm" className="mt-2">
                        <ArrowUpRight size={12} className="mr-1" />
                        {transactions.filter(t => t.type === 'income').length} {t('nav.transactions').toLowerCase()}
                    </Badge>
                </Card>
                <Card>
                    <p className="text-sm text-[var(--color-text-muted)]">{t('reports.totalExpenses')}</p>
                    <p className="text-2xl font-bold text-[var(--color-error)] mt-1">
                        {formatCurrency(totalExpenses, settings.currency)}
                    </p>
                    <Badge variant="error" size="sm" className="mt-2">
                        <TrendingDown size={12} className="mr-1" />
                        {transactions.filter(t => t.type === 'expense').length} {t('nav.transactions').toLowerCase()}
                    </Badge>
                </Card>
                <Card>
                    <p className="text-sm text-[var(--color-text-muted)]">{t('reports.avgMonthlyExpenses')}</p>
                    <p className="text-2xl font-bold text-[var(--color-text)] mt-1">
                        {formatCurrency(avgMonthlyExpenses, settings.currency)}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-[var(--color-text-muted)]">{t('reports.savingsRate')}</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)] mt-1">
                        {savingsRate.toFixed(1)}%
                    </p>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Income vs Expenses */}
                <Card>
                    <CardHeader title={t('reports.incomeVsExpenses')} subtitle={t('dash.monthlyComparison')} />
                    <div className="h-72">
                        {monthlySpendingData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={monthlySpendingData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={formatAxis} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-bg)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value) => formatCurrency(value as number, settings.currency)}
                                        labelStyle={{ color: 'var(--color-text)' }}
                                    />
                                    <Bar dataKey="income" name={t('dash.income')} fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" name={t('dash.expense')} fill="var(--color-error)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                                {t('reports.noData')}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Spending by Category */}
                <Card>
                    <CardHeader title={t('reports.categoryBreakdown')} subtitle={t('reports.categoryDetails')} />
                    <div className="h-72">
                        {categorySpendingData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <RechartsPieChart>
                                    <Pie
                                        data={categorySpendingData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                        labelLine={false}
                                    >
                                        {categorySpendingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value as number, settings.currency)} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                                {t('reports.noData')}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Spending Trend */}
                <Card className="lg:col-span-2">
                    <CardHeader title={t('reports.spendingTrend')} subtitle={t('dash.monthlyExpenses')} />
                    <div className="h-72">
                        {monthlySpendingData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <AreaChart data={monthlySpendingData}>
                                    <defs>
                                        <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={formatAxis} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-bg)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value) => formatCurrency(value as number, settings.currency)}
                                        labelStyle={{ color: 'var(--color-text)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expenses"
                                        name={t('dash.expense')}
                                        stroke="var(--color-primary)"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorSpending)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                                {t('reports.noData')}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Category Breakdown Table */}
            <Card>
                <CardHeader title={t('reports.categoryDetails')} subtitle={t('reports.categoryBreakdown')} />
                <div className="overflow-x-auto">
                    {categorySpendingData.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">Category</th>
                                    <th className="text-right p-4 text-sm font-medium text-[var(--color-text-muted)]">Amount</th>
                                    <th className="text-right p-4 text-sm font-medium text-[var(--color-text-muted)]">% of Total</th>
                                    <th className="text-right p-4 text-sm font-medium text-[var(--color-text-muted)]">Transactions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorySpendingData.map((category, i) => {
                                    const total = categorySpendingData.reduce((sum, c) => sum + c.value, 0);
                                    const pct = (category.value / total) * 100;
                                    const txCount = transactions.filter(t =>
                                        t.type === 'expense' && t.category?.name === category.name
                                    ).length;
                                    return (
                                        <tr key={i} className="border-b border-[var(--color-border)] hover:bg-[var(--color-secondary)]">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className="font-medium text-[var(--color-text)]">{category.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-medium">{formatCurrency(category.value, settings.currency)}</td>
                                            <td className="p-4 text-right text-[var(--color-text-muted)]">{pct.toFixed(1)}%</td>
                                            <td className="p-4 text-right">
                                                <Badge variant="info" size="sm">
                                                    {txCount}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-[var(--color-text-muted)]">
                            {t('reports.noData')}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Reports;

