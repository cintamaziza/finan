import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthUser } from '../types';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    register: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
    logout: () => Promise<void>;
    updateAvatar: (url: string | null) => void;
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

    // Fetch avatar from profiles table
    const fetchAvatarUrl = useCallback(async (userId: string): Promise<string | null> => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', userId)
                .single();
            return data?.avatar_url || null;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        // Get initial session
        const initializeAuth = async () => {
            try {
                console.log('🔄 Initializing auth...');

                // Add timeout to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout')), 5000)
                );

                const sessionPromise = supabase.auth.getSession();

                const { data: { session } } = await Promise.race([
                    sessionPromise,
                    timeoutPromise
                ]) as Awaited<typeof sessionPromise>;

                console.log('🔄 Session result:', session ? 'User found' : 'No session');

                if (!mounted) return;

                if (session?.user) {
                    const avatarUrl = await fetchAvatarUrl(session.user.id);
                    if (!mounted) return;
                    setUser(mapSupabaseUser(session.user, avatarUrl));
                }
            } catch (error) {
                // Ignore AbortError (happens during React Strict Mode remount)
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }
                console.error('Error getting session:', error);
                // Still set loading to false even on error
            } finally {
                console.log('🔄 Auth initialization complete');
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

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
        console.log('📝 Registering user:', email);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        console.log('📝 Registration result:', { data, error });

        if (error) {
            console.error('❌ Registration error:', error.message);
            setIsLoading(false);
            return { error };
        }

        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
            console.log('⚠️ Email already registered');
            setIsLoading(false);
            return { error: { message: 'Email already registered', name: 'AuthError' } as AuthError };
        }

        console.log('✅ User created:', data?.user?.id);
        console.log('📧 Check email for confirmation link (if email confirmation is enabled in Supabase)');

        // User will be set by onAuthStateChange listener
        return { error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const updateAvatar = (url: string | null) => {
        if (user) {
            setUser({ ...user, avatar_url: url });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                updateAvatar,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
