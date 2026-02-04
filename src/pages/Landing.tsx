import React from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    PieChart,
    Target,
    Bell,
    ArrowRight,
    CheckCircle2,
    Star,
    ChevronRight
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Button } from '../components/ui';

// Dummy chart data for the landing page preview
const demoChartData = [
    { month: 'Jan', income: 18500000, expenses: 12000000 },
    { month: 'Feb', income: 20000000, expenses: 9500000 },
    { month: 'Mar', income: 19200000, expenses: 11000000 },
    { month: 'Apr', income: 21500000, expenses: 8200000 },
    { month: 'May', income: 22000000, expenses: 9800000 },
    { month: 'Jun', income: 23000000, expenses: 8500000 },
];

const features = [
    {
        icon: TrendingUp,
        title: 'Pantau Setiap Rupiah',
        description: 'Monitor semua transaksi Anda di satu tempat dengan kategorisasi otomatis, realtime.',
        colSpan: 'lg:col-span-2',
        bg: 'bg-white'
    },
    {
        icon: PieChart,
        title: 'Budgeting Cerdas',
        description: 'Buat anggaran kustom dan dapatkan peringatan instan saat mendekati batas.',
        colSpan: 'lg:col-span-1',
        bg: 'bg-[var(--color-secondary)]'
    },
    {
        icon: Target,
        title: 'Capai Tujuan',
        description: 'Tetapkan tujuan finansial dan lacak kemajuan Anda dengan visualisasi yang menarik.',
        colSpan: 'lg:col-span-1',
        bg: 'bg-[var(--color-secondary)]'
    },
    {
        icon: Bell,
        title: 'Pengingat Tagihan',
        description: 'Jangan pernah lewatkan pembayaran dengan pengingat otomatis.',
        colSpan: 'lg:col-span-2',
        bg: 'bg-white'
    },
];

const testimonials = [
    {
        name: 'Sari Rahmawati',
        role: 'Freelancer',
        content: 'Finanku membantu saya menabung Rp 10 juta dalam 3 bulan. Tracking budgetnya sangat intuitif!',
        rating: 5,
    },
    {
        name: 'Budi Santoso',
        role: 'Software Engineer',
        content: 'Akhirnya ada aplikasi keuangan yang simpel namun powerful. Desainnya bersih dan elegan.',
        rating: 5,
    },
    {
        name: 'Putri Indah',
        role: 'Pemilik UMKM',
        content: 'Laporan keuangannya sangat membantu saya mengatur cashflow bisnis dan pribadi.',
        rating: 5,
    },
];

export const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--color-secondary)] font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[var(--color-border)]/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                            <img src="/logo.png" alt="Finanku" className="h-8 w-auto dark:hidden" />
                            <img src="/logo-dark.png" alt="Finanku" className="h-8 w-auto hidden dark:block" />
                        </Link>

                        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <a href="#features" className="text-[var(--color-text)]/80 hover:text-[var(--color-text)] transition-colors">
                                Fitur
                            </a>
                            <a href="#testimonials" className="text-[var(--color-text)]/80 hover:text-[var(--color-text)] transition-colors">
                                Ulasan
                            </a>
                            <a href="#pricing" className="text-[var(--color-text)]/80 hover:text-[var(--color-text)] transition-colors">
                                Harga
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="ghost" size="sm" className="text-sm">Masuk</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary" size="sm" className="rounded-full px-5 text-sm" rightIcon={<ArrowRight size={14} />}>
                                    Daftar Gratis
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Gradient Drop Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-500"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-text)] text-white rounded-full text-xs font-medium mb-8 animate-fade-in delay-100 shadow-lg shadow-black/5 hover:scale-105 transition-transform cursor-default">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                            Baru
                        </span>
                        <span className="opacity-80">Dashboard dengan AI</span>
                        <ChevronRight size={12} className="opacity-60" />
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--color-text)] mb-6 animate-slide-up leading-[1.1]">
                        Kendalikan <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 pb-2">
                            Masa Depan Finansial
                        </span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto animate-slide-up delay-200 font-medium leading-relaxed">
                        Cara termudah untuk melacak pengeluaran, membuat anggaran, dan mencapai kebebasan finansial.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
                        <Link to="/register">
                            <Button size="lg" variant="primary" className="rounded-full px-8 text-lg h-12 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-105">
                                Mulai Sekarang
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="ghost" className="rounded-full px-8 text-lg h-12 hover:bg-black/5 dark:hover:bg-white/10 transition-all">
                                Lihat Demo
                            </Button>
                        </Link>
                    </div>

                    {/* Dashboard Preview UI */}
                    <div className="mt-20 relative max-w-5xl mx-auto animate-scale-up delay-400">
                        {/* Glow effect behind the dashboard */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2.5rem] blur-3xl opacity-50"></div>

                        <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-[var(--color-border)]/50 overflow-hidden ring-1 ring-black/5">
                            {/* Mac-style window controls */}
                            <div className="absolute top-0 left-0 right-0 h-10 bg-gray-50 dark:bg-slate-800 border-b border-[var(--color-border)]/50 flex items-center px-4 gap-2 z-10">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <div className="mx-auto text-xs text-gray-400 font-medium">Finanku Dashboard</div>
                            </div>

                            <div className="pt-10 p-4 sm:p-8 overflow-hidden">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    {[
                                        { label: 'Total Saldo', value: 'Rp 698.250.000', color: 'text-blue-600' },
                                        { label: 'Pemasukan', value: 'Rp 23.000.000', color: 'text-green-600' },
                                        { label: 'Pengeluaran', value: 'Rp 8.500.000', color: 'text-red-500' },
                                        { label: 'Investasi', value: '+12.5%', color: 'text-purple-600' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 sm:p-5">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{stat.label}</p>
                                            <p className={`text-lg sm:text-2xl font-bold ${stat.color} tracking-tight`}>
                                                {stat.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-64 sm:h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={demoChartData}>
                                            <defs>
                                                <linearGradient id="colorIncomeHero" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(val) => `${val / 1000000}jt`} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="income" stroke="#3B82F6" strokeWidth={3} fill="url(#colorIncomeHero)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section (Bento Grid) */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-5xl font-bold text-[var(--color-text)] mb-6 tracking-tight">
                            Semua yang Anda butuhkan. <br />
                            <span className="text-[var(--color-text-muted)]">Dalam satu aplikasi.</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`${feature.colSpan} ${feature.bg} dark:bg-slate-800 rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-300 shadow-sm border border-black/5 dark:border-white/5 relative overflow-hidden group`}
                            >
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6">
                                        <feature.icon size={24} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[var(--color-text-muted)] text-lg leading-relaxed max-w-sm">
                                        {feature.description}
                                    </p>
                                </div>
                                {/* Decorative circle */}
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 tracking-tight">
                        Dicintai oleh Ribuan Pengguna
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-slate-900 p-8 rounded-3xl relative">
                                <div className="flex gap-1 mb-4 text-yellow-400">
                                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-lg font-medium text-[var(--color-text)] mb-6 leading-relaxed">
                                    "{t.content}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{t.name}</div>
                                        <div className="text-xs text-[var(--color-text-muted)]">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Harga Simpel & Transparan</h2>
                        <p className="text-xl text-[var(--color-text-muted)]">Mulai gratis, upgrade kapan saja.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-medium text-[var(--color-text-muted)] mb-2">Gratis</h3>
                            <div className="mb-6"><span className="text-4xl font-bold">Rp 0</span></div>
                            <Button fullWidth variant="secondary" className="mb-8 rounded-full border-gray-200">Daftar Sekarang</Button>
                            <ul className="space-y-4 text-sm text-[var(--color-text-muted)]">
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-blue-500" /> Hingga 2 Akun</li>
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-blue-500" /> Tracking Transaksi</li>
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-blue-500" /> Laporan Bulanan</li>
                            </ul>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-black dark:bg-white text-white dark:text-black rounded-3xl p-8 shadow-2xl relative transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                                Pilihan Favorit
                            </div>
                            <h3 className="text-lg font-medium opacity-80 mb-2">Pro</h3>
                            <div className="mb-6"><span className="text-4xl font-bold">Rp 49rb</span><span className="opacity-60 text-sm">/bulan</span></div>
                            <Button fullWidth variant="primary" className="mb-8 rounded-full bg-white text-black hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900 border-none">Mulai Trial Gratis</Button>
                            <ul className="space-y-4 text-sm opacity-90">
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-400" /> Akun Tanpa Batas</li>
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-400" /> Analitik Cerdas</li>
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-400" /> Export CSV/PDF</li>
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-green-400" /> Support Prioritas</li>
                            </ul>
                        </div>

                        {/* Business */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-medium text-[var(--color-text-muted)] mb-2">Bisnis</h3>
                            <div className="mb-6"><span className="text-4xl font-bold">Rp 149rb</span><span className="opacity-60 text-sm">/bulan</span></div>
                            <Button fullWidth variant="secondary" className="mb-8 rounded-full border-gray-200">Hubungi Kami</Button>
                            <ul className="space-y-4 text-sm text-[var(--color-text-muted)]">
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-blue-500" /> Fitur Pro +</li>
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-blue-500" /> Hingga 5 Pengguna</li>
                                <li className="flex gap-3"><CheckCircle2 size={18} className="text-blue-500" /> Anggaran Tim</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight">Siap mengatur keuangan Anda?</h2>
                    <Link to="/register">
                        <Button size="lg" className="rounded-full px-10 py-6 text-lg bg-[var(--color-primary)] text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20">
                            Buat Akun Gratis
                        </Button>
                    </Link>
                    <p className="mt-6 text-[var(--color-text-muted)]">Tanpa kartu kredit. Batalkan kapan saja.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--color-border)] bg-gray-50 dark:bg-slate-900 text-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-text)]">Finanku</span>
                        <span className="text-[var(--color-text-muted)]">© 2026</span>
                    </div>
                    <div className="flex gap-8 text-[var(--color-text-muted)]">
                        <a href="#" className="hover:text-[var(--color-text)]">Privasi</a>
                        <a href="#" className="hover:text-[var(--color-text)]">Syarat Ketentuan</a>
                        <a href="#" className="hover:text-[var(--color-text)]">Bantuan</a>
                    </div>
                    <div className="flex gap-4">
                        {/* Social icons placeholders */}
                        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
