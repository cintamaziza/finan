import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Wallet,
    PieChart,
    Target,
    BarChart3,
    Settings,
    User,
    Menu,
    X,
    LogOut,
    Bell,
    Moon,
    Sun,
    FileText,
    AlertTriangle,
    CheckCircle,
    Info,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useNotificationAlerts } from '../../hooks/useNotificationAlerts';
import { classNames } from '../../lib/utils';

import { useTranslation } from '../../hooks/useTranslation';

// Main menu items
const getMenuItems = (t: (key: any) => string) => [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/transactions', label: t('nav.transactions'), icon: ArrowLeftRight },
    { path: '/accounts', label: t('nav.accounts'), icon: Wallet },
    { path: '/budgets', label: t('nav.budget'), icon: PieChart },
    { path: '/goals', label: t('nav.goals'), icon: Target },
    { path: '/bills', label: t('nav.bills'), icon: Bell },
    { path: '/reports', label: t('nav.reports'), icon: BarChart3 },
];

// General section items
const getGeneralItems = (t: (key: any) => string) => [
    { path: '/settings', label: t('nav.settings'), icon: Settings },
    { path: '/audit-log', label: 'Audit Log', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
];

export const AppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { settings, updateSettings } = useSettings();
    const { alerts, unreadCount } = useNotificationAlerts();
    const { t } = useTranslation();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const menuItems = getMenuItems(t);
    const generalItems = getGeneralItems(t);

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'error': return <AlertCircle size={16} className="text-[var(--color-error)]" />;
            case 'warning': return <AlertTriangle size={16} className="text-[var(--color-warning)]" />;
            case 'success': return <CheckCircle size={16} className="text-[var(--color-accent)]" />;
            default: return <Info size={16} className="text-[var(--color-primary)]" />;
        }
    };

    const toggleTheme = () => {
        updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
    };

    const isActive = (path: string) => location.pathname === path;

    const NavItem = ({ item, onClick }: { item: typeof menuItems[0]; onClick?: () => void }) => (
        <Link
            to={item.path}
            onClick={onClick}
            className={classNames(
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all`,
                isActive(item.path)
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-text)]'
            )}
        >
            <item.icon size={20} />
            <span>{item.label}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-[var(--color-secondary)]">
            {/* Fixed Left Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 bg-[var(--color-bg)] border-r border-[var(--color-border)] z-40">
                {/* Logo */}
                <div className="p-6">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <img
                            src={settings.theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
                            alt="Finanku"
                            className="h-10 w-auto"
                        />
                    </Link>
                </div>

                {/* MENU Section */}
                <div className="px-4 flex-1 overflow-y-auto">
                    <p className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Menu
                    </p>
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </nav>

                    {/* GENERAL Section */}
                    <p className="px-4 py-2 mt-6 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        General
                    </p>
                    <nav className="space-y-1">
                        {generalItems.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </nav>
                </div>

                {/* Logout at bottom */}
                <div className="p-4 border-t border-[var(--color-border)]">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all"
                    >
                        <LogOut size={20} />
                        <span>{t('nav.logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-[var(--color-border)]">
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 hover:bg-[var(--color-secondary)] rounded-lg"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <img
                                src={settings.theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
                                alt="Finanku"
                                className="h-8 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Mobile Right Side */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-secondary)] rounded-lg transition-colors"
                        >
                            {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-secondary)] rounded-lg relative"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-error)] rounded-full text-white text-xs flex items-center justify-center font-medium">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Desktop Top Bar */}
            <div className="hidden lg:flex fixed top-0 left-64 right-0 z-30 h-16 bg-[var(--color-bg)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
                <div className="flex items-center justify-end w-full px-6">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-secondary)] rounded-lg transition-colors"
                        title={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Notifications */}
                    <div className="relative ml-2">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-secondary)] rounded-lg relative"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-error)] rounded-full text-white text-xs flex items-center justify-center font-medium">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-[var(--color-bg)] rounded-xl shadow-lg border border-[var(--color-border)] py-2 animate-scale-in max-h-96 overflow-hidden">
                                <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                                    <h3 className="font-semibold text-[var(--color-text)]">Notifikasi</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs px-2 py-0.5 bg-[var(--color-error)] text-white rounded-full">
                                            {unreadCount} baru
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {alerts.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                                            <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                            <p>Tidak ada notifikasi</p>
                                        </div>
                                    ) : (
                                        alerts.map(alert => (
                                            <Link
                                                key={alert.id}
                                                to={alert.link || '#'}
                                                onClick={() => setIsNotificationsOpen(false)}
                                                className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-secondary)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
                                            >
                                                <div className="mt-0.5">
                                                    {getSeverityIcon(alert.severity)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-[var(--color-text)]">{alert.title}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)] truncate">{alert.message}</p>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <Link
                        to="/profile"
                        className="flex items-center gap-3 ml-4 p-2 hover:bg-[var(--color-secondary)] rounded-lg"
                    >
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.full_name || 'Avatar'}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </span>
                            </div>
                        )}
                        <span className="text-sm font-medium text-[var(--color-text)]">
                            {user?.full_name}
                        </span>
                    </Link>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
                    <aside
                        className="absolute left-0 top-0 bottom-0 w-64 bg-[var(--color-bg)] border-r border-[var(--color-border)] animate-slide-down overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Logo */}
                        <div className="p-6 border-b border-[var(--color-border)]">
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <img
                                    src={settings.theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
                                    alt="Finanku"
                                    className="h-10 w-auto"
                                />
                            </Link>
                        </div>

                        {/* MENU Section */}
                        <div className="px-4 py-4">
                            <p className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Menu
                            </p>
                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <NavItem key={item.path} item={item} onClick={() => setIsMobileMenuOpen(false)} />
                                ))}
                            </nav>

                            {/* GENERAL Section */}
                            <p className="px-4 py-2 mt-6 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                General
                            </p>
                            <nav className="space-y-1">
                                {generalItems.map((item) => (
                                    <NavItem key={item.path} item={item} onClick={() => setIsMobileMenuOpen(false)} />
                                ))}
                            </nav>
                        </div>

                        {/* Logout at bottom */}
                        <div className="p-4 border-t border-[var(--color-border)]">
                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all"
                            >
                                <LogOut size={20} />
                                <span>{t('nav.logout')}</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 min-h-screen">
                <div className="p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
