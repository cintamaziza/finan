import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronRight,
    Loader2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { Card, CardHeader, Progress, Badge, Button } from '../components/ui';
import { formatCurrency, getRelativeDate } from '../lib/utils';
import { useDashboard } from '../hooks';
import { useTranslation } from '../hooks/useTranslation';

const StatCard = memo<{
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    iconBg: string;
}>(({ title, value, change, icon: Icon, iconBg }) => (
    <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-[var(--color-text-muted)] mb-1">{title}</p>
                <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-error)]'}`}>
                        {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        <span>{Math.abs(change)}% from last month</span>
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </Card>
));

StatCard.displayName = 'StatCard';

const formatAxisCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
    return value.toString();
};

export const Dashboard: React.FC = () => {
    const { stats, monthlyChartData, categoryChartData, previousMonthStats, isLoading } = useDashboard();
    const { t, language } = useTranslation();

    // Get current month name
    const currentMonth = new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });

    // Calculate percentage changes from previous month
    const incomeChange = previousMonthStats && previousMonthStats.income > 0
        ? ((stats?.monthlyIncome || 0) - previousMonthStats.income) / previousMonthStats.income * 100
        : 0;
    const expenseChange = previousMonthStats && previousMonthStats.expenses > 0
        ? ((stats?.monthlyExpenses || 0) - previousMonthStats.expenses) / previousMonthStats.expenses * 100
        : 0;

    // Calculate previous month savings rate for comparison
    const prevSavingsRate = previousMonthStats && previousMonthStats.income > 0
        ? ((previousMonthStats.income - previousMonthStats.expenses) / previousMonthStats.income) * 100
        : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const dashboardData = stats || {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
        recentTransactions: [],
        upcomingBills: [],
        budgetProgress: [],
        goalProgress: [],
    };

    // Calculate savings rate change (must be after dashboardData is defined)
    const savingsRateChange = prevSavingsRate > 0
        ? (dashboardData.savingsRate - prevSavingsRate)
        : undefined;

    return (
        <div className="space-y-6 animate-fade-in mb-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('nav.dashboard')}</h1>
                    <p className="text-[var(--color-text-muted)]">
                        {currentMonth}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" leftIcon={<Calendar size={18} />}>
                        {currentMonth}
                    </Button>
                    <Link to="/transactions">
                        <Button variant="primary" leftIcon={<Plus size={18} />}>
                            {t('settings.addCategory').replace('Category', 'Transaction')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('dash.totalBalance')}
                    value={formatCurrency(dashboardData.totalBalance)}
                    icon={Wallet}
                    iconBg="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)]"
                />
                <StatCard
                    title={t('dash.monthlyIncome')}
                    value={formatCurrency(dashboardData.monthlyIncome)}
                    change={previousMonthStats?.income ? parseFloat(incomeChange.toFixed(1)) : undefined}
                    icon={TrendingUp}
                    iconBg="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)]"
                />
                <StatCard
                    title={t('dash.monthlyExpenses')}
                    value={formatCurrency(dashboardData.monthlyExpenses)}
                    change={previousMonthStats?.expenses ? parseFloat(expenseChange.toFixed(1)) : undefined}
                    icon={TrendingDown}
                    iconBg="bg-gradient-to-br from-[var(--color-error)] to-[var(--color-error-light)]"
                />
                <StatCard
                    title={t('dash.savingsRate')}
                    value={`${dashboardData.savingsRate.toFixed(1)}%`}
                    change={savingsRateChange !== undefined ? parseFloat(savingsRateChange.toFixed(1)) : undefined}
                    icon={PiggyBank}
                    iconBg="bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning-light)]"
                />
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly Comparison Bar Chart */}
                <Card>
                    <CardHeader title={t('dash.monthlyComparison')} subtitle={`${t('dash.income')} vs ${t('dash.expense')}`} />
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis
                                    stroke="var(--color-text-muted)"
                                    fontSize={12}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={formatAxisCurrency}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--color-border)', opacity: 0.1 }}
                                    contentStyle={{
                                        backgroundColor: 'var(--color-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    formatter={(value) => formatCurrency(value as number)}
                                />
                                <Legend />
                                <Bar name={t('dash.income')} dataKey="income" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                                <Bar name={t('dash.expense')} dataKey="expenses" fill="var(--color-error)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Spending by Category Pie Chart */}
                <Card>
                    <CardHeader
                        title={t('dash.spendingByCategory')}
                        subtitle={currentMonth}
                    />
                    <div className="h-72 flex items-center justify-center">
                        {categoryChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={categoryChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryChartData.map((entry: { name: string; value: number; color: string }, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-bg)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value) => formatCurrency(value as number)}
                                    />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-[var(--color-text-muted)]">
                                {t('dash.noTransactions')}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Income vs Expenses Trend Area Chart (Full Width) */}
            <Card>
                <CardHeader
                    title={t('dash.incomeVsExpense')}
                    subtitle="6 Months Trend"
                />
                <div className="h-72">
                    {monthlyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={monthlyChartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="var(--color-text-muted)"
                                    fontSize={12}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="var(--color-text-muted)"
                                    fontSize={12}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={formatAxisCurrency}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--color-bg)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value) => formatCurrency(value as number)}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    name={t('dash.income')}
                                    stroke="var(--color-accent)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    name={t('dash.expense')}
                                    stroke="var(--color-error)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpenses)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                            {t('dash.noTransactions')}
                        </div>
                    )}
                </div>
            </Card>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title={t('dash.recentTransactions')}
                        action={
                            <Link to="/transactions" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                                {t('dash.viewAll')} <ChevronRight size={16} />
                            </Link>
                        }
                    />
                    <div className="space-y-3">
                        {dashboardData.recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-3 hover:bg-[var(--color-secondary)] rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${transaction.category?.color}20` }}
                                    >
                                        {transaction.type === 'income' ? (
                                            <ArrowDownRight size={20} style={{ color: transaction.category?.color }} />
                                        ) : (
                                            <ArrowUpRight size={20} style={{ color: transaction.category?.color }} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--color-text)]">{transaction.description}</p>
                                        <p className="text-sm text-[var(--color-text-muted)]">
                                            {transaction.category?.name} • {getRelativeDate(transaction.date)}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-semibold ${transaction.type === 'income'
                                    ? 'text-[var(--color-accent)]'
                                    : 'text-[var(--color-text)]'
                                    }`}>
                                    {transaction.type === 'income' ? '+' : '-'}
                                    {formatCurrency(transaction.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Budget Progress */}
                <Card>
                    <CardHeader
                        title={t('nav.budget')}
                        action={
                            <Link to="/budgets" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                                {t('dash.viewAll')} <ChevronRight size={16} />
                            </Link>
                        }
                    />
                    <div className="space-y-5">
                        {dashboardData.budgetProgress.map((budget) => {
                            const percentage = (budget.spent / budget.amount) * 100;
                            return (
                                <div key={budget.id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-[var(--color-text)]">
                                            {budget.category?.name}
                                        </span>
                                        <span className="text-sm text-[var(--color-text-muted)]">
                                            {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={budget.spent}
                                        max={budget.amount}
                                        variant="auto"
                                        size="md"
                                    />
                                    {percentage > 90 && (
                                        <Badge variant="error" size="sm" className="mt-2">
                                            Over budget soon
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Goals Section */}
            <Card>
                <CardHeader
                    title={t('nav.goals')}
                    subtitle="Track your progress towards your financial objectives"
                    action={
                        <Link to="/goals">
                            <Button variant="secondary" size="sm" rightIcon={<ChevronRight size={16} />}>
                                {t('dash.viewAll')}
                            </Button>
                        </Link>
                    }
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.goalProgress.map((goal) => {
                        return (
                            <div
                                key={goal.id}
                                className="p-4 bg-[var(--color-secondary)] rounded-xl hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: goal.color }}
                                    >
                                        <PiggyBank size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--color-text)]">{goal.name}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            Due: {goal.deadline ? new Date(goal.deadline).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: 'numeric' }) : 'No deadline'}
                                        </p>
                                    </div>
                                </div>
                                <Progress
                                    value={goal.current_amount}
                                    max={goal.target_amount}
                                    variant="primary"
                                    size="lg"
                                    showLabel
                                    label={`${formatCurrency(goal.current_amount)} of ${formatCurrency(goal.target_amount)}`}
                                />
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
