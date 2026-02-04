import React from 'react';
import { useSettings } from '../../context/SettingsContext';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
};

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
    const { settings } = useSettings();
    const isDark = settings.theme === 'dark';

    return (
        <img
            src={isDark ? '/logo-dark.png' : '/logo.png'}
            alt="Finanku"
            className={`${sizeClasses[size]} ${className}`}
        />
    );
};

export default Logo;
