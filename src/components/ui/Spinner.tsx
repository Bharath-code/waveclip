import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    variant?: 'default' | 'light';
}

const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
};

export function Spinner({ size = 'md', className, variant = 'default' }: SpinnerProps) {
    return (
        <div
            className={cn(
                'animate-spin rounded-full',
                sizeMap[size],
                variant === 'light'
                    ? 'border-white/30 border-t-white'
                    : 'border-indigo-200 border-t-indigo-600',
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}

interface LoadingOverlayProps {
    loading: boolean;
    children: React.ReactNode;
    message?: string;
}

export function LoadingOverlay({ loading, children, message }: LoadingOverlayProps) {
    return (
        <div className="relative">
            {children}
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg">
                    <Spinner size="lg" />
                    {message && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{message}</p>
                    )}
                </div>
            )}
        </div>
    );
}

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className,
    variant = 'text',
    width,
    height
}: SkeletonProps) {
    const baseStyles = 'shimmer bg-slate-200 dark:bg-slate-700';

    const variantStyles = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={cn(baseStyles, variantStyles[variant], className)}
            style={style}
        />
    );
}

interface PageLoaderProps {
    message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-50">
            <div className="relative">
                <Spinner size="xl" />
                <div className="absolute inset-0 animate-ping">
                    <Spinner size="xl" className="opacity-30" />
                </div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400 animate-pulse">{message}</p>
        </div>
    );
}
