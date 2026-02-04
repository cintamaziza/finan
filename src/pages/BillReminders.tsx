import React, { useState } from 'react';
import {
    Plus,
    Calendar,
    Bell,
    CheckCircle2,
    Clock,
    AlertTriangle,
    MoreVertical,
    Edit,
    Trash2,
    Loader2,
    DollarSign,
    RefreshCw
} from 'lucide-react';
import { Card, CardHeader, Button, Modal, Input, Badge } from '../components/ui';
import { formatCurrency, classNames } from '../lib/utils';
import { useBillReminders, useCategories } from '../hooks';
import type { BillReminder } from '../types';

const frequencyLabels: Record<string, string> = {
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    quarterly: 'Triwulan',
    yearly: 'Tahunan',
};

const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const getDueStatus = (dueDate: string, isPaid: boolean): { label: string; variant: 'success' | 'warning' | 'error' | 'info' } => {
    if (isPaid) return { label: 'Lunas', variant: 'success' };

    const days = getDaysUntilDue(dueDate);
    if (days < 0) return { label: `Terlambat ${Math.abs(days)} hari`, variant: 'error' };
    if (days === 0) return { label: 'Jatuh tempo hari ini', variant: 'warning' };
    if (days <= 3) return { label: `${days} hari lagi`, variant: 'warning' };
    return { label: `${days} hari lagi`, variant: 'info' };
};

export const BillReminders: React.FC = () => {
    const {
        bills,
        isLoading,
        addBill,
        updateBill,
        deleteBill,
        markAsPaid,
        markAsUnpaid,
        upcomingBills,
        overdueBills,
        totalDueThisMonth
    } = useBillReminders();
    const { categories } = useCategories();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBill, setSelectedBill] = useState<BillReminder | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        frequency: 'monthly' as BillReminder['frequency'],
        category_id: '',
        is_paid: false,
        auto_pay: false,
    });

    const resetForm = () => {
        setFormData({
            name: '',
            amount: '',
            due_date: new Date().toISOString().split('T')[0],
            frequency: 'monthly',
            category_id: '',
            is_paid: false,
            auto_pay: false,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await addBill({
            name: formData.name,
            amount: parseFloat(formData.amount) || 0,
            due_date: formData.due_date,
            frequency: formData.frequency,
            category_id: formData.category_id || null,
            is_paid: formData.is_paid,
            auto_pay: formData.auto_pay,
        });

        setIsSubmitting(false);
        setIsAddModalOpen(false);
        resetForm();
    };

    const handleEdit = (bill: BillReminder) => {
        setSelectedBill(bill);
        setFormData({
            name: bill.name,
            amount: String(bill.amount),
            due_date: bill.due_date,
            frequency: bill.frequency,
            category_id: bill.category_id || '',
            is_paid: bill.is_paid,
            auto_pay: bill.auto_pay,
        });
        setIsEditModalOpen(true);
        setOpenDropdown(null);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBill) return;

        setIsSubmitting(true);
        await updateBill(selectedBill.id, {
            name: formData.name,
            amount: parseFloat(formData.amount) || 0,
            due_date: formData.due_date,
            frequency: formData.frequency,
            category_id: formData.category_id || null,
            is_paid: formData.is_paid,
            auto_pay: formData.auto_pay,
        });

        setIsSubmitting(false);
        setIsEditModalOpen(false);
        setSelectedBill(null);
        resetForm();
    };

    const handleDeleteClick = (bill: BillReminder) => {
        setSelectedBill(bill);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedBill) return;

        setIsSubmitting(true);
        await deleteBill(selectedBill.id);
        setIsSubmitting(false);
        setIsDeleteModalOpen(false);
        setSelectedBill(null);
    };

    const handleTogglePaid = async (bill: BillReminder) => {
        if (bill.is_paid) {
            await markAsUnpaid(bill.id);
        } else {
            await markAsPaid(bill.id);
        }
        setOpenDropdown(null);
    };

    const filteredBills = bills.filter(bill => {
        if (filter === 'unpaid') return !bill.is_paid;
        if (filter === 'paid') return bill.is_paid;
        return true;
    });

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
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Tagihan</h1>
                    <p className="text-[var(--color-text-muted)]">
                        Kelola pengingat tagihan dan pembayaran rutin
                    </p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Plus size={18} />}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Tambah Tagihan
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Total Tagihan Bulan Ini</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalDueThisMonth)}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-center">
                            <Clock size={24} className="text-[var(--color-warning)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Segera Jatuh Tempo</p>
                            <p className="text-xl font-bold text-[var(--color-warning)]">
                                {upcomingBills.length} tagihan
                            </p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-error)]/10 flex items-center justify-center">
                            <AlertTriangle size={24} className="text-[var(--color-error)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Terlambat</p>
                            <p className="text-xl font-bold text-[var(--color-error)]">
                                {overdueBills.length} tagihan
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {(['all', 'unpaid', 'paid'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={classNames(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            filter === f
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-secondary)] text-[var(--color-text-muted)] hover:bg-[var(--color-secondary-dark)]'
                        )}
                    >
                        {f === 'all' ? 'Semua' : f === 'unpaid' ? 'Belum Lunas' : 'Lunas'}
                    </button>
                ))}
            </div>

            {/* Bills List */}
            <Card>
                <CardHeader title="Daftar Tagihan" subtitle={`${filteredBills.length} tagihan`} />

                {filteredBills.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell size={48} className="mx-auto text-[var(--color-text-muted)] mb-4 opacity-50" />
                        <p className="text-[var(--color-text-muted)]">
                            {filter === 'all' ? 'Belum ada tagihan' : `Tidak ada tagihan ${filter === 'unpaid' ? 'yang belum lunas' : 'yang sudah lunas'}`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredBills.map((bill) => {
                            const status = getDueStatus(bill.due_date, bill.is_paid);

                            return (
                                <div
                                    key={bill.id}
                                    className={classNames(
                                        'flex items-center justify-between p-4 rounded-xl border transition-all',
                                        bill.is_paid
                                            ? 'border-[var(--color-border)] bg-[var(--color-secondary)]/50'
                                            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleTogglePaid(bill)}
                                            className={classNames(
                                                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                                                bill.is_paid
                                                    ? 'bg-[var(--color-accent)] text-white'
                                                    : 'border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10'
                                            )}
                                        >
                                            {bill.is_paid && <CheckCircle2 size={20} />}
                                        </button>
                                        <div>
                                            <p className={classNames(
                                                'font-medium',
                                                bill.is_paid && 'line-through text-[var(--color-text-muted)]'
                                            )}>
                                                {bill.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                                                <Calendar size={14} />
                                                <span>{new Date(bill.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                {bill.auto_pay && (
                                                    <>
                                                        <span>•</span>
                                                        <RefreshCw size={14} />
                                                        <span>{frequencyLabels[bill.frequency]}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(bill.amount)}</p>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === bill.id ? null : bill.id)}
                                                className="p-2 hover:bg-[var(--color-secondary)] rounded-lg"
                                            >
                                                <MoreVertical size={18} className="text-[var(--color-text-muted)]" />
                                            </button>
                                            {openDropdown === bill.id && (
                                                <div className="absolute right-0 top-10 bg-white shadow-lg border border-[var(--color-border)] rounded-lg py-1 z-10 min-w-[150px]">
                                                    <button
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-2"
                                                        onClick={() => handleTogglePaid(bill)}
                                                    >
                                                        <CheckCircle2 size={16} className="text-[var(--color-text-muted)]" />
                                                        {bill.is_paid ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
                                                    </button>
                                                    <button
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-2"
                                                        onClick={() => handleEdit(bill)}
                                                    >
                                                        <Edit size={16} className="text-[var(--color-text-muted)]" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-2 text-[var(--color-error)]"
                                                        onClick={() => handleDeleteClick(bill)}
                                                    >
                                                        <Trash2 size={16} />
                                                        Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Add Bill Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); resetForm(); }}
                title="Tambah Tagihan Baru"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Nama Tagihan"
                        placeholder="contoh: Listrik PLN"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Jumlah"
                        type="number"
                        placeholder="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />

                    <Input
                        label="Tanggal Jatuh Tempo"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Frekuensi
                        </label>
                        <select
                            className="input w-full"
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as BillReminder['frequency'] })}
                        >
                            <option value="weekly">Mingguan</option>
                            <option value="monthly">Bulanan</option>
                            <option value="quarterly">Triwulan</option>
                            <option value="yearly">Tahunan</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Kategori (Opsional)
                        </label>
                        <select
                            className="input w-full"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        >
                            <option value="">Pilih kategori</option>
                            {categories.filter(c => c.type === 'expense').map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.auto_pay}
                            onChange={(e) => setFormData({ ...formData, auto_pay: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="text-sm text-[var(--color-text)]">Pembayaran otomatis (auto-debit)</span>
                    </label>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" isLoading={isSubmitting}>
                            Tambah Tagihan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Bill Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedBill(null); resetForm(); }}
                title="Edit Tagihan"
                size="md"
            >
                <form onSubmit={handleEditSubmit} className="space-y-5">
                    <Input
                        label="Nama Tagihan"
                        placeholder="contoh: Listrik PLN"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Jumlah"
                        type="number"
                        placeholder="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />

                    <Input
                        label="Tanggal Jatuh Tempo"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Frekuensi
                        </label>
                        <select
                            className="input w-full"
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as BillReminder['frequency'] })}
                        >
                            <option value="weekly">Mingguan</option>
                            <option value="monthly">Bulanan</option>
                            <option value="quarterly">Triwulan</option>
                            <option value="yearly">Tahunan</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Kategori (Opsional)
                        </label>
                        <select
                            className="input w-full"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        >
                            <option value="">Pilih kategori</option>
                            {categories.filter(c => c.type === 'expense').map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.auto_pay}
                            onChange={(e) => setFormData({ ...formData, auto_pay: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="text-sm text-[var(--color-text)]">Pembayaran otomatis (auto-debit)</span>
                    </label>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => { setIsEditModalOpen(false); setSelectedBill(null); resetForm(); }}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" isLoading={isSubmitting}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSelectedBill(null); }}
                title="Hapus Tagihan"
                size="sm"
            >
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-[var(--color-error)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                        Yakin ingin menghapus?
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        Tagihan <strong>"{selectedBill?.name}"</strong> akan dihapus permanen.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="ghost" onClick={() => { setIsDeleteModalOpen(false); setSelectedBill(null); }}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm} isLoading={isSubmitting}>
                            Hapus Tagihan
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BillReminders;
