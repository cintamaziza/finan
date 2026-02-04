import React from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    PieChart,
    Target,
    Bell,
    Shield,
    Smartphone,
    ArrowRight,
    CheckCircle2,
    Star
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Button } from '../components/ui';

// Dummy chart data for the landing page preview
const demoChartData = [
    { month: 'Jan', income: 18500000, expenses: 12000000 },
    { month: 'Feb', income: 20000000, expenses: 9500000 },
    { month: 'Mar', income: 19200000, expenses: 11000000 },
    { month: 'Apr', income: 21500000, expenses: 8200000 },
    { month: 'May', income: 22000000, expenses: 9800000 },
    { month: 'Jun', income: 23000000, expenses: 8500000 },
];

const features = [
    {
        icon: TrendingUp,
        title: 'Track Every Dollar',
        description: 'Monitor all your transactions in one place with automatic categorization and real-time updates.',
    },
    {
        icon: PieChart,
        title: 'Smart Budgeting',
        description: 'Create custom budgets for each category and get instant alerts when you\'re close to your limits.',
    },
    {
        icon: Target,
        title: 'Goal Setting',
        description: 'Set financial goals and track your progress with visual milestones and achievement celebrations.',
    },
    {
        icon: Bell,
        title: 'Bill Reminders',
        description: 'Never miss a payment with automated reminders and upcoming bill notifications.',
    },
    {
        icon: Shield,
        title: 'Bank-Level Security',
        description: 'Your financial data is protected with enterprise-grade encryption and security protocols.',
    },
    {
        icon: Smartphone,
        title: 'Works Everywhere',
        description: 'Access your finances from any device with our responsive design and offline support.',
    },
];

const testimonials = [
    {
        name: 'Sarah J.',
        role: 'Freelancer',
        content: 'Finanku helped me save $5,000 in just 6 months. The budget tracking is incredibly intuitive!',
        rating: 5,
    },
    {
        name: 'Michael R.',
        role: 'Software Engineer',
        content: 'Finally, a finance app that doesn\'t require a PhD to use. Clean, simple, and effective.',
        rating: 5,
    },
    {
        name: 'Emily T.',
        role: 'Small Business Owner',
        content: 'The insights and reports have completely changed how I manage both personal and business finances.',
        rating: 5,
    },
];

export const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--color-secondary)]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Finanku" className="h-10 w-auto dark:hidden" />
                            <img src="/logo-dark.png" alt="Finanku" className="h-10 w-auto hidden dark:block" />
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium">
                                Features
                            </a>
                            <a href="#testimonials" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium">
                                Testimonials
                            </a>
                            <a href="#pricing" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium">
                                Pricing
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="ghost">Log In</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary" rightIcon={<ArrowRight size={18} />}>
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full text-[var(--color-primary)] font-medium text-sm mb-6 animate-fade-in">
                            <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse"></span>
                            Now with AI-powered insights
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Take Control of Your{' '}
                            <span className="bg-gradient-to-r from-[var(--color-primary)] via-purple-500 to-[var(--color-accent)] bg-clip-text text-transparent">
                                Financial Future
                            </span>
                        </h1>

                        <p className="text-xl text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            Track expenses, create budgets, and achieve your financial goals with the most intuitive personal finance app. Start your journey to financial freedom today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <Link to="/register">
                                <Button size="lg" variant="primary" rightIcon={<ArrowRight size={20} />}>
                                    Start Free Trial
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="secondary">
                                    Watch Demo
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-sm text-[var(--color-text-muted)] animate-fade-in" style={{ animationDelay: '0.5s' }}>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <CheckCircle2 size={18} className="text-[var(--color-accent)] flex-shrink-0" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <CheckCircle2 size={18} className="text-[var(--color-accent)] flex-shrink-0" />
                                <span>Free 14-day trial</span>
                            </div>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <CheckCircle2 size={18} className="text-[var(--color-accent)] flex-shrink-0" />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mt-16 relative animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <div className="bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent rounded-3xl p-4 sm:p-8">
                            <div className="bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
                                <div className="p-6 border-b border-[var(--color-border)]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[var(--color-error)]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]"></div>
                                    </div>
                                </div>
                                <div className="p-6 sm:p-8">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        {[
                                            { label: 'Total Saldo', value: 'Rp 698.250.000', color: 'primary' },
                                            { label: 'Pendapatan Bulanan', value: 'Rp 23.000.000', color: 'accent' },
                                            { label: 'Pengeluaran Bulanan', value: 'Rp 8.500.000', color: 'error' },
                                            { label: 'Tingkat Tabungan', value: '63%', color: 'accent' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-[var(--color-secondary)] rounded-xl p-4">
                                                <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
                                                <p className={`text-xl sm:text-2xl font-bold text-[var(--color-${stat.color})]`}>
                                                    {stat.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-48 rounded-xl overflow-hidden">
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                            <AreaChart data={demoChartData}>
                                                <defs>
                                                    <linearGradient id="colorIncomeDemo" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorExpensesDemo" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis
                                                    dataKey="month"
                                                    stroke="#9ca3af"
                                                    fontSize={11}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="#9ca3af"
                                                    fontSize={11}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) => `${value / 1000000}jt`}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    }}
                                                    formatter={(value) => [`Rp ${((value as number) / 1000000).toFixed(1)} jt`, '']}
                                                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="income"
                                                    name="Pendapatan"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill="url(#colorIncomeDemo)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="expenses"
                                                    name="Pengeluaran"
                                                    stroke="#ef4444"
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill="url(#colorExpensesDemo)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
                            Everything You Need to Manage Your Money
                        </h2>
                        <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
                            Powerful features designed to help you understand, track, and grow your wealth.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-6 bg-[var(--color-secondary)] rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                                >
                                    <feature.icon size={24} className="text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-[var(--color-text-muted)]">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
                            Loved by Thousands of Users
                        </h2>
                        <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
                            See what our users have to say about their experience with Finanku.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={18} className="text-[var(--color-warning)] fill-[var(--color-warning)]" />
                                    ))}
                                </div>
                                <p className="text-[var(--color-text)] mb-6 text-lg">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]"></div>
                                    <div>
                                        <p className="font-medium text-[var(--color-text)]">{testimonial.name}</p>
                                        <p className="text-sm text-[var(--color-text-muted)]">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
                            Choose the plan that fits your needs. All plans include a 14-day free trial.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-[var(--color-secondary)] rounded-2xl p-8 relative">
                            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Free</h3>
                            <p className="text-[var(--color-text-muted)] mb-6">Perfect for getting started</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[var(--color-text)]">Rp 0</span>
                                <span className="text-[var(--color-text-muted)]">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {['Up to 2 accounts', 'Basic transaction tracking', 'Monthly reports', 'Budget alerts'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                        <CheckCircle2 size={18} className="text-[var(--color-accent)]" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register">
                                <Button variant="secondary" fullWidth>Get Started</Button>
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-[var(--color-primary)] relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white px-4 py-1 rounded-full text-sm font-medium">
                                Most Popular
                            </div>
                            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Pro</h3>
                            <p className="text-[var(--color-text-muted)] mb-6">For serious budgeters</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[var(--color-text)]">Rp 49k</span>
                                <span className="text-[var(--color-text-muted)]">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {['Unlimited accounts', 'Advanced analytics', 'Goal tracking', 'Bill reminders', 'Export to CSV/PDF', 'Priority support'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                        <CheckCircle2 size={18} className="text-[var(--color-accent)]" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register">
                                <Button variant="primary" fullWidth>Start Free Trial</Button>
                            </Link>
                        </div>

                        {/* Business Plan */}
                        <div className="bg-[var(--color-secondary)] rounded-2xl p-8 relative">
                            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Business</h3>
                            <p className="text-[var(--color-text-muted)] mb-6">For teams & families</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[var(--color-text)]">Rp 149k</span>
                                <span className="text-[var(--color-text-muted)]">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {['Everything in Pro', 'Up to 5 users', 'Shared budgets', 'Team reports', 'API access', 'Dedicated support'].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                        <CheckCircle2 size={18} className="text-[var(--color-accent)]" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register">
                                <Button variant="secondary" fullWidth>Contact Sales</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="gradient-hero rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                Ready to Transform Your Finances?
                            </h2>
                            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                                Join thousands of users who have already taken control of their financial future. Start your free trial today.
                            </p>
                            <Link to="/register">
                                <Button
                                    size="lg"
                                    className="!bg-white !text-[var(--color-primary)] hover:!bg-white/90"
                                    rightIcon={<ArrowRight size={20} />}
                                >
                                    Get Started for Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[var(--color-text)] text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/logo-dark.png" alt="Finanku" className="h-10 w-auto" />
                            </div>
                            <p className="text-white/60">
                                Your personal finance companion for smarter money management.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-white/60">
                                <li><a href="#features" className="hover:text-white">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                                <li><a href="#" className="hover:text-white">Integrations</a></li>
                                <li><a href="#" className="hover:text-white">Updates</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-white/60">
                                <li><a href="#" className="hover:text-white">About</a></li>
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Press</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-white/60">
                                <li><a href="#" className="hover:text-white">Privacy</a></li>
                                <li><a href="#" className="hover:text-white">Terms</a></li>
                                <li><a href="#" className="hover:text-white">Security</a></li>
                                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 text-center text-white/60">
                        <p>© 2024 Finanku. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
