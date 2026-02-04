import React from 'react';
import { classNames } from '../../lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    className,
}) => {
    const variantStyles = {
        success: 'bg-[var(--color-accent)]/10 text-[var(--color-accent-dark)]',
        warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning-dark)]',
        error: 'bg-[var(--color-error)]/10 text-[var(--color-error-dark)]',
        info: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
        default: 'bg-[var(--color-secondary-dark)] text-[var(--color-text-muted)]',
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={classNames(
                'inline-flex items-center font-medium rounded-full',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {children}
        </span>
    );
};

export default Badge;
