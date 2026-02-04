import React, { memo } from 'react';
import { classNames } from '../../lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    glass?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = memo(({
    children,
    className,
    padding = 'md',
    hover = false,
    glass = false,
    onClick,
}) => {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={classNames(
                `bg-[var(--color-bg)] rounded-xl shadow-sm border border-[var(--color-border)]/50
        transition-all duration-200`,
                paddingStyles[padding],
                hover && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
                glass && 'glass border-white/20 dark:border-white/10',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = memo(({
    title,
    subtitle,
    action,
    className,
}) => {
    return (
        <div className={classNames('flex items-center justify-between mb-4', className)}>
            <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">{title}</h3>
                {subtitle && (
                    <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
});

CardHeader.displayName = 'CardHeader';

export default Card;

