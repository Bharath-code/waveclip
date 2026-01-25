import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthActions } from '@convex-dev/auth/react';
import { AuthLayout } from '@/components/layout';
import { Button, Input, Divider } from '@/components/ui';
import { Chrome, Github } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn('password', { email, password, flow: 'signIn' });
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      await signIn(provider);
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue creating audiograms"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Remember me
            </span>
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
        >
          Sign in
        </Button>
      </form>

      <Divider label="or continue with" className="my-6" />

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleOAuth('google')}
          leftIcon={<Chrome className="h-4 w-4" />}
        >
          Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuth('github')}
          leftIcon={<Github className="h-4 w-4" />}
        >
          GitHub
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          Sign up for free
        </Link>
      </p>
    </AuthLayout>
  );
}
