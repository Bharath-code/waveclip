import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    success?: boolean;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = 'text',
            label,
            error,
            success,
            hint,
            leftIcon,
            rightIcon,
            disabled,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        const inputStyles = cn(
            // Base
            'w-full rounded-lg border bg-white px-4 py-2.5',
            'text-slate-900 placeholder-slate-400',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2',

            // States
            error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : success
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20',

            // Dark mode
            'dark:bg-slate-800 dark:text-white dark:border-slate-600',
            'dark:placeholder-slate-500',

            // With icons
            leftIcon && 'pl-11',
            (rightIcon || isPassword) && 'pr-11',

            // Disabled
            disabled && 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900',

            className
        );

        return (
            <div className="w-full">
                {label && (
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        type={inputType}
                        className={inputStyles}
                        disabled={disabled}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    )}

                    {!isPassword && rightIcon && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            {rightIcon}
                        </div>
                    )}

                    {error && !rightIcon && !isPassword && (
                        <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
                    )}

                    {success && !error && !rightIcon && !isPassword && (
                        <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    )}
                </div>

                {(error || hint) && (
                    <p className={cn(
                        'mt-1.5 text-sm',
                        error ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
                    )}>
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
