import React from 'react';
import { Link } from 'react-router-dom';
import { MarketingLayout, PageContainer } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import { PricingSEO } from '@/components/SEO';
import { PLANS, formatCurrency, calculateYearlySavings, type PlanId } from '@/lib/dodo';
import { cn } from '@/lib/utils';
import {
    Check,
    X,
    Sparkles,
    Zap,
    Building2,
    ArrowRight,
    HelpCircle,
} from 'lucide-react';

export default function Pricing() {
    const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');

    return (
        <MarketingLayout>
            <PricingSEO />
            <PageContainer className="py-20 lg:py-32">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge variant="primary" className="mb-4">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Simple, Transparent Pricing
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Choose your plan
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Start free and upgrade when you need more. No hidden fees, cancel anytime.
                    </p>

                    {/* Billing Toggle */}
                    <div className="mt-8 inline-flex items-center gap-4 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <button
                            onClick={() => setBillingInterval('monthly')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                billingInterval === 'monthly'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400'
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval('yearly')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                                billingInterval === 'yearly'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400'
                            )}
                        >
                            Yearly
                            <Badge variant="success" size="sm">Save 17%</Badge>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <PricingCard
                        plan={PLANS.free}
                        billingInterval={billingInterval}
                        icon={<Zap className="h-6 w-6" />}
                        ctaText="Get Started Free"
                        ctaHref="/auth/register"
                    />

                    {/* Pro Plan - Featured */}
                    <PricingCard
                        plan={PLANS.pro}
                        billingInterval={billingInterval}
                        icon={<Sparkles className="h-6 w-6" />}
                        featured
                        ctaText="Start Pro Trial"
                        ctaHref="/auth/register?plan=pro"
                    />

                    {/* Enterprise Plan */}
                    <PricingCard
                        plan={PLANS.enterprise}
                        billingInterval={billingInterval}
                        icon={<Building2 className="h-6 w-6" />}
                        ctaText="Contact Sales"
                        ctaHref="/contact"
                    />
                </div>

                {/* Feature Comparison */}
                <div className="mt-24">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12">
                        Compare all features
                    </h2>
                    <FeatureComparison />
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12">
                        Frequently Asked Questions
                    </h2>
                    <FAQSection />
                </div>

                {/* CTA Section */}
                <div className="mt-24 text-center">
                    <Card className="p-12 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50 border-indigo-100 dark:border-indigo-900">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Still have questions?
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Our team is here to help you choose the right plan for your needs.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Button variant="outline">
                                <HelpCircle className="h-4 w-4 mr-2" />
                                View Documentation
                            </Button>
                            <Button variant="primary">
                                Contact Support
                            </Button>
                        </div>
                    </Card>
                </div>
            </PageContainer>
        </MarketingLayout>
    );
}

// ─── Pricing Card Component ───
interface PricingCardProps {
    plan: typeof PLANS[PlanId];
    billingInterval: 'monthly' | 'yearly';
    icon: React.ReactNode;
    featured?: boolean;
    ctaText: string;
    ctaHref: string;
}

function PricingCard({
    plan,
    billingInterval,
    icon,
    featured = false,
    ctaText,
    ctaHref,
}: PricingCardProps) {
    const price = billingInterval === 'monthly' ? plan.priceMonthly : plan.priceYearly / 12;
    const isEnterprise = plan.id === 'enterprise';
    const isPro = plan.id === 'pro';

    return (
        <Card
            className={cn(
                'relative flex flex-col',
                featured && 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20'
            )}
        >
            {featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="primary" className="shadow-lg">
                        Most Popular
                    </Badge>
                </div>
            )}

            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                    featured
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                )}>
                    {icon}
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {plan.name}
                </h3>

                <div className="mt-4 flex items-baseline gap-1">
                    {plan.priceMonthly === 0 ? (
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">Free</span>
                    ) : (
                        <>
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">
                                {formatCurrency(Math.round(price))}
                            </span>
                            <span className="text-slate-500">/month</span>
                        </>
                    )}
                </div>

                {billingInterval === 'yearly' && plan.priceYearly > 0 && (
                    <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(plan.priceYearly)} billed yearly
                    </p>
                )}
            </div>

            <div className="p-6 flex-1">
                <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-6 pt-0">
                <Link to={ctaHref}>
                    <Button
                        variant={featured ? 'primary' : 'outline'}
                        className="w-full"
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                        {ctaText}
                    </Button>
                </Link>
            </div>
        </Card>
    );
}

// ─── Feature Comparison Table ───
function FeatureComparison() {
    const features = [
        { name: 'Exports per month', free: '5', pro: '50', enterprise: 'Unlimited' },
        { name: 'Max audio length', free: '2 min', pro: '10 min', enterprise: '30 min' },
        { name: 'Max file size', free: '25 MB', pro: '100 MB', enterprise: '500 MB' },
        { name: 'Video resolution', free: '720p', pro: '1080p', enterprise: '4K' },
        { name: 'Watermark', free: true, pro: false, enterprise: false },
        { name: 'AI Captions', free: false, pro: true, enterprise: true },
        { name: 'Custom branding', free: false, pro: false, enterprise: true },
        { name: 'API access', free: false, pro: false, enterprise: true },
        { name: 'Priority support', free: false, pro: true, enterprise: true },
        { name: 'Dedicated account manager', free: false, pro: false, enterprise: true },
    ];

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-4 px-6 text-left text-sm font-medium text-slate-500">
                            Feature
                        </th>
                        <th className="py-4 px-6 text-center text-sm font-medium text-slate-500">
                            Free
                        </th>
                        <th className="py-4 px-6 text-center text-sm font-medium text-slate-500 bg-indigo-50 dark:bg-indigo-950/50">
                            Pro
                        </th>
                        <th className="py-4 px-6 text-center text-sm font-medium text-slate-500">
                            Enterprise
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {features.map((feature, i) => (
                        <tr
                            key={feature.name}
                            className={cn(
                                'border-b border-slate-100 dark:border-slate-800',
                                i % 2 === 0 && 'bg-slate-50/50 dark:bg-slate-900/50'
                            )}
                        >
                            <td className="py-4 px-6 text-sm text-slate-900 dark:text-white">
                                {feature.name}
                            </td>
                            <FeatureCell value={feature.free} />
                            <FeatureCell value={feature.pro} highlighted />
                            <FeatureCell value={feature.enterprise} />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function FeatureCell({ value, highlighted = false }: { value: string | boolean; highlighted?: boolean }) {
    return (
        <td className={cn(
            'py-4 px-6 text-center text-sm',
            highlighted && 'bg-indigo-50 dark:bg-indigo-950/50'
        )}>
            {typeof value === 'boolean' ? (
                value ? (
                    <X className="h-5 w-5 text-slate-300 mx-auto" />
                ) : (
                    <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                )
            ) : (
                <span className="text-slate-700 dark:text-slate-300">{value}</span>
            )}
        </td>
    );
}

// ─── FAQ Section ───
function FAQSection() {
    const faqs = [
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major payment methods in India including UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, and popular wallets like Paytm and PhonePe via Dodo Payments.',
        },
        {
            question: 'Can I cancel my subscription anytime?',
            answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.',
        },
        {
            question: 'What happens when I hit my export limit?',
            answer: 'When you reach your monthly export limit, you can either wait for the next billing cycle or upgrade to a higher plan for more exports.',
        },
        {
            question: 'Do you offer refunds?',
            answer: 'We offer a full refund within 7 days of your first subscription payment if you\'re not satisfied with the service.',
        },
        {
            question: 'Is there a free trial for Pro plans?',
            answer: 'While we don\'t offer a traditional free trial, you can start with our Free plan to test all core features before upgrading to Pro.',
        },
        {
            question: 'Do you offer discounts for students or non-profits?',
            answer: 'Yes! Contact us at hello@waveclip.app with proof of student status or non-profit registration for special pricing.',
        },
    ];

    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <div className="space-y-4">
            {faqs.map((faq, i) => (
                <div
                    key={i}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <span className="font-medium text-slate-900 dark:text-white">
                            {faq.question}
                        </span>
                        <span className={cn(
                            'text-2xl text-slate-400 transition-transform',
                            openIndex === i && 'rotate-45'
                        )}>
                            +
                        </span>
                    </button>
                    {openIndex === i && (
                        <div className="px-5 pb-5">
                            <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
