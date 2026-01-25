import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FolderOpen,
    Settings,
    CreditCard,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from 'lucide-react';

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FolderOpen, label: 'Projects', href: '/projects' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: CreditCard, label: 'Billing', href: '/billing' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
];

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
    const location = useLocation();

    return (
        <aside
            className={cn(
                'fixed left-0 top-16 bottom-0 z-40',
                'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
                'transition-all duration-300 ease-out',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            <div className="flex flex-col h-full">
                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;

                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                                    'transition-all duration-200',
                                    'group relative',
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'h-5 w-5 shrink-0 transition-transform',
                                        isActive && 'scale-110'
                                    )}
                                />

                                {!collapsed && (
                                    <span className="font-medium truncate">{item.label}</span>
                                )}

                                {collapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}

                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Upgrade Banner */}
                {!collapsed && (
                    <div className="p-3">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5" />
                                <span className="font-semibold">Upgrade to Pro</span>
                            </div>
                            <p className="text-sm text-indigo-100 mb-3">
                                Unlock unlimited exports and AI captions.
                            </p>
                            <button className="w-full py-2 px-3 bg-white text-indigo-600 font-medium rounded-lg text-sm hover:bg-indigo-50 transition-colors">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Collapse Toggle */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={onToggle}
                        className={cn(
                            'flex items-center justify-center w-full py-2 rounded-lg',
                            'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                            'transition-colors'
                        )}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <>
                                <ChevronLeft className="h-5 w-5 mr-2" />
                                <span className="text-sm">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}
