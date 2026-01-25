import React from 'react';
import { Authenticated, Unauthenticated, AuthLoading, useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { PageLoader } from '@/components/ui';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (provider: string, credentials?: Record<string, string>) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { signIn, signOut } = useAuthActions();

    const value: AuthContextType = {
        isAuthenticated,
        isLoading,
        signIn: async (provider: string, credentials?: Record<string, string>) => {
            await signIn(provider, credentials);
        },
        signOut: async () => {
            await signOut();
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Protected Route Wrapper ───
interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    return (
        <>
            <AuthLoading>
                <PageLoader message="Authenticating..." />
            </AuthLoading>
            <Unauthenticated>
                {fallback || <RedirectToLogin />}
            </Unauthenticated>
            <Authenticated>
                {children}
            </Authenticated>
        </>
    );
}

function RedirectToLogin() {
    React.useEffect(() => {
        window.location.href = '/auth/login';
    }, []);
    return <PageLoader message="Redirecting to login..." />;
}

// ─── Public Only Route (redirect if authenticated) ───
interface PublicOnlyRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function PublicOnlyRoute({ children, redirectTo = '/dashboard' }: PublicOnlyRouteProps) {
    return (
        <>
            <AuthLoading>
                <PageLoader message="Loading..." />
            </AuthLoading>
            <Authenticated>
                <RedirectTo path={redirectTo} />
            </Authenticated>
            <Unauthenticated>
                {children}
            </Unauthenticated>
        </>
    );
}

function RedirectTo({ path }: { path: string }) {
    React.useEffect(() => {
        window.location.href = path;
    }, [path]);
    return <PageLoader message="Redirecting..." />;
}
