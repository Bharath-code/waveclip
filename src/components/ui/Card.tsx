import React from 'react';
import { cn } from '@/lib/utils';

// ─── Card Component ───
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
}

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

const variantStyles = {
    default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm',
    elevated: 'bg-white dark:bg-slate-800 shadow-lg',
    outlined: 'bg-transparent border-2 border-slate-200 dark:border-slate-700',
    ghost: 'bg-slate-50 dark:bg-slate-800/50',
};

export function Card({
    className,
    variant = 'default',
    padding = 'md',
    hoverable = false,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                'rounded-xl',
                variantStyles[variant],
                paddingStyles[padding],
                hoverable && 'transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// ─── CardHeader ───
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export function CardHeader({
    className,
    title,
    subtitle,
    action,
    children,
    ...props
}: CardHeaderProps) {
    if (children) {
        return (
            <div className={cn('mb-4', className)} {...props}>
                {children}
            </div>
        );
    }

    return (
        <div className={cn('flex items-start justify-between mb-4', className)} {...props}>
            <div>
                {title && (
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {title}
                    </h3>
                )}
                {subtitle && (
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div className="shrink-0 ml-4">{action}</div>}
        </div>
    );
}

// ─── CardContent ───
export function CardContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn(className)} {...props}>
            {children}
        </div>
    );
}

// ─── CardFooter ───
export function CardFooter({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// ─── Badge Component ───
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
    size?: 'sm' | 'md';
}

const badgeVariants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    error: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
    outline: 'bg-transparent border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300',
};

const badgeSizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
};

export function Badge({
    className,
    variant = 'default',
    size = 'sm',
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full',
                badgeVariants[variant],
                badgeSizes[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

// ─── Divider Component ───
interface DividerProps {
    className?: string;
    label?: string;
    orientation?: 'horizontal' | 'vertical';
}

export function Divider({ className, label, orientation = 'horizontal' }: DividerProps) {
    if (orientation === 'vertical') {
        return (
            <div className={cn('w-px bg-slate-200 dark:bg-slate-700', className)} />
        );
    }

    if (label) {
        return (
            <div className={cn('flex items-center gap-4 my-4', className)}>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
        );
    }

    return (
        <div className={cn('h-px bg-slate-200 dark:bg-slate-700 my-4', className)} />
    );
}

// ─── Empty State Component ───
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
            {icon && (
                <div className="mb-4 p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
