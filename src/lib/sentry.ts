import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Call this at the very start of your app, before rendering
 */
export function initSentry(): void {
    // Only initialize in production
    if (import.meta.env.DEV) {
        console.log('[Sentry] Skipping initialization in development');
        return;
    }

    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) {
        console.warn('[Sentry] No DSN configured. Set VITE_SENTRY_DSN in .env');
        return;
    }

    Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                // Capture 10% of sessions, 100% on error
                maskAllText: false,
                blockAllMedia: false,
            }),
        ],
        // Performance monitoring
        tracesSampleRate: 0.1, // Capture 10% of transactions
        // Session replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        // Only send errors from our domain
        allowUrls: [
            /https?:\/\/.*waveclip\./,
            /https?:\/\/localhost/,
        ],
        // Don't send errors from browser extensions
        denyUrls: [
            /extensions\//i,
            /^chrome:\/\//i,
            /^chrome-extension:\/\//i,
        ],
        // Filter sensitive data
        beforeSend(event) {
            // Remove sensitive data from errors
            if (event.request) {
                delete event.request.cookies;
                delete event.request.data;
            }
            return event;
        },
    });

    console.log('[Sentry] Initialized successfully');
}

/**
 * Capture a custom error with context
 */
export function captureError(
    error: Error,
    context?: Record<string, unknown>
): void {
    Sentry.captureException(error, {
        extra: context,
    });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
    id: string;
    email?: string;
    plan?: string;
} | null): void {
    if (user) {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            segment: user.plan,
        });
    } else {
        Sentry.setUser(null);
    }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
    category: string,
    message: string,
    data?: Record<string, unknown>
): void {
    Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: 'info',
    });
}

/**
 * Start a performance transaction
 */
export function startTransaction(
    name: string,
    op: string
): ReturnType<typeof Sentry.startSpan> {
    return Sentry.startSpan({ name, op }, () => { });
}

// Re-export Sentry components for use in app
export {
    ErrorBoundary as SentryErrorBoundary,
    withProfiler,
} from '@sentry/react';
