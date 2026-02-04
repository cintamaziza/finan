import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Pencil,
    Trash2,
    Filter,
    RefreshCw,
    Wallet,
    ArrowLeftRight,
    PieChart,
    Target,
    Bell
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { useAuditLogs } from '../hooks/useAuditLogs';

const entityTypeLabels: Record<string, string> = {
    transaction: 'Transaksi',
    account: 'Akun',
    budget: 'Anggaran',
    goal: 'Target',
    bill: 'Tagihan',
};

const entityTypeIcons: Record<string, React.ElementType> = {
    transaction: ArrowLeftRight,
    account: Wallet,
    budget: PieChart,
    goal: Target,
    bill: Bell,
};

const actionLabels: Record<string, string> = {
    create: 'Dibuat',
    update: 'Diperbarui',
    delete: 'Dihapus',
};

const actionVariants: Record<string, 'success' | 'warning' | 'error'> = {
    create: 'success',
    update: 'warning',
    delete: 'error',
};

export const AuditLog: React.FC = () => {
    const { logs, isLoading, refetch } = useAuditLogs();
    const [filterAction, setFilterAction] = useState<string>('all');
    const [filterEntity, setFilterEntity] = useState<string>('all');

    const filteredLogs = logs.filter(log => {
        if (filterAction !== 'all' && log.action !== filterAction) return false;
        if (filterEntity !== 'all' && log.entity_type !== filterEntity) return false;
        return true;
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create': return <Plus size={14} />;
            case 'update': return <Pencil size={14} />;
            case 'delete': return <Trash2 size={14} />;
            default: return <FileText size={14} />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Audit Log</h1>
                    <p className="text-[var(--color-text-muted)]">
                        Riwayat aktivitas akun Anda
                    </p>
                </div>
                <Button
                    variant="secondary"
                    leftIcon={<RefreshCw size={18} />}
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card padding="sm">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-[var(--color-text-muted)]" />
                        <span className="text-sm font-medium text-[var(--color-text)]">Filter:</span>
                    </div>

                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="input py-2 text-sm"
                    >
                        <option value="all">Semua Aksi</option>
                        <option value="create">Dibuat</option>
                        <option value="update">Diperbarui</option>
                        <option value="delete">Dihapus</option>
                    </select>

                    <select
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                        className="input py-2 text-sm"
                    >
                        <option value="all">Semua Tipe</option>
                        <option value="transaction">Transaksi</option>
                        <option value="account">Akun</option>
                        <option value="budget">Anggaran</option>
                        <option value="goal">Target</option>
                        <option value="bill">Tagihan</option>
                    </select>

                    {(filterAction !== 'all' || filterEntity !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterAction('all');
                                setFilterEntity('all');
                            }}
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </Card>

            {/* Audit Log Table */}
            <Card>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw size={24} className="animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText size={48} className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
                        <p className="text-[var(--color-text-muted)]">
                            {logs.length === 0
                                ? 'Belum ada aktivitas tercatat'
                                : 'Tidak ada hasil untuk filter ini'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                                        Waktu
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                                        Aksi
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                                        Tipe
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                                        Nama
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => {
                                    const EntityIcon = entityTypeIcons[log.entity_type] || FileText;
                                    return (
                                        <tr
                                            key={log.id}
                                            className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-secondary)] transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-[var(--color-text-muted)]">
                                                    {formatDate(log.created_at)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={actionVariants[log.action]} size="sm">
                                                    <span className="flex items-center gap-1">
                                                        {getActionIcon(log.action)}
                                                        {actionLabels[log.action]}
                                                    </span>
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <EntityIcon size={16} className="text-[var(--color-text-muted)]" />
                                                    <span className="text-sm text-[var(--color-text)]">
                                                        {entityTypeLabels[log.entity_type] || log.entity_type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-[var(--color-text)]">
                                                    {log.entity_name || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Summary */}
                {!isLoading && logs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                        <span>
                            Menampilkan {filteredLogs.length} dari {logs.length} aktivitas
                        </span>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AuditLog;
