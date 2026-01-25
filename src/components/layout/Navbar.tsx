import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
    AudioWaveform,
    Menu,
    X,
    LogIn,
    UserPlus,
    LayoutDashboard,
    Settings,
    LogOut,
    Sparkles,
} from 'lucide-react';

interface NavbarProps {
    isAuthenticated?: boolean;
    userName?: string;
    onLogout?: () => void;
}

export function Navbar({ isAuthenticated = false, userName, onLogout }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const location = useLocation();

    const navLinks = [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'FAQ', href: '/#faq' },
    ];

    const authLinks = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="container-app">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 group"
                    >
                        <div className="relative">
                            <AudioWaveform className="h-8 w-8 text-indigo-600 transition-transform group-hover:scale-110" />
                            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl font-bold text-gradient">Audiogram</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {!isAuthenticated && navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    'text-sm font-medium transition-colors',
                                    location.pathname === link.href
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
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
                                    'flex items-center gap-2 text-sm font-medium transition-colors',
                                    location.pathname === link.href
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                    {userName}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLogout}
                                    leftIcon={<LogOut className="h-4 w-4" />}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<LogIn className="h-4 w-4" />}
                                    onClick={() => window.location.href = '/auth/login'}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<UserPlus className="h-4 w-4" />}
                                    onClick={() => window.location.href = '/auth/register'}
                                >
                                    Sign Up Free
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                        <div className="flex flex-col gap-2">
                            {!isAuthenticated && navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {isAuthenticated && authLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}

                            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                                {isAuthenticated ? (
                                    <button
                                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        onClick={onLogout}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2 px-3">
                                        <Button variant="outline" onClick={() => window.location.href = '/auth/login'}>
                                            Login
                                        </Button>
                                        <Button variant="primary" onClick={() => window.location.href = '/auth/register'}>
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
