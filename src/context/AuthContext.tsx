import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthUser } from '../types';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    register: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    logout: () => Promise<void>;
    updateAvatar: (url: string | null) => void;
    updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

// Convert Supabase user to our AuthUser type
const mapSupabaseUser = (user: User, avatarUrl?: string | null): AuthUser => ({
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || null,
    avatar_url: avatarUrl ?? user.user_metadata?.avatar_url ?? null,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch avatar from profiles table with timeout
    const fetchAvatarUrl = useCallback(async (userId: string): Promise<string | null> => {
        try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise<null>((resolve) =>
                setTimeout(() => resolve(null), 3000)
            );

            const fetchPromise = (async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', userId)
                    .single();
                return data?.avatar_url || null;
            })();

            return await Promise.race([fetchPromise, timeoutPromise]);
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        // Get initial session with retry logic
        const getSessionWithTimeout = async (timeout: number): Promise<{ session: any } | null> => {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout')), timeout)
            );

            try {
                const { data: { session } } = await Promise.race([
                    supabase.auth.getSession(),
                    timeoutPromise
                ]) as Awaited<ReturnType<typeof supabase.auth.getSession>>;
                return { session };
            } catch {
                return null;
            }
        };

        const initializeAuth = async () => {
            try {

                // First attempt with 5 second timeout
                let result = await getSessionWithTimeout(5000);

                // If first attempt times out, retry with longer timeout
                if (!result) {
                    result = await getSessionWithTimeout(10000);
                }

                if (!mounted) return;

                if (result?.session?.user) {
                    const avatarUrl = await fetchAvatarUrl(result.session.user.id);
                    if (!mounted) return;
                    setUser(mapSupabaseUser(result.session.user, avatarUrl));
                }
            } catch (error) {
                // Ignore AbortError (happens during React Strict Mode remount)
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }
                console.error('Error getting session:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

        // FAILSAFE: Guarantee loading stops after 8 seconds no matter what
        const failsafeTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 8000);

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: string, session: Session | null) => {
                if (!mounted) return;

                if (session?.user) {
                    const avatarUrl = await fetchAvatarUrl(session.user.id);
                    if (!mounted) return;
                    setUser(mapSupabaseUser(session.user, avatarUrl));
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            }
        );

        return () => {
            mounted = false;
            clearTimeout(failsafeTimeout);
            subscription.unsubscribe();
        };
    }, [fetchAvatarUrl]);

    const login = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setIsLoading(false);
                return { error };
            }

            // Explicitly set user after successful login
            if (data?.user) {
                const avatarUrl = await fetchAvatarUrl(data.user.id);
                setUser(mapSupabaseUser(data.user, avatarUrl));
            }

            setIsLoading(false);
            return { error: null };
        } catch (err) {
            setIsLoading(false);
            return { error: { message: 'Login failed', name: 'AuthError' } as AuthError };
        }
    };

    const register = async (
        email: string,
        password: string,
        fullName: string
    ): Promise<{ error: AuthError | null }> => {
        setIsLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            console.error('❌ Registration error:', error.message);
            setIsLoading(false);
            return { error };
        }

        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
            setIsLoading(false);
            return { error: { message: 'Email already registered', name: 'AuthError' } as AuthError };
        }


        // User will be set by onAuthStateChange listener
        return { error: null };
    };

    const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) {
            return { error };
        }

        return { error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const updateAvatar = useCallback((url: string | null) => {
        if (user) {
            setUser({ ...user, avatar_url: url });
        }
    }, [user]);

    const updateProfile = useCallback(async (updates: { full_name?: string; avatar_url?: string }) => {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });

        if (error) {
            return { error };
        }

        if (data.user) {
            setUser(prev => prev ? mapSupabaseUser(data.user, prev.avatar_url) : null);
        }

        return { error: null };
    }, []);

    const contextValue = useMemo(() => ({
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        signInWithGoogle,
        logout,
        updateAvatar,
        updateProfile,
    }), [user, isLoading, login, register, signInWithGoogle, logout, updateAvatar, updateProfile]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
