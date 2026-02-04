import React from 'react';
import { classNames } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className,
    id,
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-[var(--color-text)] mb-1.5"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={classNames(
                        `w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-lg
            text-[var(--color-text)] bg-[var(--color-bg)]
            placeholder:text-[var(--color-text-muted)]
            transition-all duration-150
            focus:outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary)]/10`,
                        leftIcon ? 'pl-10' : '',
                        rightIcon ? 'pr-10' : '',
                        error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10',
                        className
                    )}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{helperText}</p>
            )}
        </div>
    );
};

export default Input;
