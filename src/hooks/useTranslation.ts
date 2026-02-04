import { useSettings } from '../context/SettingsContext';
import { translations, type TranslationKey, type Language } from '../lib/translations';

export const useTranslation = () => {
    const { settings } = useSettings();
    const language = (settings.language as Language) || 'id'; // Default to ID if undefined

    const t = (key: TranslationKey): string => {
        const langData = translations[language] || translations['en'];
        return langData[key as keyof typeof langData] || key;
    };

    return { t, language };
};
