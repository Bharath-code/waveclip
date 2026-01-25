import React from 'react';
import { AppLayout, PageContainer } from '@/components/layout';
import { Button, Card, CardHeader, Badge, Input, Spinner } from '@/components/ui';
import { PLANS, formatCurrency, type PlanId } from '@/lib/dodo';
import { cn } from '@/lib/utils';
import {
    User,
    Mail,
    CreditCard,
    Bell,
    Shield,
    Key,
    ExternalLink,
    Check,
    AlertCircle,
    Camera,
    LogOut,
} from 'lucide-react';

type SettingsTab = 'profile' | 'billing' | 'notifications' | 'security';

export default function Settings() {
    const [activeTab, setActiveTab] = React.useState<SettingsTab>('profile');

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: User },
        { id: 'billing' as const, label: 'Billing', icon: CreditCard },
        { id: 'notifications' as const, label: 'Notifications', icon: Bell },
        { id: 'security' as const, label: 'Security', icon: Shield },
    ];

    return (
        <AppLayout userName="John Doe">
            <PageContainer maxWidth="lg" className="py-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                    Settings
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 shrink-0">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                                        activeTab === tab.id
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                                    )}
                                >
                                    <tab.icon className="h-5 w-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                leftIcon={<LogOut className="h-5 w-5" />}
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'billing' && <BillingSettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                    </div>
                </div>
            </PageContainer>
        </AppLayout>
    );
}

// ─── Profile Settings ───
function ProfileSettings() {
    const [name, setName] = React.useState('John Doe');
    const [email, setEmail] = React.useState('john@example.com');
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Call Convex mutation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader
                    title="Profile Information"
                    subtitle="Update your account details"
                />
                <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                                JD
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                                <Camera className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">
                                Profile Photo
                            </h3>
                            <p className="text-sm text-slate-500">
                                JPG, PNG or GIF. Max 2MB.
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-6">
                        <Input
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            leftIcon={<User className="h-4 w-4" />}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={<Mail className="h-4 w-4" />}
                            disabled
                            hint="Contact support to change your email"
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        loading={isSaving}
                    >
                        Save Changes
                    </Button>
                </div>
            </Card>
        </div>
    );
}

// ─── Billing Settings ───
function BillingSettings() {
    // Mock subscription data
    const subscription = {
        plan: 'pro' as PlanId,
        status: 'active',
        nextBillingDate: '2026-02-25',
        amount: 999,
    };

    const plan = PLANS[subscription.plan];

    return (
        <div className="space-y-6">
            {/* Current Plan */}
            <Card>
                <CardHeader
                    title="Current Plan"
                    subtitle="Manage your subscription"
                />
                <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {plan.name} Plan
                                    </h3>
                                    <Badge variant="success">Active</Badge>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {formatCurrency(subscription.amount)}/month • Renews on {subscription.nextBillingDate}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline">
                                Manage
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                            <Button variant="ghost" className="text-rose-600">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Usage */}
            <Card>
                <CardHeader
                    title="Usage This Month"
                    subtitle="Track your export usage"
                />
                <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-600 dark:text-slate-400">Exports</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            23 / {plan.limits.exportsPerMonth === -1 ? '∞' : plan.limits.exportsPerMonth}
                        </span>
                    </div>
                    <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full"
                            style={{ width: '46%' }}
                        />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                        {plan.limits.exportsPerMonth - 23} exports remaining
                    </p>
                </div>
            </Card>

            {/* Payment Method */}
            <Card>
                <CardHeader
                    title="Payment Method"
                    subtitle="Your saved payment methods"
                />
                <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                                VISA
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    •••• •••• •••• 4242
                                </p>
                                <p className="text-sm text-slate-500">Expires 12/28</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">
                            Update
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Payments are processed securely via Dodo Payments
                    </p>
                </div>
            </Card>

            {/* Billing History */}
            <Card>
                <CardHeader
                    title="Billing History"
                    subtitle="Download your invoices"
                />
                <div className="border-t border-slate-200 dark:border-slate-700">
                    {[
                        { date: 'Jan 25, 2026', amount: 999, status: 'Paid' },
                        { date: 'Dec 25, 2025', amount: 999, status: 'Paid' },
                        { date: 'Nov 25, 2025', amount: 999, status: 'Paid' },
                    ].map((invoice, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                        >
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {invoice.date}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {formatCurrency(invoice.amount)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="success">{invoice.status}</Badge>
                                <Button variant="ghost" size="sm">
                                    Download
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ─── Notification Settings ───
function NotificationSettings() {
    const [emailNotifs, setEmailNotifs] = React.useState({
        exportComplete: true,
        weeklyDigest: false,
        productUpdates: true,
        tips: false,
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader
                    title="Email Notifications"
                    subtitle="Choose what emails you receive"
                />
                <div className="divide-y divide-slate-200 dark:divide-slate-700 border-t border-slate-200 dark:border-slate-700">
                    {[
                        {
                            id: 'exportComplete',
                            title: 'Export Complete',
                            description: 'Get notified when your video export is ready',
                        },
                        {
                            id: 'weeklyDigest',
                            title: 'Weekly Digest',
                            description: 'Summary of your activity each week',
                        },
                        {
                            id: 'productUpdates',
                            title: 'Product Updates',
                            description: 'New features and improvements',
                        },
                        {
                            id: 'tips',
                            title: 'Tips & Tutorials',
                            description: 'Learn how to get the most out of Waveclip',
                        },
                    ].map((notif) => (
                        <div key={notif.id} className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {notif.title}
                                </p>
                                <p className="text-sm text-slate-500">{notif.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={emailNotifs[notif.id as keyof typeof emailNotifs]}
                                    onChange={(e) =>
                                        setEmailNotifs({ ...emailNotifs, [notif.id]: e.target.checked })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600" />
                            </label>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ─── Security Settings ───
function SecuritySettings() {
    return (
        <div className="space-y-6">
            {/* Change Password */}
            <Card>
                <CardHeader
                    title="Change Password"
                    subtitle="Update your password regularly for security"
                />
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    <Input
                        label="Current Password"
                        type="password"
                        leftIcon={<Key className="h-4 w-4" />}
                    />
                    <Input
                        label="New Password"
                        type="password"
                        leftIcon={<Key className="h-4 w-4" />}
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        leftIcon={<Key className="h-4 w-4" />}
                    />
                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <Button variant="primary">Update Password</Button>
                </div>
            </Card>

            {/* Sessions */}
            <Card>
                <CardHeader
                    title="Active Sessions"
                    subtitle="Manage your active login sessions"
                />
                <div className="border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    Current Session
                                </p>
                                <p className="text-sm text-slate-500">
                                    Chrome on macOS • Mumbai, India
                                </p>
                            </div>
                        </div>
                        <Badge variant="success">Active</Badge>
                    </div>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-rose-200 dark:border-rose-900">
                <CardHeader
                    title="Danger Zone"
                    subtitle="Irreversible actions"
                />
                <div className="p-6 border-t border-rose-200 dark:border-rose-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                                Delete Account
                            </p>
                            <p className="text-sm text-slate-500">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="text-rose-600 border-rose-300 hover:bg-rose-50"
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
