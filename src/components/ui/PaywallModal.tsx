import React from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
    Sparkles,
    Check,
    Zap,
    Crown,
    ArrowRight,
} from 'lucide-react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUsage?: number;
    maxUsage?: number;
    planName?: string;
}

const plans = [
    {
        id: 'pro',
        name: 'Pro',
        price: '₹999',
        period: '/month',
        icon: Zap,
        color: 'indigo',
        features: [
            '50 exports per month',
            'All video formats',
            'AI captions included',
            'Priority support',
            'No watermark',
        ],
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '₹2,999',
        period: '/month',
        icon: Crown,
        color: 'amber',
        features: [
            'Unlimited exports',
            'All video formats',
            'AI captions included',
            'Priority support',
            'Team collaboration',
            'API access',
        ],
        popular: false,
    },
];

export function PaywallModal({
    isOpen,
    onClose,
    currentUsage = 5,
    maxUsage = 5,
    planName = 'Free',
}: PaywallModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            title=""
        >
            <div className="text-center py-4">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    You've reached your limit
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    You've used {currentUsage} of {maxUsage} exports on the {planName} plan.
                    <br />
                    Upgrade to continue creating amazing audiograms.
                </p>

                {/* Usage Bar */}
                <div className="max-w-xs mx-auto mb-8">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-500">Monthly exports</span>
                        <span className="font-medium text-rose-600">{currentUsage}/{maxUsage}</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-rose-500 rounded-full" />
                    </div>
                </div>

                {/* Plans */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                'relative p-6 rounded-xl border-2 text-left transition-all',
                                plan.popular
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            )}
                        >
                            {plan.popular && (
                                <Badge
                                    variant="primary"
                                    size="sm"
                                    className="absolute -top-2 right-4"
                                >
                                    Most Popular
                                </Badge>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-lg flex items-center justify-center',
                                        plan.popular
                                            ? 'bg-indigo-100 dark:bg-indigo-900'
                                            : 'bg-amber-100 dark:bg-amber-900'
                                    )}
                                >
                                    <plan.icon
                                        className={cn(
                                            'h-5 w-5',
                                            plan.popular
                                                ? 'text-indigo-600 dark:text-indigo-400'
                                                : 'text-amber-600 dark:text-amber-400'
                                        )}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {plan.price}
                                        </span>
                                        <span className="text-sm text-slate-500">{plan.period}</span>
                                    </div>
                                </div>
                            </div>

                            <ul className="space-y-2 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link to="/pricing">
                                <Button
                                    variant={plan.popular ? 'primary' : 'outline'}
                                    className="w-full"
                                    rightIcon={<ArrowRight className="h-4 w-4" />}
                                >
                                    {plan.popular ? 'Upgrade to Pro' : 'Choose Plan'}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <p className="text-xs text-slate-500">
                    Cancel anytime. 7-day money-back guarantee.
                </p>
            </div>
        </Modal>
    );
}
