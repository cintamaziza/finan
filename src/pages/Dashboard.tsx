import React from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
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
    Cell
} from 'recharts';
import { Card, CardHeader, Progress, Badge, Button } from '../components/ui';
import { formatCurrency, getRelativeDate } from '../lib/utils';
import { useDashboard } from '../hooks';

const StatCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    iconBg: string;
}> = ({ title, value, change, icon: Icon, iconBg }) => (
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
);

export const Dashboard: React.FC = () => {
    const { stats, monthlyChartData, categoryChartData, previousMonthStats, isLoading } = useDashboard();

    // Get current month name
    const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

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
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
                    <p className="text-[var(--color-text-muted)]">
                        Ringkasan keuangan Anda untuk {currentMonth}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" leftIcon={<Calendar size={18} />}>
                        Bulan Ini
                    </Button>
                    <Link to="/transactions">
                        <Button variant="primary" leftIcon={<Plus size={18} />}>
                            Tambah Transaksi
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Balance"
                    value={formatCurrency(dashboardData.totalBalance)}
                    icon={Wallet}
                    iconBg="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)]"
                />
                <StatCard
                    title="Monthly Income"
                    value={formatCurrency(dashboardData.monthlyIncome)}
                    change={previousMonthStats?.income ? parseFloat(incomeChange.toFixed(1)) : undefined}
                    icon={TrendingUp}
                    iconBg="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)]"
                />
                <StatCard
                    title="Monthly Expenses"
                    value={formatCurrency(dashboardData.monthlyExpenses)}
                    change={previousMonthStats?.expenses ? parseFloat(expenseChange.toFixed(1)) : undefined}
                    icon={TrendingDown}
                    iconBg="bg-gradient-to-br from-[var(--color-error)] to-[var(--color-error-light)]"
                />
                <StatCard
                    title="Savings Rate"
                    value={`${dashboardData.savingsRate.toFixed(1)}%`}
                    change={savingsRateChange !== undefined ? parseFloat(savingsRateChange.toFixed(1)) : undefined}
                    icon={PiggyBank}
                    iconBg="bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning-light)]"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Spending Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Income vs Expenses"
                        subtitle="Last 6 months overview"
                        action={
                            <button className="p-2 hover:bg-[var(--color-secondary)] rounded-lg">
                                <MoreHorizontal size={20} className="text-[var(--color-text-muted)]" />
                            </button>
                        }
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
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="var(--color-text-muted)"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="var(--color-text-muted)"
                                        fontSize={12}
                                        tickFormatter={(value) => `$${value / 1000}k`}
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
                                        name="Income"
                                        stroke="var(--color-accent)"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorIncome)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expenses"
                                        name="Expenses"
                                        stroke="var(--color-error)"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorExpenses)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                                No transaction data available
                            </div>
                        )}
                    </div>
                </Card>

                {/* Spending by Category */}
                <Card>
                    <CardHeader
                        title="Spending by Category"
                        subtitle="This month"
                    />
                    <div className="h-48 flex items-center justify-center">
                        {categoryChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={categoryChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {categoryChartData.map((entry: { name: string; value: number; color: string }, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
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
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-[var(--color-text-muted)]">
                                No expense data this month
                            </div>
                        )}
                    </div>
                    <div className="mt-4 space-y-2">
                        {categoryChartData.slice(0, 4).map((category: { name: string; value: number; color: string }, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span className="text-[var(--color-text-muted)]">{category.name}</span>
                                </div>
                                <span className="font-medium">{formatCurrency(category.value)}</span>
                            </div>
                        ))}
                    </div>

                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Recent Transactions"
                        action={
                            <Link to="/transactions" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                                View all <ChevronRight size={16} />
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
                        title="Budget Progress"
                        action={
                            <Link to="/budgets" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                                Manage <ChevronRight size={16} />
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
                    title="Financial Goals"
                    subtitle="Track your progress towards your financial objectives"
                    action={
                        <Link to="/goals">
                            <Button variant="secondary" size="sm" rightIcon={<ChevronRight size={16} />}>
                                View All Goals
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
                                            Due: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No deadline'}
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
