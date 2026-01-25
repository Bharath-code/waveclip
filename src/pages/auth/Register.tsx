import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthActions } from '@convex-dev/auth/react';
import { AuthLayout } from '@/components/layout';
import { Button, Input, Divider } from '@/components/ui';
import { Chrome, Github, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Register() {
  const { signIn } = useAuthActions();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Password strength checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  const isPasswordValid = passwordStrength >= 3;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Please create a stronger password.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signIn('password', { email, password, name, flow: 'signUp' });
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Failed to create account. This email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      await signIn(provider);
    } catch (err) {
      setError(`Failed to sign up with ${provider}. Please try again.`);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start creating audiograms in minutes"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300">
            {error}
          </div>
        )}

        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          autoFocus
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-colors',
                      passwordStrength >= level
                        ? level <= 2
                          ? 'bg-rose-500'
                          : level === 3
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    )}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {[
                  { key: 'length', label: '8+ characters' },
                  { key: 'uppercase', label: 'Uppercase' },
                  { key: 'lowercase', label: 'Lowercase' },
                  { key: 'number', label: 'Number' },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center gap-1',
                      passwordChecks[key as keyof typeof passwordChecks]
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                    )}
                  >
                    {passwordChecks[key as keyof typeof passwordChecks] ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          error={
            confirmPassword.length > 0 && !doPasswordsMatch
              ? 'Passwords do not match'
              : undefined
          }
          success={doPasswordsMatch}
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="terms"
            className="text-sm text-slate-600 dark:text-slate-400"
          >
            I agree to the{' '}
            <Link
              to="/terms"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
          disabled={!isPasswordValid || !doPasswordsMatch}
        >
          Create account
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
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
