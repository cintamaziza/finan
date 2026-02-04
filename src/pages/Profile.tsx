import React, { useRef, useState } from 'react';
import {
    Mail,
    TrendingUp,
    Wallet,
    Target,
    Edit,
    Camera,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    X
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTransactions, useAccounts, useGoals, useAvatarUpload } from '../hooks';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const { settings } = useSettings();
    const { transactions } = useTransactions();
    const { accounts } = useAccounts();
    const { goals } = useGoals();
    const { uploadAvatar, deleteAvatar, isUploading, error: uploadError } = useAvatarUpload();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Calculate real stats
    const totalTransactions = transactions.length;
    const totalAccounts = accounts.length;
    const activeGoals = goals.filter(g => Number(g.current_amount) < Number(g.target_amount)).length;

    const stats = [
        { label: 'Total Transaksi', value: totalTransactions.toString(), icon: TrendingUp },
        { label: 'Akun', value: totalAccounts.toString(), icon: Wallet },
        { label: 'Target Aktif', value: activeGoals.toString(), icon: Target },
    ];

    // Calculate account summary from real data
    const netWorth = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Calculate monthly income and expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const thisMonthTransactions = transactions.filter(t => t.date >= startOfMonth);

    const monthlyIncome = thisMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpenses = thisMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    // Get recent activity from real transactions (last 5)
    const recentActivity = transactions
        .slice(0, 5)
        .map(t => ({
            action: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            detail: `${t.description} - ${formatCurrency(Number(t.amount), settings.currency)}`,
            time: formatRelativeTime(t.date),
            type: t.type
        }));

    // Member since (simplified - no created_at on AuthUser type)
    const memberSince = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadAvatar(file);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteAvatar = async () => {
        await deleteAvatar();
        setShowDeleteConfirm(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Profile Header */}
            <Card>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                        {/* Avatar Display */}
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.full_name || 'Avatar'}
                                className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-primary)]/20"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-3xl font-bold text-white">
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                        )}

                        {/* Camera Button */}
                        <button
                            onClick={handleCameraClick}
                            disabled={isUploading}
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                        >
                            {isUploading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Camera size={16} />
                            )}
                        </button>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Delete Avatar Button (if avatar exists) */}
                        {user?.avatar_url && !isUploading && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-error)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl font-bold text-[var(--color-text)]">
                            {user?.full_name || 'Pengguna'}
                        </h1>
                        <p className="text-[var(--color-text-muted)] flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <Mail size={16} />
                            {user?.email || 'user@finanku.app'}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                            <Badge variant="success">Aktif</Badge>
                            <span className="text-sm text-[var(--color-text-muted)]">
                                Bergabung {memberSince}
                            </span>
                        </div>
                        {uploadError && (
                            <p className="text-sm text-[var(--color-error)] mt-2">{uploadError}</p>
                        )}
                    </div>

                    <Button variant="secondary" leftIcon={<Edit size={18} />}>
                        Edit Profil
                    </Button>
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                            Hapus Foto Profil?
                        </h3>
                        <p className="text-[var(--color-text-muted)] mb-4">
                            Foto profil Anda akan dihapus dan diganti dengan inisial.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                                Batal
                            </Button>
                            <Button variant="primary" className="!bg-[var(--color-error)]" onClick={handleDeleteAvatar}>
                                Hapus
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="text-center">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-3">
                            <stat.icon size={24} className="text-[var(--color-primary)]" />
                        </div>
                        <p className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</p>
                        <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
                    </Card>
                ))}
            </div>

            {/* Account Summary */}
            <Card>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Ringkasan Keuangan</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-[var(--color-secondary)] rounded-xl">
                        <p className="text-sm text-[var(--color-text-muted)]">Total Saldo</p>
                        <p className="text-xl font-bold text-[var(--color-text)]">
                            {formatCurrency(netWorth, settings.currency)}
                        </p>
                    </div>
                    <div className="p-4 bg-[var(--color-secondary)] rounded-xl">
                        <p className="text-sm text-[var(--color-text-muted)]">Tabungan Bulan Ini</p>
                        <p className={`text-xl font-bold ${monthlySavings >= 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-error)]'}`}>
                            {formatCurrency(monthlySavings, settings.currency)}
                        </p>
                    </div>
                    <div className="p-4 bg-[var(--color-secondary)] rounded-xl">
                        <p className="text-sm text-[var(--color-text-muted)]">Rasio Tabungan</p>
                        <p className={`text-xl font-bold ${savingsRate >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
                            {savingsRate.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </Card>

            {/* Recent Activity */}
            <Card>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Aktivitas Terbaru</h2>
                <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                        <p className="text-center text-[var(--color-text-muted)] py-8">
                            Belum ada transaksi
                        </p>
                    ) : (
                        recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'income'
                                    ? 'bg-[var(--color-accent)]/10'
                                    : 'bg-[var(--color-error)]/10'
                                    }`}>
                                    {activity.type === 'income'
                                        ? <ArrowUpRight size={18} className="text-[var(--color-accent)]" />
                                        : <ArrowDownRight size={18} className="text-[var(--color-error)]" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[var(--color-text)]">{activity.action}</p>
                                    <p className="text-sm text-[var(--color-text-muted)] truncate">{activity.detail}</p>
                                </div>
                                <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                                    {activity.time}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Finanku Info */}
            <Card className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-semibold">Finanku</h3>
                        <p className="text-white/80 text-sm mt-1">
                            Aplikasi manajemen keuangan pribadi Anda
                        </p>
                    </div>
                    <Button className="!bg-white !text-[var(--color-primary)] hover:!bg-white/90">
                        Tentang Kami
                    </Button>
                </div>
            </Card>
        </div>
    );
};

// Helper function to format relative time
function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return `${Math.floor(diffDays / 30)} bulan lalu`;
}

export default Profile;
