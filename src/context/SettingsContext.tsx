import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface UserSettings {
    // Preferences
    currency: string;
    dateFormat: string;
    theme: 'light' | 'dark';
    language: string;
    // Notifications
    weeklySummary: boolean;
    budgetAlerts: boolean;
    billReminders: boolean;
    goalProgress: boolean;
}

const defaultSettings: UserSettings = {
    currency: 'IDR',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    language: 'id',
    weeklySummary: true,
    budgetAlerts: true,
    billReminders: true,
    goalProgress: false,
};

const STORAGE_KEY = 'dimfin_settings';

interface SettingsContextValue {
    settings: UserSettings;
    updateSettings: (updates: Partial<UserSettings>) => void;
    resetSettings: () => void;
    isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings({ ...defaultSettings, ...parsed });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        setIsLoaded(true);
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            } catch (error) {
                console.error('Failed to save settings:', error);
            }
        }
    }, [settings, isLoaded]);

    // Apply theme changes
    useEffect(() => {
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.theme]);

    const updateSettings = useCallback((updates: Partial<UserSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                updateSettings,
                resetSettings,
                isLoaded,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
