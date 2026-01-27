import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthActions } from "@convex-dev/auth/react";
import { Button, Card } from '@/components/ui';
import { Mail, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';

type ForgotPasswordStatus = 'idle' | 'sending' | 'sent' | 'error';

export default function ForgotPassword() {
    const { signIn } = useAuthActions();
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState<ForgotPasswordStatus>('idle');
    const [error, setError] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setStatus('sending');
        setError('');

        try {
            // Use Convex Auth's password reset flow
            await signIn("password", {
                flow: "reset",
                email,
            });
            setStatus('sent');
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to send reset email');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">W</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">Waveclip</span>
                    </Link>
                </div>

                <Card className="p-8">
                    {status === 'sent' ? (
                        // Success state
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Check your email
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
                            </p>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setStatus('idle');
                                        setEmail('');
                                    }}
                                >
                                    Try a different email
                                </Button>
                                <Link to="/auth/login">
                                    <Button variant="primary" className="w-full">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        // Form state
                        <>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Forgot your password?
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    No worries! Enter your email and we'll send you a reset link.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                                    <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                                    >
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    disabled={status === 'sending'}
                                >
                                    {status === 'sending' ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    to="/auth/login"
                                    className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/auth/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Sign up free
                    </Link>
                </p>
            </div>
        </div>
    );
}
