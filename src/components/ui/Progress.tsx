import React from 'react';
import { classNames, calculatePercentage } from '../../lib/utils';

interface ProgressProps {
    value: number;
    max: number;
    variant?: 'primary' | 'accent' | 'warning' | 'error' | 'auto';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    label?: string;
    className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    max,
    variant = 'primary',
    size = 'md',
    showLabel = false,
    label,
    className,
}) => {
    const percentage = calculatePercentage(value, max);

    const getAutoVariant = () => {
        if (percentage < 50) return 'accent';
        if (percentage < 80) return 'warning';
        return 'error';
    };

    const actualVariant = variant === 'auto' ? getAutoVariant() : variant;

    const sizeStyles = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const variantStyles = {
        primary: 'bg-[var(--color-primary)]',
        accent: 'bg-[var(--color-accent)]',
        warning: 'bg-[var(--color-warning)]',
        error: 'bg-[var(--color-error)]',
    };

    return (
        <div className={classNames('w-full', className)}>
            {(showLabel || label) && (
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-[var(--color-text-muted)]">
                        {label || `${percentage.toFixed(0)}%`}
                    </span>
                    {label && showLabel && (
                        <span className="text-sm font-medium text-[var(--color-text)]">
                            {percentage.toFixed(0)}%
                        </span>
                    )}
                </div>
            )}
            <div
                className={classNames(
                    'w-full bg-[var(--color-secondary-dark)] rounded-full overflow-hidden',
                    sizeStyles[size]
                )}
            >
                <div
                    className={classNames(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        variantStyles[actualVariant]
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
};

export default Progress;
