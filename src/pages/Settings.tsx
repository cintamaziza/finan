import React, { useState } from 'react';
import {
    User,
    CreditCard,
    Bell,
    Shield,
    Palette,
    Database,
    ChevronRight,
    Save,
    Trash2,
    Download,
    Upload,
    Globe,
    Moon,
    Sun,
    Check,
    RotateCcw
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui';
import { classNames } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useCategories } from '../hooks/useCategories';

const currencies = [
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
];

const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (14/02/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (02/14/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-02-14)' },
];

const languages = [
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'en', name: 'English' },
];

// Move settingsSections inside component or functionality that has access to translation

export const Settings: React.FC = () => {
    const [activeSection, setActiveSection] = useState('account');
    const { settings, updateSettings, resetSettings } = useSettings();
    const { success, error } = useNotification();
    const { user, updateProfile } = useAuth();
    const { expenseCategories, incomeCategories, addCategory, deleteCategory } = useCategories();
    const { t } = useTranslation();

    const settingsSections = [
        { id: 'account', label: t('settings.account'), icon: User },
        { id: 'preferences', label: t('settings.preferences'), icon: Palette },
        { id: 'categories', label: t('settings.categories'), icon: CreditCard },
        { id: 'notifications', label: t('settings.notifications'), icon: Bell },
        { id: 'security', label: t('settings.security'), icon: Shield },
        { id: 'data', label: t('settings.data'), icon: Database },
    ];

    // Account Form State
    const [accountForm, setAccountForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
    });

    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        const { error: updateError } = await updateProfile({
            full_name: accountForm.full_name,
        });

        if (updateError) {
            error(t('common.error'), t('common.error'));
        } else {
            success(t('common.success'), t('common.success'));
        }
        setIsSavingProfile(false);
    };

    const handleSavePreferences = () => {
        success(t('common.success'), t('settings.savePreferences'));
    };

    const handleResetSettings = () => {
        resetSettings();
        success(t('common.success'), t('settings.resetDefaults'));
    };

    const handleAddCategory = async (type: 'income' | 'expense') => {
        const name = window.prompt(`${t('settings.addCategory')} (${type}):`);
        if (!name) return;

        // Simple random color for now
        const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

        const { error: addError } = await addCategory({
            name,
            type,
            color,
            icon: 'Circle', // Default icon
            is_default: false
        });

        if (addError) {
            error(t('common.error'), t('common.error'));
        } else {
            success(t('common.success'), t('common.success'));
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'account':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">{t('settings.profileInfo')}</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label={t('settings.fullName')}
                                    value={accountForm.full_name}
                                    onChange={(e) => setAccountForm({ ...accountForm, full_name: e.target.value })}
                                />
                                <Input
                                    label={t('settings.email')}
                                    type="email"
                                    value={accountForm.email}
                                    disabled
                                    className="opacity-60 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Change Password</h3>
                            <div className="space-y-4 max-w-md">
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    To change your password, please use the "Forgot Password" functionality on the login page for security reasons.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--color-border)]">
                            <Button
                                variant="primary"
                                leftIcon={<Save size={18} />}
                                onClick={handleSaveProfile}
                                isLoading={isSavingProfile}
                            >
                                {t('settings.saveChanges')}
                            </Button>
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">{t('settings.currency')}</h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {currencies.map((currency) => (
                                    <button
                                        key={currency.code}
                                        onClick={() => updateSettings({ currency: currency.code })}
                                        className={classNames(
                                            'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                                            settings.currency === currency.code
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center font-semibold text-[var(--color-text)]">
                                            {currency.symbol}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--color-text)]">{currency.name}</p>
                                            <p className="text-sm text-[var(--color-text-muted)]">{currency.code}</p>
                                        </div>
                                        {settings.currency === currency.code && (
                                            <Check size={20} className="text-[var(--color-primary)] ml-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">{t('settings.dateFormat')}</h3>
                            <select
                                className="input max-w-md"
                                value={settings.dateFormat}
                                onChange={(e) => updateSettings({ dateFormat: e.target.value })}
                            >
                                {dateFormats.map((format) => (
                                    <option key={format.value} value={format.value}>{format.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">{t('settings.theme')}</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => updateSettings({ theme: 'light' })}
                                    className={classNames(
                                        'flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all',
                                        settings.theme === 'light'
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                    )}
                                >
                                    <Sun size={20} />
                                    <span className="font-medium">{t('settings.light')}</span>
                                </button>
                                <button
                                    onClick={() => updateSettings({ theme: 'dark' })}
                                    className={classNames(
                                        'flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all',
                                        settings.theme === 'dark'
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                    )}
                                >
                                    <Moon size={20} />
                                    <span className="font-medium">{t('settings.dark')}</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">{t('settings.language')}</h3>
                            <select
                                className="input max-w-md"
                                value={settings.language}
                                onChange={(e) => updateSettings({ language: e.target.value })}
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-[var(--color-border)] flex gap-3">
                            <Button variant="primary" leftIcon={<Save size={18} />} onClick={handleSavePreferences}>
                                {t('settings.savePreferences')}
                            </Button>
                            <Button variant="ghost" leftIcon={<RotateCcw size={18} />} onClick={handleResetSettings}>
                                {t('settings.resetDefaults')}
                            </Button>
                        </div>
                    </div>
                );

            case 'categories':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[var(--color-text)]">{t('settings.expenseCategories')}</h3>
                            <Button variant="secondary" size="sm" onClick={() => handleAddCategory('expense')}>{t('settings.addCategory')}</Button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {expenseCategories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between p-4 bg-[var(--color-secondary)] rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${cat.color}20` }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                        </div>
                                        <span className="font-medium text-[var(--color-text)]">{cat.name}</span>
                                    </div>
                                    {!cat.is_default && (
                                        <button
                                            onClick={() => deleteCategory(cat.id)}
                                            className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10 p-2 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-8">
                            <h3 className="text-lg font-semibold text-[var(--color-text)]">{t('settings.incomeCategories')}</h3>
                            <Button variant="secondary" size="sm" onClick={() => handleAddCategory('income')}>{t('settings.addCategory')}</Button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {incomeCategories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between p-4 bg-[var(--color-secondary)] rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${cat.color}20` }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                        </div>
                                        <span className="font-medium text-[var(--color-text)]">{cat.name}</span>
                                    </div>
                                    {!cat.is_default && (
                                        <button
                                            onClick={() => deleteCategory(cat.id)}
                                            className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10 p-2 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-[var(--color-text)]">Email Notifications</h3>
                        <div className="space-y-4">
                            {[
                                { key: 'weeklySummary', title: 'Weekly Summary', desc: 'Receive a weekly overview of your finances' },
                                { key: 'budgetAlerts', title: 'Budget Alerts', desc: 'Get notified when you\'re close to budget limits' },
                                { key: 'billReminders', title: 'Bill Reminders', desc: 'Receive reminders before bills are due' },
                                { key: 'goalProgress', title: 'Goal Progress', desc: 'Updates on your savings goals' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--color-secondary)] rounded-xl">
                                    <div>
                                        <p className="font-medium text-[var(--color-text)]">{item.title}</p>
                                        <p className="text-sm text-[var(--color-text-muted)]">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings[item.key as keyof typeof settings] as boolean}
                                            onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Two-Factor Authentication</h3>
                            <Card className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-[var(--color-text)]">Enable 2FA</p>
                                    <p className="text-sm text-[var(--color-text-muted)]">Add an extra layer of security to your account</p>
                                </div>
                                <Button variant="secondary">Enable</Button>
                            </Card>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Sessions</h3>
                            <Card>
                                <p className="text-sm text-[var(--color-text-muted)] mb-4">You're currently logged in on these devices:</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-[var(--color-secondary)] rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Globe size={20} className="text-[var(--color-text-muted)]" />
                                            <div>
                                                <p className="font-medium text-[var(--color-text)]">Chrome on Windows</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">Current session</p>
                                            </div>
                                        </div>
                                        <Badge variant="success">Active</Badge>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Export Data</h3>
                            <Card>
                                <p className="text-[var(--color-text-muted)] mb-4">
                                    Download all your financial data in various formats.
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="secondary" leftIcon={<Download size={18} />}>
                                        Export CSV
                                    </Button>
                                    <Button variant="secondary" leftIcon={<Download size={18} />}>
                                        Export PDF
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Import Data</h3>
                            <Card>
                                <p className="text-[var(--color-text-muted)] mb-4">
                                    Import transactions from a CSV file.
                                </p>
                                <Button variant="secondary" leftIcon={<Upload size={18} />}>
                                    Import CSV
                                </Button>
                            </Card>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 text-[var(--color-error)]">Danger Zone</h3>
                            <Card className="border-[var(--color-error)]">
                                <p className="text-[var(--color-text-muted)] mb-4">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                                <Button variant="danger" leftIcon={<Trash2 size={18} />}>
                                    Delete Account
                                </Button>
                            </Card>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('settings.title')}</h1>
                <p className="text-[var(--color-text-muted)]">
                    {t('settings.subtitle')}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                    <Card padding="sm">
                        <nav className="space-y-1">
                            {settingsSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={classNames(
                                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left',
                                        activeSection === section.id
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-text)]'
                                    )}
                                >
                                    <section.icon size={20} />
                                    {section.label}
                                    <ChevronRight size={16} className="ml-auto opacity-50" />
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <Card>{renderContent()}</Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;
