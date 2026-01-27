import React from 'react';
import { Button, Card } from '@/components/ui';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });
        // Log to error reporting service (e.g., Sentry)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full text-center">
                        <div className="py-8 px-4">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Something went wrong
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                We encountered an unexpected error. Please try again or go back to the home page.
                            </p>

                            {/* Error Details (dev mode) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-left">
                                    <p className="text-xs font-mono text-rose-600 dark:text-rose-400 break-all">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <pre className="mt-2 text-xs font-mono text-slate-500 overflow-auto max-h-32">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Button
                                    variant="primary"
                                    leftIcon={<RefreshCw className="h-4 w-4" />}
                                    onClick={this.handleReset}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    leftIcon={<Home className="h-4 w-4" />}
                                    onClick={() => window.location.href = '/'}
                                >
                                    Go Home
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for convenience
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
