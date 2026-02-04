import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Edit,
    Loader2
} from 'lucide-react';
import { Card, Button, Input, Badge, Modal } from '../components/ui';
import { formatCurrency, getRelativeDate, classNames } from '../lib/utils';
import { useTransactions, useCategories, useAccounts } from '../hooks';
import type { Transaction } from '../types';

export const Transactions: React.FC = () => {
    const { transactions, isLoading, addTransaction, deleteTransaction, totalIncome, totalExpenses } = useTransactions();
    const { expenseCategories, incomeCategories } = useCategories();
    const { accounts } = useAccounts();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category_id: '',
        account_id: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense' as 'income' | 'expense',
    });
    const itemsPerPage = 10;

    // Filter transactions
    const filteredTransactions = transactions.filter((t) => {
        const matchesSearch =
            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || t.type === selectedType;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await addTransaction({
            amount: parseFloat(formData.amount),
            description: formData.description,
            category_id: formData.category_id,
            account_id: formData.account_id,
            date: formData.date,
            type: formData.type,
            is_recurring: false,
        });

        setIsSubmitting(false);
        setIsAddModalOpen(false);
        setFormData({
            amount: '',
            description: '',
            category_id: '',
            account_id: accounts[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
        });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            await deleteTransaction(id);
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
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Transaksi</h1>
                    <p className="text-[var(--color-text-muted)]">
                        Kelola dan lacak semua transaksi keuangan Anda
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" leftIcon={<Upload size={18} />}>
                        Impor
                    </Button>
                    <Button variant="secondary" leftIcon={<Download size={18} />}>
                        Ekspor
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={18} />}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Tambah Transaksi
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                        <ArrowDownRight size={24} className="text-[var(--color-accent)]" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">Total Pendapatan</p>
                        <p className="text-xl font-bold text-[var(--color-accent)]">
                            +{formatCurrency(totalIncome)}
                        </p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-error)]/10 flex items-center justify-center">
                        <ArrowUpRight size={24} className="text-[var(--color-error)]" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">Total Pengeluaran</p>
                        <p className="text-xl font-bold text-[var(--color-error)]">
                            -{formatCurrency(totalExpenses)}
                        </p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <Calendar size={24} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">Saldo Bersih</p>
                        <p className="text-xl font-bold text-[var(--color-primary)]">
                            {formatCurrency(totalIncome - totalExpenses)}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card padding="sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari transaksi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={<Search size={18} />}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
                            {(['all', 'income', 'expense'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={classNames(
                                        'px-4 py-2 text-sm font-medium transition-colors',
                                        selectedType === type
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-secondary)]'
                                    )}
                                >
                                    {type === 'all' ? 'Semua' : type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" leftIcon={<Filter size={18} />}>
                            Filter
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Transactions Table */}
            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                                    Transaksi
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                                    Kategori
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                                    Akun
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">
                                    Tanggal
                                </th>
                                <th className="text-right p-4 text-sm font-medium text-[var(--color-text-muted)]">
                                    Jumlah
                                </th>
                                <th className="text-right p-4 text-sm font-medium text-[var(--color-text-muted)]">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">
                                        {transactions.length === 0
                                            ? 'Belum ada transaksi. Tambahkan transaksi pertama Anda!'
                                            : 'Tidak ada transaksi yang cocok dengan pencarian.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-secondary)] transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: `${transaction.category?.color}15` }}
                                                >
                                                    {transaction.type === 'income' ? (
                                                        <ArrowDownRight size={18} style={{ color: transaction.category?.color }} />
                                                    ) : (
                                                        <ArrowUpRight size={18} style={{ color: transaction.category?.color }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--color-text)]">
                                                        {transaction.description}
                                                    </p>
                                                    {transaction.is_recurring && (
                                                        <Badge variant="info" size="sm">Berulang</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className="inline-block px-3 py-1 rounded-full text-sm"
                                                style={{
                                                    backgroundColor: `${transaction.category?.color}15`,
                                                    color: transaction.category?.color
                                                }}
                                            >
                                                {transaction.category?.name}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[var(--color-text-muted)]">
                                            {transaction.account?.name}
                                        </td>
                                        <td className="p-4 text-[var(--color-text-muted)]">
                                            {getRelativeDate(transaction.date)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={classNames(
                                                'font-semibold',
                                                transaction.type === 'income'
                                                    ? 'text-[var(--color-accent)]'
                                                    : 'text-[var(--color-text)]'
                                            )}>
                                                {transaction.type === 'income' ? '+' : '-'}
                                                {formatCurrency(Number(transaction.amount))}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    className="p-2 hover:bg-[var(--color-secondary-dark)] rounded-lg"
                                                    onClick={() => setEditingTransaction(transaction)}
                                                >
                                                    <Edit size={16} className="text-[var(--color-text-muted)]" />
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-[var(--color-error)]/10 rounded-lg"
                                                    onClick={() => handleDelete(transaction.id)}
                                                >
                                                    <Trash2 size={16} className="text-[var(--color-error)]" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredTransactions.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)]">
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Menampilkan {(currentPage - 1) * itemsPerPage + 1} sampai {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 hover:bg-[var(--color-secondary)] rounded-lg disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={classNames(
                                        'w-8 h-8 rounded-lg text-sm font-medium',
                                        currentPage === i + 1
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'hover:bg-[var(--color-secondary)] text-[var(--color-text-muted)]'
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 hover:bg-[var(--color-secondary)] rounded-lg disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Add/Edit Transaction Modal */}
            <Modal
                isOpen={isAddModalOpen || !!editingTransaction}
                onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); }}
                title={editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex gap-2 p-1 bg-[var(--color-secondary)] rounded-lg">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
                            className={classNames(
                                'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
                                formData.type === 'expense'
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'text-[var(--color-text-muted)] hover:bg-white'
                            )}
                        >
                            Pengeluaran
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
                            className={classNames(
                                'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
                                formData.type === 'income'
                                    ? 'bg-[var(--color-accent)] text-white'
                                    : 'text-[var(--color-text-muted)] hover:bg-white'
                            )}
                        >
                            Pendapatan
                        </button>
                    </div>

                    <Input
                        label="Jumlah"
                        type="number"
                        placeholder="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />

                    <Input
                        label="Deskripsi"
                        placeholder="Untuk apa transaksi ini?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />

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
                            {(formData.type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                            Akun
                        </label>
                        <select
                            className="input w-full"
                            value={formData.account_id}
                            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                            required
                        >
                            <option value="">Pilih akun</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Tanggal"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => { setIsAddModalOpen(false); setEditingTransaction(null); }}
                        >
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" isLoading={isSubmitting}>
                            {editingTransaction ? 'Simpan Perubahan' : 'Tambah Transaksi'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Transactions;
