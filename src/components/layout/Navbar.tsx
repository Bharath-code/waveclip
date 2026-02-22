import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface NavbarProps {
    isAuthenticated?: boolean;
    userName?: string;
    onLogout?: () => void;
}

const Icon = ({ icon, className = "", style = {} }: { icon: string; className?: string, style?: any }) => {
    return (
        // @ts-ignore
        <iconify-icon icon={icon} class={className} style={style}></iconify-icon>
    );
};

export function Navbar({ isAuthenticated = false, userName, onLogout }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const location = useLocation();

    // Dark mode state
    const [isDark, setIsDark] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    React.useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const navLinks = [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'FAQ', href: '/#faq' },
    ];

    const authLinks = [
        { label: 'Dashboard', href: '/dashboard', icon: 'solar:widget-5-bold-duotone' },
        { label: 'Settings', href: '/settings', icon: 'solar:settings-bold-duotone' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-500">
            <div className="container-app">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 group"
                    >
                        <div className="relative">
                            <Icon icon="solar:record-circle-bold-duotone" className="text-3xl text-indigo-600 transition-transform group-hover:scale-110" />
                            <Icon icon="solar:star-fall-bold-duotone" className="absolute -top-1 -right-1 text-xs text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">WaveClip</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {!isAuthenticated && navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    'text-sm font-semibold tracking-tight transition-colors',
                                    location.pathname === link.href
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {isAuthenticated && authLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    'flex items-center gap-2 text-sm font-semibold tracking-tight transition-colors group',
                                    location.pathname === link.href
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                )}
                            >
                                <Icon icon={link.icon} className="text-lg group-hover:scale-110 transition-transform" />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons & Theme Toggle */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300"
                            aria-label="Toggle theme"
                        >
                            <Icon icon={isDark ? "solar:sun-2-bold-duotone" : "solar:moon-bold-duotone"} className="text-xl" />
                        </button>

                        {isAuthenticated ? (
                            <>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    {userName}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLogout}
                                >
                                    <Icon icon="solar:logout-2-bold-duotone" className="text-lg mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/auth/login" className="text-sm font-semibold tracking-tight text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link to="/auth/register" className="relative inline-flex h-9 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 group">
                                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] group-hover:bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,#a5b4fc_50%,#fff_100%)] transition-colors duration-500" />
                                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 px-5 text-sm font-semibold tracking-tight text-slate-900 dark:text-white backdrop-blur-3xl transition-colors">
                                        Execute Access
                                    </span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button & Theme Toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300"
                            aria-label="Toggle theme"
                        >
                            <Icon icon={isDark ? "solar:sun-2-bold-duotone" : "solar:moon-bold-duotone"} className="text-xl" />
                        </button>
                        <button
                            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-300"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <Icon icon={mobileMenuOpen ? "solar:close-circle-bold-duotone" : "solar:hamburger-menu-bold-duotone"} className="text-2xl" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-6 border-t border-slate-200 dark:border-slate-800 animate-fade-in bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl absolute left-0 right-0 px-4 shadow-xl">
                        <div className="flex flex-col gap-4">
                            {!isAuthenticated && navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="px-4 py-3 rounded-xl text-sm font-semibold tracking-tight text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {isAuthenticated && authLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-tight text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon icon={link.icon} className="text-xl text-indigo-500" />
                                    {link.label}
                                </Link>
                            ))}

                            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
                                {isAuthenticated ? (
                                    <button
                                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-tight text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50"
                                        onClick={onLogout}
                                    >
                                        <Icon icon="solar:logout-2-bold-duotone" className="text-xl text-rose-500" />
                                        Logout
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Button variant="outline" className="w-full justify-center h-12 rounded-xl" onClick={() => window.location.href = '/auth/login'}>
                                            Login
                                        </Button>
                                        <Button variant="primary" className="w-full justify-center h-12 rounded-xl" onClick={() => window.location.href = '/auth/register'}>
                                            Sign Up Free
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
