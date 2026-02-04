import React from 'react';
import { classNames } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    disabled,
    ...props
}) => {
    const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-200 ease-in-out cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

    const variantStyles = {
        primary: `
      bg-[var(--color-primary)] text-white
      hover:bg-[var(--color-primary-light)] hover:-translate-y-0.5 hover:shadow-md
      focus:ring-[var(--color-primary)]
    `,
        secondary: `
      bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)]
      hover:bg-[var(--color-primary)] hover:text-white
      focus:ring-[var(--color-primary)]
    `,
        accent: `
      bg-[var(--color-accent)] text-white
      hover:bg-[var(--color-accent-dark)] hover:-translate-y-0.5 hover:shadow-md
      focus:ring-[var(--color-accent)]
    `,
        ghost: `
      bg-transparent text-[var(--color-text)]
      hover:bg-[var(--color-secondary-dark)]
      focus:ring-[var(--color-primary)]
    `,
        danger: `
      bg-[var(--color-error)] text-white
      hover:bg-[var(--color-error-dark)] hover:-translate-y-0.5 hover:shadow-md
      focus:ring-[var(--color-error)]
    `,
    };

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-7 py-3.5 text-lg',
    };

    return (
        <button
            className={classNames(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && 'w-full',
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            ) : (
                leftIcon
            )}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
};

export default Button;
