import type { Transaction, Account, Goal, BillReminder, Budget } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// CSV Export utility functions

export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values that might contain commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportTransactions = (transactions: Transaction[]) => {
    const data = transactions.map(t => ({
        Tanggal: t.date,
        Deskripsi: t.description,
        Kategori: t.category?.name || '',
        Akun: t.account?.name || '',
        Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        Jumlah: t.amount,
    }));
    exportToCSV(data, 'transaksi');
};

export const exportAccounts = (accounts: Account[]) => {
    const data = accounts.map(a => ({
        Nama: a.name,
        Tipe: a.type,
        Saldo: a.balance,
        Mata_Uang: a.currency,
        Dibuat: a.created_at,
    }));
    exportToCSV(data, 'akun');
};

export const exportGoals = (goals: Goal[]) => {
    const data = goals.map(g => ({
        Nama: g.name,
        Deskripsi: g.description || '',
        Target: g.target_amount,
        Terkumpul: g.current_amount,
        Persentase: Math.round((g.current_amount / g.target_amount) * 100) + '%',
        Deadline: g.deadline || '',
        Kategori: g.category,
    }));
    exportToCSV(data, 'target_keuangan');
};

export const exportBills = (bills: BillReminder[]) => {
    const data = bills.map(b => ({
        Nama: b.name,
        Jumlah: b.amount,
        Jatuh_Tempo: b.due_date,
        Frekuensi: b.frequency,
        Status: b.is_paid ? 'Lunas' : 'Belum Lunas',
        Auto_Bayar: b.auto_pay ? 'Ya' : 'Tidak',
    }));
    exportToCSV(data, 'tagihan');
};

export const exportBudgets = (budgets: Budget[]) => {
    const data = budgets.map(b => ({
        Kategori: b.category?.name || '',
        Anggaran: b.amount,
        Terpakai: b.spent,
        Sisa: b.amount - b.spent,
        Persentase: Math.round((b.spent / b.amount) * 100) + '%',
        Periode: b.period === 'monthly' ? 'Bulanan' : 'Tahunan',
    }));
    exportToCSV(data, 'anggaran');
};

// Export all data as a combined report
export const exportAllData = async (
    transactions: Transaction[],
    accounts: Account[],
    goals: Goal[],
    bills: BillReminder[],
    budgets: Budget[]
) => {
    // Create a summary report
    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalGoals = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
    const totalBillsDue = bills.filter(b => !b.is_paid).reduce((sum, b) => sum + Number(b.amount), 0);

    const summary = [
        { Kategori: 'Total Saldo', Nilai: totalBalance },
        { Kategori: 'Total Pemasukan', Nilai: totalIncome },
        { Kategori: 'Total Pengeluaran', Nilai: totalExpenses },
        { Kategori: 'Selisih', Nilai: totalIncome - totalExpenses },
        { Kategori: 'Total Tabungan Target', Nilai: totalGoals },
        { Kategori: 'Total Tagihan Belum Lunas', Nilai: totalBillsDue },
        { Kategori: 'Jumlah Transaksi', Nilai: transactions.length },
        { Kategori: 'Jumlah Akun', Nilai: accounts.length },
        { Kategori: 'Jumlah Target', Nilai: goals.length },
        { Kategori: 'Jumlah Tagihan', Nilai: bills.length },
        { Kategori: 'Jumlah Anggaran', Nilai: budgets.length },
    ];

    exportToCSV(summary, 'ringkasan_keuangan');
};

// ============================================
// PDF Export Functions (using jsPDF)
// ============================================

const formatCurrencyForPDF = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Load logo image and return as base64 data URL
const loadLogoAsBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                reject(new Error('Could not get canvas context'));
            }
        };
        img.onerror = () => reject(new Error('Could not load logo'));
        img.src = '/logo.png';
    });
};

export const exportTransactionsToPDF = async (transactions: Transaction[]) => {
    if (transactions.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Load and add logo
    try {
        const logoData = await loadLogoAsBase64();
        // Logo dimensions: adjust height to 12mm, width proportionally (logo aspect ~3:1)
        doc.addImage(logoData, 'PNG', 14, 10, 36, 12);
    } catch (error) {
        // Fallback to text if logo fails
        doc.setFontSize(20);
        doc.setTextColor(30, 64, 175);
        doc.text('Finanku', 14, 20);
    }

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Laporan Transaksi', 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })}`, 14, 38);

    // Summary
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Pemasukan: ${formatCurrencyForPDF(totalIncome)}`, 14, 50);
    doc.text(`Total Pengeluaran: ${formatCurrencyForPDF(totalExpenses)}`, 14, 57);
    doc.text(`Saldo Bersih: ${formatCurrencyForPDF(totalIncome - totalExpenses)}`, 14, 64);

    // Transactions table
    const tableData = transactions.map(t => [
        t.date,
        t.description,
        t.category?.name || '-',
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        formatCurrencyForPDF(Number(t.amount)),
    ]);

    autoTable(doc, {
        head: [['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah']],
        body: tableData,
        startY: 75,
        theme: 'striped',
        headStyles: {
            fillColor: [30, 64, 175],
            textColor: [255, 255, 255],
        },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 50 },
            4: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
    });

    // Footer - use internal property for finalY
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY || 75;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Jumlah transaksi: ${transactions.length}`, 14, finalY + 10);
    doc.text('Dibuat dengan Finanku', pageWidth - 14 - 40, finalY + 10);

    // Download
    doc.save(`transaksi_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportReportToPDF = async (
    transactions: Transaction[],
    accounts: Account[],
    goals: Goal[],
    bills: BillReminder[],
    budgets: Budget[]
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Load and add logo
    try {
        const logoData = await loadLogoAsBase64();
        // Logo dimensions: adjust height to 14mm, width proportionally (logo aspect ~3:1)
        doc.addImage(logoData, 'PNG', 14, 10, 42, 14);
    } catch (error) {
        // Fallback to text if logo fails
        doc.setFontSize(24);
        doc.setTextColor(30, 64, 175);
        doc.text('Finanku', 14, 22);
    }

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Laporan Keuangan', 14, 34);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })}`, 14, 42);

    // Calculate totals
    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalGoalsSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
    const totalBillsDue = bills.filter(b => !b.is_paid).reduce((sum, b) => sum + Number(b.amount), 0);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Ringkasan Keuangan', 14, 56);

    const summaryData = [
        ['Total Saldo Akun', formatCurrencyForPDF(totalBalance)],
        ['Total Pemasukan', formatCurrencyForPDF(totalIncome)],
        ['Total Pengeluaran', formatCurrencyForPDF(totalExpenses)],
        ['Saldo Bersih', formatCurrencyForPDF(totalIncome - totalExpenses)],
        ['Tabungan Target', formatCurrencyForPDF(totalGoalsSaved)],
        ['Tagihan Belum Lunas', formatCurrencyForPDF(totalBillsDue)],
    ];

    autoTable(doc, {
        body: summaryData,
        startY: 62,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentY = (doc as any).lastAutoTable?.finalY || 110;

    // Recent Transactions
    doc.setFontSize(14);
    doc.text('Transaksi Terbaru (10 terakhir)', 14, currentY + 15);

    const recentTransactions = transactions.slice(0, 10).map(t => [
        t.date,
        t.description,
        t.category?.name || '-',
        t.type === 'income' ? '+' : '-',
        formatCurrencyForPDF(Number(t.amount)),
    ]);

    autoTable(doc, {
        head: [['Tanggal', 'Deskripsi', 'Kategori', '', 'Jumlah']],
        body: recentTransactions,
        startY: currentY + 20,
        theme: 'striped',
        headStyles: {
            fillColor: [30, 64, 175],
            textColor: [255, 255, 255],
        },
        styles: { fontSize: 9 },
        columnStyles: {
            3: { cellWidth: 10 },
            4: { halign: 'right' },
        },
        margin: { left: 14, right: 14 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable?.finalY || 200;

    // Stats summary
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total: ${transactions.length} transaksi | ${accounts.length} akun | ${goals.length} target | ${bills.length} tagihan | ${budgets.length} anggaran`, 14, currentY + 12);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Dibuat dengan Finanku - Aplikasi Manajemen Keuangan', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    // Download
    doc.save(`laporan_keuangan_${new Date().toISOString().split('T')[0]}.pdf`);
};
