import React, { useState } from 'react';
import {
    Plus,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Edit,
    Trash2,
    Loader2
} from 'lucide-react';
import { Card, Button, Progress, Badge, Modal, Input } from '../components/ui';
import { formatCurrency, classNames } from '../lib/utils';
import { useBudgets, useCategories } from '../hooks';

export const Budgets: React.FC = () => {
    const { budgets, isLoading, addBudget, deleteBudget } = useBudgets();
    const { expenseCategories } = useCategories();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        category_id: '',
        amount: '',
        period: 'monthly' as 'monthly' | 'yearly',
        start_date: new Date().toISOString().split('T')[0],
    });

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const remaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const getStatus = (spent: number, amount: number) => {
        const pct = (spent / amount) * 100;
        if (pct < 50) return { label: 'Aman', variant: 'success' as const, icon: CheckCircle2 };
        if (pct < 80) return { label: 'Perhatian', variant: 'warning' as const, icon: AlertTriangle };
        return { label: 'Melebihi', variant: 'error' as const, icon: AlertTriangle };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await addBudget({
            category_id: formData.category_id,
            amount: parseFloat(formData.amount),
            period: formData.period,
            start_date: formData.start_date,
        });

        setIsSubmitting(false);
        setIsAddModalOpen(false);
        setFormData({
            category_id: '',
            amount: '',
            period: 'monthly',
            start_date: new Date().toISOString().split('T')[0],
        });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus anggaran ini?')) {
            await deleteBudget(id);
        }
    };

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
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Anggaran</h1>
                    <p className="text-[var(--color-text-muted)]">
                        Tetapkan dan lacak batas pengeluaran per kategori
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
                        {(['monthly', 'yearly'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={classNames(
                                    'px-4 py-2 text-sm font-medium transition-colors',
                                    selectedPeriod === period
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-secondary)]'
                                )}
                            >
                                {period === 'monthly' ? 'Bulanan' : 'Tahunan'}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={18} />}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Buat Anggaran
                    </Button>
                </div>
            </div>

            {/* Overview Card */}
            <Card className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
                <div className="grid sm:grid-cols-3 gap-6">
                    <div>
                        <p className="text-white/80 text-sm">Total Anggaran</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(totalBudget)}</p>
                        <p className="text-sm text-white/60 mt-1">untuk {currentMonth}</p>
                    </div>
                    <div>
                        <p className="text-white/80 text-sm">Total Terpakai</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
                        <p className="text-sm text-white/60 mt-1">{overallPercentage.toFixed(0)}% dari anggaran</p>
                    </div>
                    <div>
                        <p className="text-white/80 text-sm">Sisa</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(remaining)}</p>
                        <p className="text-sm text-white/60 mt-1">{(100 - overallPercentage).toFixed(0)}% tersisa</p>
                    </div>
                </div>
                <div className="mt-6">
                    <div className="flex justify-between text-sm text-white/80 mb-2">
                        <span>Progres Keseluruhan</span>
                        <span>{overallPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Budget Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                        <p className="text-[var(--color-text-muted)]">
                            Belum ada anggaran. Buat anggaran pertama Anda!
                        </p>
                    </Card>
                ) : (
                    budgets.map((budget) => {
                        const status = getStatus(budget.spent || 0, Number(budget.amount));
                        const StatusIcon = status.icon;

                        return (
                            <Card key={budget.id} hover className="group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${budget.category?.color}15` }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: budget.category?.color }}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--color-text)]">
                                                {budget.category?.name || 'Kategori'}
                                            </p>
                                            <Badge variant={status.variant} size="sm" className="mt-1">
                                                <StatusIcon size={12} className="mr-1" />
                                                {status.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-[var(--color-secondary)] rounded-lg">
                                            <Edit size={16} className="text-[var(--color-text-muted)]" />
                                        </button>
                                        <button
                                            className="p-2 hover:bg-[var(--color-error)]/10 rounded-lg"
                                            onClick={() => handleDelete(budget.id)}
                                        >
                                            <Trash2 size={16} className="text-[var(--color-error)]" />
                                        </button>
                                    </div>
                                </div>

                                <Progress
                                    value={budget.spent || 0}
                                    max={Number(budget.amount)}
                                    variant="auto"
                                    size="lg"
                                />

                                <div className="flex items-center justify-between mt-3 text-sm">
                                    <span className="text-[var(--color-text-muted)]">
                                        {formatCurrency(budget.spent || 0)} terpakai
                                    </span>
                                    <span className="font-medium text-[var(--color-text)]">
                                        {formatCurrency(Number(budget.amount) - (budget.spent || 0))} sisa
                                    </span>
                                </div>
                            </Card>
                        );
                    })
                )}

                {/* Add Budget Card */}
                <Card
                    hover
                    className="border-2 border-dashed border-[var(--color-border)] flex items-center justify-center min-h-[180px] cursor-pointer hover:border-[var(--color-primary)] group"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--color-primary)]/10 transition-colors">
                            <Plus size={24} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                        </div>
                        <p className="font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]">
                            Buat Anggaran Baru
                        </p>
                    </div>
                </Card>
            </div>

            {/* Tips Card */}
            <Card className="bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--color-text)]">Tips Anggaran</h3>
                        <p className="text-[var(--color-text-muted)] mt-1">
                            Mulai dengan membuat anggaran untuk kategori pengeluaran terbesar Anda.
                            Lacak pengeluaran secara rutin untuk tetap sesuai target.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Add Budget Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Buat Anggaran Baru"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Kategori
                        </label>
                        <select
                            className="input w-full"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            required
                        >
                            <option value="">Pilih kategori</option>
                            {expenseCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Jumlah Anggaran"
                        type="number"
                        placeholder="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        helperText="Masukkan batas maksimal yang ingin Anda keluarkan"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Periode
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, period: 'monthly' })}
                                className={classNames(
                                    'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors',
                                    formData.period === 'monthly'
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                )}
                            >
                                Bulanan
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, period: 'yearly' })}
                                className={classNames(
                                    'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors',
                                    formData.period === 'yearly'
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                )}
                            >
                                Tahunan
                            </button>
                        </div>
                    </div>

                    <Input
                        label="Tanggal Mulai"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" isLoading={isSubmitting}>
                            Buat Anggaran
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Budgets;
