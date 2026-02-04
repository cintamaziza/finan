import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotification, type NotificationType } from '../../context/NotificationContext';
import { classNames } from '../../lib/utils';

const iconMap: Record<NotificationType, React.FC<{ size?: number; className?: string }>> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const styleMap: Record<NotificationType, { bg: string; border: string; icon: string; text: string }> = {
    success: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'text-emerald-500',
        text: 'text-emerald-800',
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-500',
        text: 'text-red-800',
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-500',
        text: 'text-amber-800',
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-500',
        text: 'text-blue-800',
    },
};

export const Toast: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
            {notifications.map((notification) => {
                const Icon = iconMap[notification.type];
                const styles = styleMap[notification.type];

                return (
                    <div
                        key={notification.id}
                        className={classNames(
                            'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-up',
                            styles.bg,
                            styles.border
                        )}
                        role="alert"
                    >
                        <Icon size={20} className={styles.icon} />
                        <div className="flex-1 min-w-0">
                            <p className={classNames('font-medium text-sm', styles.text)}>
                                {notification.title}
                            </p>
                            {notification.message && (
                                <p className={classNames('text-sm mt-0.5 opacity-80', styles.text)}>
                                    {notification.message}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className={classNames(
                                'p-1 rounded-lg hover:bg-black/5 transition-colors',
                                styles.text
                            )}
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default Toast;
