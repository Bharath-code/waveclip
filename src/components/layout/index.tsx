import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: boolean;
}

const maxWidthStyles = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
};

export function PageContainer({
    children,
    className,
    maxWidth = '2xl',
    padding = true,
}: PageContainerProps) {
    return (
        <div
            className={cn(
                'mx-auto w-full',
                maxWidthStyles[maxWidth],
                padding && 'px-4 sm:px-6 lg:px-8',
                className
            )}
        >
            {children}
        </div>
    );
}

// ─── Marketing Layout (Landing, Pricing, etc.) ───
interface MarketingLayoutProps {
    children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar isAuthenticated={false} />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
}

// ─── App Layout (Dashboard, Editor, etc.) ───
interface AppLayoutProps {
    children: React.ReactNode;
    userName?: string;
    onLogout?: () => void;
}

export function AppLayout({ children, userName, onLogout }: AppLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar
                isAuthenticated={true}
                userName={userName}
                onLogout={onLogout}
            />
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main
                className={cn(
                    'pt-16 min-h-screen transition-all duration-300',
                    sidebarCollapsed ? 'ml-16' : 'ml-64'
                )}
            >
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

// ─── Auth Layout (Login, Register) ───
interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="mx-auto w-full max-w-sm">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <svg
                                className="h-6 w-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            Audiogram
                        </span>
                    </a>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-2 text-slate-500 dark:text-slate-400">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Form Content */}
                    {children}
                </div>
            </div>

            {/* Right Panel - Decorative */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
                    </div>

                    {/* Waveform Pattern */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-end gap-1 h-32">
                            {[...Array(40)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 bg-white/30 rounded-full"
                                    style={{
                                        height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 50}%`,
                                        animationDelay: `${i * 50}ms`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="absolute bottom-12 left-12 right-12 text-white">
                        <blockquote className="text-xl font-medium leading-relaxed">
                            "Audiogram helped me turn my podcast into viral clips. My engagement went up 400%!"
                        </blockquote>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/20" />
                            <div>
                                <div className="font-medium">Sarah Chen</div>
                                <div className="text-sm text-white/70">Podcast Host, Tech Talk Daily</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Barrel Export ───
export { Navbar } from './Navbar';
export { Sidebar } from './Sidebar';
export { Footer } from './Footer';
