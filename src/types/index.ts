// User Profile
export interface Profile {
    id: string;
    full_name: string | null;
    email: string;
    currency: string;
    date_format: string;
    created_at: string;
}

// Financial Account (bank, credit card, cash)
export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: 'bank' | 'credit_card' | 'cash' | 'investment' | 'other';
    balance: number;
    currency: string;
    color: string;
    icon: string;
    created_at: string;
    updated_at: string;
}

// Transaction Category
export interface Category {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
    is_default: boolean;
}

// Transaction
export interface Transaction {
    id: string;
    user_id: string;
    account_id: string;
    category_id: string;
    amount: number;
    description: string;
    date: string;
    type: 'income' | 'expense';
    is_recurring: boolean;
    created_at: string;
    updated_at: string;
    // Joined fields
    account?: Account;
    category?: Category;
}

// Budget
export interface Budget {
    id: string;
    user_id: string;
    category_id: string;
    amount: number;
    spent: number;
    period: 'monthly' | 'yearly';
    start_date: string;
    created_at: string;
    // Joined fields
    category?: Category;
}

// Financial Goal
export interface Goal {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    category: 'emergency_fund' | 'vacation' | 'house' | 'car' | 'education' | 'retirement' | 'other';
    color: string;
    icon: string;
    created_at: string;
    updated_at: string;
}

// Bill Reminder
export interface BillReminder {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    due_date: string;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    category_id: string | null;
    is_paid: boolean;
    auto_pay: boolean;
    created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    recentTransactions: Transaction[];
    upcomingBills: BillReminder[];
    budgetProgress: Budget[];
    goalProgress: Goal[];
}

// Form Types
export interface TransactionFormData {
    amount: number;
    description: string;
    category_id: string;
    account_id: string;
    date: string;
    type: 'income' | 'expense';
}

export interface AccountFormData {
    name: string;
    type: Account['type'];
    balance: number;
    currency: string;
    color: string;
    icon: string;
}

export interface BudgetFormData {
    category_id: string;
    amount: number;
    period: 'monthly' | 'yearly';
    start_date: string;
}

export interface GoalFormData {
    name: string;
    description: string;
    target_amount: number;
    deadline: string;
    category: Goal['category'];
    color: string;
    icon: string;
}

// Auth Types
export interface AuthUser {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    full_name: string;
    confirm_password: string;
}
