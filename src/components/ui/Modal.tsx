import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { classNames } from '../../lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className,
}) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeStyles = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleOverlayClick}
        >
            <div
                className={classNames(
                    `w-full bg-[var(--color-bg)] rounded-2xl shadow-xl
          animate-scale-in overflow-hidden`,
                    sizeStyles[size],
                    className
                )}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                        <h2 className="text-xl font-semibold text-[var(--color-text)]">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]
                hover:bg-[var(--color-secondary-dark)] rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
