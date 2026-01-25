import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// ─── Toast Types ───
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

// ─── Toast Context ───
const ToastContext = React.createContext<ToastState | null>(null);

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// ─── Toast Provider ───
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newToast: Toast = { ...toast, id };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after duration
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// ─── Toast Container ───
function ToastContainer({
    toasts,
    removeToast,
}: {
    toasts: Toast[];
    removeToast: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return createPortal(
        <div
            className="fixed top-4 right-4 z-[300] flex flex-col gap-3 max-w-md w-full pointer-events-none"
            aria-live="polite"
            aria-label="Notifications"
        >
            {toasts.map((toast, index) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                />
            ))}
        </div>,
        document.body
    );
}

// ─── Toast Item ───
const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
};

const bgMap: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800',
    error: 'bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
};

function ToastItem({
    toast,
    onClose,
    style,
}: {
    toast: Toast;
    onClose: () => void;
    style?: React.CSSProperties;
}) {
    return (
        <div
            className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg',
                'animate-slide-in',
                bgMap[toast.type]
            )}
            style={style}
            role="alert"
        >
            <div className="shrink-0 mt-0.5">{iconMap[toast.type]}</div>

            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white">{toast.title}</p>
                {toast.message && (
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                        {toast.message}
                    </p>
                )}
            </div>

            <button
                onClick={onClose}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-colors"
                aria-label="Dismiss notification"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// ─── Convenience Functions ───
export function toast(type: ToastType, title: string, message?: string) {
    // This is a placeholder - actual implementation requires the context
    console.warn('toast() called outside of ToastProvider. Use useToast() hook instead.');
}
