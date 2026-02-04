import React, { useState } from 'react';
import {
    Plus,
    Wallet,
    CreditCard,
    Building2,
    PiggyBank,
    TrendingUp,
    MoreVertical,
    ArrowRightLeft,
    Loader2,
    Edit,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { Card, Button, Modal, Input, Badge } from '../components/ui';
import { formatCurrency, classNames } from '../lib/utils';
import { useAccounts } from '../hooks';
import type { Account } from '../types';

const accountTypeIcons: Record<string, React.ElementType> = {
    bank: Building2,
    credit_card: CreditCard,
    cash: Wallet,
    investment: TrendingUp,
    other: Wallet,
};

const accountTypeColors: Record<string, string> = {
    bank: 'var(--color-primary)',
    credit_card: 'var(--color-error)',
    cash: 'var(--color-warning)',
    investment: 'var(--color-accent)',
    other: 'var(--color-text-muted)',
};

const accountTypeLabels: Record<string, string> = {
    bank: 'Rekening Bank',
    credit_card: 'Kartu Kredit',
    cash: 'Tunai',
    investment: 'Investasi',
    other: 'Lainnya',
};

export const Accounts: React.FC = () => {
    const { accounts, isLoading, totalBalance, addAccount, updateAccount, deleteAccount } = useAccounts();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'bank' as Account['type'],
        balance: '',
        currency: 'IDR',
        color: '#1E40AF',
        icon: 'Building2',
    });

    const totalAssets = accounts.filter(a => Number(a.balance) > 0).reduce((sum, acc) => sum + Number(acc.balance), 0);
    const totalLiabilities = Math.abs(accounts.filter(a => Number(a.balance) < 0).reduce((sum, acc) => sum + Number(acc.balance), 0));

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'bank',
            balance: '',
            currency: 'IDR',
            color: '#1E40AF',
            icon: 'Building2',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await addAccount({
            name: formData.name,
            type: formData.type,
            balance: parseFloat(formData.balance) || 0,
            currency: formData.currency,
            color: formData.color,
            icon: formData.icon,
        });

        setIsSubmitting(false);
        setIsAddModalOpen(false);
        resetForm();
    };

    const handleEdit = (account: Account) => {
        setSelectedAccount(account);
        setFormData({
            name: account.name,
            type: account.type,
            balance: String(account.balance),
            currency: account.currency,
            color: account.color || '#1E40AF',
            icon: account.icon || 'Building2',
        });
        setIsEditModalOpen(true);
        setOpenDropdown(null);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccount) return;

        setIsSubmitting(true);

        await updateAccount(selectedAccount.id, {
            name: formData.name,
            type: formData.type,
            balance: parseFloat(formData.balance) || 0,
            currency: formData.currency,
            color: formData.color,
            icon: formData.icon,
        });

        setIsSubmitting(false);
        setIsEditModalOpen(false);
        setSelectedAccount(null);
        resetForm();
    };

    const handleDeleteClick = (account: Account) => {
        setSelectedAccount(account);
        setIsDeleteModalOpen(true);
        setOpenDropdown(null);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedAccount) return;

        setIsSubmitting(true);
        await deleteAccount(selectedAccount.id);
        setIsSubmitting(false);
        setIsDeleteModalOpen(false);
        setSelectedAccount(null);
    };

    const toggleDropdown = (accountId: string) => {
        setOpenDropdown(openDropdown === accountId ? null : accountId);
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
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Akun</h1>
                    <p className="text-[var(--color-text-muted)]">
                        Kelola rekening bank, kartu kredit, dan uang tunai Anda
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" leftIcon={<ArrowRightLeft size={18} />}>
                        Transfer
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={18} />}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Tambah Akun
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
                    <p className="text-white/80 text-sm">Total Kekayaan Bersih</p>
                    <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <TrendingUp size={18} className="text-white/80" />
                        <span className="text-sm text-white/80">{accounts.length} akun terhubung</span>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                            <PiggyBank size={24} className="text-[var(--color-accent)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Total Aset</p>
                            <p className="text-xl font-bold text-[var(--color-accent)]">
                                {formatCurrency(totalAssets)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-error)]/10 flex items-center justify-center">
                            <CreditCard size={24} className="text-[var(--color-error)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Total Kewajiban</p>
                            <p className="text-xl font-bold text-[var(--color-error)]">
                                {formatCurrency(totalLiabilities)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Account Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => {
                    const Icon = accountTypeIcons[account.type];
                    const color = accountTypeColors[account.type];
                    const isNegative = Number(account.balance) < 0;

                    return (
                        <Card
                            key={account.id}
                            hover
                            className="relative overflow-hidden group"
                        >
                            {/* Background decoration */}
                            <div
                                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                                style={{ backgroundColor: color }}
                            />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${color}15` }}
                                    >
                                        <Icon size={24} style={{ color }} />
                                    </div>
                                    <div className="relative">
                                        <button
                                            className="p-2 hover:bg-[var(--color-secondary)] rounded-lg transition-all"
                                            onClick={() => toggleDropdown(account.id)}
                                        >
                                            <MoreVertical size={18} className="text-[var(--color-text-muted)]" />
                                        </button>
                                        {/* Dropdown Menu */}
                                        {openDropdown === account.id && (
                                            <div className="absolute right-0 top-10 bg-white shadow-lg border border-[var(--color-border)] rounded-lg py-1 z-10 min-w-[140px]">
                                                <button
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-2"
                                                    onClick={() => handleEdit(account)}
                                                >
                                                    <Edit size={16} className="text-[var(--color-text-muted)]" />
                                                    Edit
                                                </button>
                                                <button
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-2 text-[var(--color-error)]"
                                                    onClick={() => handleDeleteClick(account)}
                                                >
                                                    <Trash2 size={16} />
                                                    Hapus
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-[var(--color-text-muted)]">{account.name}</p>
                                    <p className={classNames(
                                        'text-2xl font-bold mt-1',
                                        isNegative ? 'text-[var(--color-error)]' : 'text-[var(--color-text)]'
                                    )}>
                                        {formatCurrency(Number(account.balance))}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
                                    <Badge
                                        variant={isNegative ? 'error' : 'success'}
                                    >
                                        {accountTypeLabels[account.type]}
                                    </Badge>
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        Diperbarui hari ini
                                    </span>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {/* Add Account Card */}
                <Card
                    hover
                    className="border-2 border-dashed border-[var(--color-border)] flex items-center justify-center min-h-[200px] cursor-pointer hover:border-[var(--color-primary)] group"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--color-primary)]/10 transition-colors">
                            <Plus size={24} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                        </div>
                        <p className="font-medium text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]">
                            Tambah Akun Baru
                        </p>
                    </div>
                </Card>
            </div>

            {/* Add Account Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); resetForm(); }}
                title="Tambah Akun Baru"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Nama Akun"
                        placeholder="contoh: Rekening Utama BCA"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Jenis Akun
                        </label>
                        <select
                            className="input w-full"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as Account['type'] })}
                        >
                            <option value="bank">Rekening Bank</option>
                            <option value="credit_card">Kartu Kredit</option>
                            <option value="cash">Uang Tunai</option>
                            <option value="investment">Investasi</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>

                    <Input
                        label="Saldo Saat Ini"
                        type="number"
                        placeholder="0"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Warna
                        </label>
                        <div className="flex gap-2">
                            {['#1E40AF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((clr) => (
                                <button
                                    key={clr}
                                    type="button"
                                    className={classNames(
                                        'w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform',
                                        formData.color === clr ? 'border-[var(--color-text)]' : 'border-white'
                                    )}
                                    style={{ backgroundColor: clr }}
                                    onClick={() => setFormData({ ...formData, color: clr })}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" isLoading={isSubmitting}>
                            Tambah Akun
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Account Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedAccount(null); resetForm(); }}
                title="Edit Akun"
                size="md"
            >
                <form onSubmit={handleEditSubmit} className="space-y-5">
                    <Input
                        label="Nama Akun"
                        placeholder="contoh: Rekening Utama BCA"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Jenis Akun
                        </label>
                        <select
                            className="input w-full"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as Account['type'] })}
                        >
                            <option value="bank">Rekening Bank</option>
                            <option value="credit_card">Kartu Kredit</option>
                            <option value="cash">Uang Tunai</option>
                            <option value="investment">Investasi</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>

                    <Input
                        label="Saldo Saat Ini"
                        type="number"
                        placeholder="0"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Warna
                        </label>
                        <div className="flex gap-2">
                            {['#1E40AF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((clr) => (
                                <button
                                    key={clr}
                                    type="button"
                                    className={classNames(
                                        'w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform',
                                        formData.color === clr ? 'border-[var(--color-text)]' : 'border-white'
                                    )}
                                    style={{ backgroundColor: clr }}
                                    onClick={() => setFormData({ ...formData, color: clr })}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => { setIsEditModalOpen(false); setSelectedAccount(null); resetForm(); }}>
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
                onClose={() => { setIsDeleteModalOpen(false); setSelectedAccount(null); }}
                title="Hapus Akun"
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
                        Akun <strong>"{selectedAccount?.name}"</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="ghost" onClick={() => { setIsDeleteModalOpen(false); setSelectedAccount(null); }}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm} isLoading={isSubmitting}>
                            Hapus Akun
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Accounts;

