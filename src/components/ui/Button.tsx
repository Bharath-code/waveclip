import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            loading = false,
            disabled,
            leftIcon,
            rightIcon,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = [
            'inline-flex items-center justify-center gap-2',
            'font-medium rounded-lg',
            'transition-all duration-200 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
            'active:scale-[0.98]',
        ];

        const variants = {
            primary: [
                'bg-indigo-600 text-white',
                'hover:bg-indigo-700',
                'focus:ring-indigo-500',
                'shadow-md hover:shadow-lg',
            ],
            secondary: [
                'bg-slate-100 text-slate-700',
                'hover:bg-slate-200',
                'focus:ring-slate-500',
                'dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
            ],
            ghost: [
                'bg-transparent text-slate-600',
                'hover:bg-slate-100',
                'focus:ring-slate-400',
                'dark:text-slate-300 dark:hover:bg-slate-800',
            ],
            danger: [
                'bg-rose-600 text-white',
                'hover:bg-rose-700',
                'focus:ring-rose-500',
                'shadow-md hover:shadow-lg',
            ],
            outline: [
                'bg-transparent text-indigo-600 border-2 border-indigo-600',
                'hover:bg-indigo-50',
                'focus:ring-indigo-500',
                'dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-950',
            ],
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2.5 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : leftIcon ? (
                    <span className="shrink-0">{leftIcon}</span>
                ) : null}
                {children}
                {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
