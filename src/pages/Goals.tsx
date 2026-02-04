import React, { useState } from 'react';
import {
    Plus,
    Target,
    Calendar,
    Trophy,
    Sparkles,
    Edit,
    Trash2,
    PiggyBank,
    Plane,
    Car,
    GraduationCap,
    Home,
    Shield,
    Loader2
} from 'lucide-react';
import { Card, Button, Progress, Badge, Modal, Input } from '../components/ui';
import { formatCurrency, classNames } from '../lib/utils';
import { useGoals } from '../hooks';
import type { Goal } from '../types';

const goalCategoryIcons: Record<string, React.ElementType> = {
    emergency_fund: Shield,
    vacation: Plane,
    house: Home,
    car: Car,
    education: GraduationCap,
    retirement: PiggyBank,
    other: Target,
};

const goalCategoryColors: Record<string, string> = {
    emergency_fund: '#6B7280',
    vacation: '#3B82F6',
    house: '#10B981',
    car: '#F59E0B',
    education: '#8B5CF6',
    retirement: '#EC4899',
    other: '#6366F1',
};

export const Goals: React.FC = () => {
    const { goals, isLoading, error, addGoal, updateGoal, deleteGoal, addToGoal } = useGoals();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<Goal | null>(null);
    const [contributionAmount, setContributionAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'emergency_fund' as Goal['category'],
        target_amount: '',
        current_amount: '',
        deadline: '',
    });

    const totalGoalAmount = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
    const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
    const completedGoals = goals.filter(g => Number(g.current_amount) >= Number(g.target_amount)).length;

    const getDaysRemaining = (deadline: string | null) => {
        if (!deadline) return null;
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'emergency_fund',
            target_amount: '',
            current_amount: '',
            deadline: '',
        });
        setEditingGoal(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (goal: Goal) => {
        setFormData({
            name: goal.name,
            description: goal.description || '',
            category: goal.category,
            target_amount: String(goal.target_amount),
            current_amount: String(goal.current_amount),
            deadline: goal.deadline || '',
        });
        setEditingGoal(goal);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const goalData = {
            name: formData.name,
            description: formData.description || null,
            category: formData.category,
            target_amount: parseFloat(formData.target_amount),
            current_amount: parseFloat(formData.current_amount) || 0,
            deadline: formData.deadline || null,
            color: goalCategoryColors[formData.category] || '#6366F1',
            icon: formData.category,
        };

        if (editingGoal) {
            await updateGoal(editingGoal.id, goalData);
        } else {
            await addGoal(goalData);
        }

        setIsSubmitting(false);
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            await deleteGoal(id);
        }
    };

    const handleOpenContributionModal = (goal: Goal) => {
        setSelectedGoalForContribution(goal);
        setContributionAmount('');
        setIsContributionModalOpen(true);
    };

    const handleAddContribution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGoalForContribution) return;

        setIsSubmitting(true);
        await addToGoal(selectedGoalForContribution.id, parseFloat(contributionAmount));
        setIsSubmitting(false);
        setIsContributionModalOpen(false);
        setSelectedGoalForContribution(null);
        setContributionAmount('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-[var(--color-error)]">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Financial Goals</h1>
                    <p className="text-[var(--color-text-muted)]">
                        Track your progress towards your financial dreams
                    </p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Plus size={18} />}
                    onClick={handleOpenAddModal}
                >
                    Create Goal
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent rounded-full blur-2xl" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                                <Target size={20} className="text-[var(--color-primary)]" />
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)]">Total Goal Amount</p>
                        </div>
                        <p className="text-2xl font-bold text-[var(--color-text)]">
                            {formatCurrency(totalGoalAmount)}
                        </p>
                    </div>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--color-accent)]/20 to-transparent rounded-full blur-2xl" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
                                <PiggyBank size={20} className="text-[var(--color-accent)]" />
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)]">Total Saved</p>
                        </div>
                        <p className="text-2xl font-bold text-[var(--color-accent)]">
                            {formatCurrency(totalSaved)}
                        </p>
                    </div>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--color-warning)]/20 to-transparent rounded-full blur-2xl" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-center">
                                <Trophy size={20} className="text-[var(--color-warning)]" />
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)]">Goals Completed</p>
                        </div>
                        <p className="text-2xl font-bold text-[var(--color-text)]">
                            {completedGoals} / {goals.length}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Goals Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                    const percentage = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                    const daysRemaining = getDaysRemaining(goal.deadline);
                    const Icon = goalCategoryIcons[goal.category] || Target;
                    const isCompleted = percentage >= 100;
                    const goalColor = goal.color || goalCategoryColors[goal.category] || '#6366F1';

                    return (
                        <Card
                            key={goal.id}
                            className={classNames(
                                'group relative overflow-hidden',
                                isCompleted && 'ring-2 ring-[var(--color-accent)]'
                            )}
                        >
                            {/* Background decoration */}
                            <div
                                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                                style={{ backgroundColor: goalColor }}
                            />

                            {isCompleted && (
                                <div className="absolute top-4 right-4">
                                    <Badge variant="success" className="gap-1">
                                        <Sparkles size={12} />
                                        Completed!
                                    </Badge>
                                </div>
                            )}

                            <div className="relative">
                                <div className="flex items-start gap-3 mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: goalColor }}
                                    >
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-[var(--color-text)]">{goal.name}</h3>
                                        {goal.description && (
                                            <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">
                                                {goal.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[var(--color-text-muted)]">Progress</span>
                                        <span className="font-medium" style={{ color: goalColor }}>
                                            {percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={Number(goal.current_amount)}
                                        max={Number(goal.target_amount)}
                                        variant="primary"
                                        size="lg"
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="text-[var(--color-text-muted)]">Saved</p>
                                        <p className="font-semibold text-[var(--color-text)]">
                                            {formatCurrency(Number(goal.current_amount))}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[var(--color-text-muted)]">Target</p>
                                        <p className="font-semibold text-[var(--color-text)]">
                                            {formatCurrency(Number(goal.target_amount))}
                                        </p>
                                    </div>
                                </div>

                                {daysRemaining !== null && (
                                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                                            <Calendar size={16} />
                                            <span>
                                                {daysRemaining > 0
                                                    ? `${daysRemaining} days left`
                                                    : 'Deadline passed'}
                                            </span>
                                        </div>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-1.5 hover:bg-[var(--color-secondary)] rounded-lg"
                                                onClick={() => handleOpenEditModal(goal)}
                                            >
                                                <Edit size={14} className="text-[var(--color-text-muted)]" />
                                            </button>
                                            <button
                                                className="p-1.5 hover:bg-[var(--color-error)]/10 rounded-lg"
                                                onClick={() => handleDelete(goal.id)}
                                            >
                                                <Trash2 size={14} className="text-[var(--color-error)]" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!daysRemaining && (
                                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-end">
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-1.5 hover:bg-[var(--color-secondary)] rounded-lg"
                                                onClick={() => handleOpenEditModal(goal)}
                                            >
                                                <Edit size={14} className="text-[var(--color-text-muted)]" />
                                            </button>
                                            <button
                                                className="p-1.5 hover:bg-[var(--color-error)]/10 rounded-lg"
                                                onClick={() => handleDelete(goal.id)}
                                            >
                                                <Trash2 size={14} className="text-[var(--color-error)]" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isCompleted && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full mt-4"
                                        onClick={() => handleOpenContributionModal(goal)}
                                    >
                                        Add Contribution
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}

                {/* Add Goal Card */}
                <Card
                    hover
                    className="border-2 border-dashed border-[var(--color-border)] flex items-center justify-center min-h-[280px] cursor-pointer hover:border-[var(--color-primary)] group"
                    onClick={handleOpenAddModal}
                >
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-primary)]/10 transition-colors">
                            <Plus size={28} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                        </div>
                        <p className="font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]">
                            Create New Goal
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">
                            Start saving for your dreams
                        </p>
                    </div>
                </Card>
            </div>

            {/* Create/Edit Goal Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Goal Name"
                        placeholder="e.g., Emergency Fund"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Description (optional)"
                        placeholder="What are you saving for?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                            Category
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(goalCategoryIcons).map(([key, IconComp]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: key as Goal['category'] })}
                                    className={classNames(
                                        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                                        formData.category === key
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                                            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                    )}
                                >
                                    <IconComp size={20} className={formData.category === key ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
                                    <span className="text-xs capitalize">{key.replace('_', ' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Input
                        label="Target Amount"
                        type="number"
                        placeholder="10000.00"
                        value={formData.target_amount}
                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                        required
                    />

                    <Input
                        label="Current Amount (optional)"
                        type="number"
                        placeholder="0.00"
                        helperText="How much have you already saved?"
                        value={formData.current_amount}
                        onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                    />

                    <Input
                        label="Target Date"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" isLoading={isSubmitting}>
                            {editingGoal ? 'Save Changes' : 'Create Goal'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Add Contribution Modal */}
            <Modal
                isOpen={isContributionModalOpen}
                onClose={() => {
                    setIsContributionModalOpen(false);
                    setSelectedGoalForContribution(null);
                    setContributionAmount('');
                }}
                title="Add Contribution"
                size="sm"
            >
                <form onSubmit={handleAddContribution} className="space-y-5">
                    {selectedGoalForContribution && (
                        <div className="p-4 bg-[var(--color-secondary)] rounded-xl">
                            <p className="text-sm text-[var(--color-text-muted)]">Adding to</p>
                            <p className="font-semibold text-[var(--color-text)]">{selectedGoalForContribution.name}</p>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                Current: {formatCurrency(Number(selectedGoalForContribution.current_amount))} / {formatCurrency(Number(selectedGoalForContribution.target_amount))}
                            </p>
                        </div>
                    )}

                    <Input
                        label="Contribution Amount"
                        type="number"
                        placeholder="100.00"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => {
                                setIsContributionModalOpen(false);
                                setSelectedGoalForContribution(null);
                                setContributionAmount('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" isLoading={isSubmitting}>
                            Add Contribution
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Goals;

