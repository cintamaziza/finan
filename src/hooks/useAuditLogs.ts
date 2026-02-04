import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface AuditLog {
    id: string;
    user_id: string;
    action: 'create' | 'update' | 'delete';
    entity_type: string;
    entity_id: string;
    entity_name: string | null;
    details: Record<string, unknown> | null;
    created_at: string;
}

export const useAuditLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        if (!user) {
            setLogs([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            setLogs(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            setError('Failed to load audit logs');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Function to log an action
    const logAction = async (
        action: 'create' | 'update' | 'delete',
        entityType: string,
        entityId: string,
        entityName?: string,
        details?: Record<string, unknown>
    ) => {
        if (!user) return;

        try {
            await supabase.from('audit_logs').insert({
                user_id: user.id,
                action,
                entity_type: entityType,
                entity_id: entityId,
                entity_name: entityName || null,
                details: details || null,
            });
        } catch (err) {
            console.error('Error logging action:', err);
        }
    };

    return {
        logs,
        isLoading,
        error,
        refetch: fetchLogs,
        logAction,
    };
};

// Standalone function to log actions without hook context
export const logAuditAction = async (
    userId: string,
    action: 'create' | 'update' | 'delete',
    entityType: string,
    entityId: string,
    entityName?: string,
    details?: Record<string, unknown>
) => {
    try {
        await supabase.from('audit_logs').insert({
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            entity_name: entityName || null,
            details: details || null,
        });
    } catch (err) {
        console.error('Error logging action:', err);
    }
};
