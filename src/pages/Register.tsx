import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading, signInWithGoogle } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const { error } = await register(formData.email, formData.password, formData.fullName);

        if (error) {
            setErrors({ submit: error.message || 'Registration failed. Please try again.' });
        } else {
            navigate('/dashboard');
        }
    };

    const passwordStrength = () => {
        const { password } = formData;
        if (!password) return { score: 0, label: '' };

        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['', 'var(--color-error)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-primary)'];

        return { score, label: labels[score], color: colors[score] };
    };

    const strength = passwordStrength();

    return (
        <div className="min-h-screen bg-[var(--color-secondary)] flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

                <div className="text-white relative z-10 max-w-md">
                    <h2 className="text-3xl font-bold mb-6">
                        Start your journey to financial freedom
                    </h2>

                    <div className="space-y-4">
                        {[
                            'Track all your expenses in one place',
                            'Create personalized budgets that work for you',
                            'Set and achieve your financial goals',
                            'Get insights to improve your spending',
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <CheckCircle2 size={14} />
                                </div>
                                <span className="text-white/90">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <p className="text-white/80 italic">
                            "Finanku completely changed how I think about money. I've saved more in 3 months than I did all last year!"
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20"></div>
                            <div>
                                <p className="font-medium">Jessica M.</p>
                                <p className="text-sm text-white/60">Marketing Manager</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <img src="/logo.png" alt="Finanku" className="h-10 w-auto dark:hidden" />
                        <img src="/logo-dark.png" alt="Finanku" className="h-10 w-auto hidden dark:block" />
                    </Link>

                    <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                        Create your account
                    </h1>
                    <p className="text-[var(--color-text-muted)] mb-8">
                        Start your 14-day free trial. No credit card required.
                    </p>

                    {errors.submit && (
                        <div className="mb-6 p-4 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-lg text-sm">
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            error={errors.fullName}
                            leftIcon={<User size={18} />}
                        />

                        <Input
                            label="Email address"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                            leftIcon={<Mail size={18} />}
                        />

                        <div>
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={errors.password}
                                leftIcon={<Lock size={18} />}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="hover:text-[var(--color-text)]"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className="h-1 flex-1 rounded-full transition-colors"
                                                style={{
                                                    backgroundColor: level <= strength.score ? strength.color : 'var(--color-secondary-dark)',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs" style={{ color: strength.color }}>
                                        {strength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Input
                            label="Confirm password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            error={errors.confirmPassword}
                            leftIcon={<Lock size={18} />}
                        />

                        <div>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.acceptTerms}
                                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                                    className="mt-1 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="text-sm text-[var(--color-text-muted)]">
                                    I agree to the{' '}
                                    <a href="#" className="text-[var(--color-primary)] hover:underline">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>
                                </span>
                            </label>
                            {errors.acceptTerms && (
                                <p className="mt-1 text-sm text-[var(--color-error)]">{errors.acceptTerms}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                            rightIcon={<ArrowRight size={18} />}
                        >
                            Create account
                        </Button>
                    </form>
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--color-border)]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[var(--color-secondary)] text-[var(--color-text-muted)]">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => signInWithGoogle()}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[var(--color-border)] rounded-lg hover:bg-[var(--color-primary)]/5 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="font-medium text-[var(--color-text)]">Continue with Google</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-[var(--color-text-muted)]">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
