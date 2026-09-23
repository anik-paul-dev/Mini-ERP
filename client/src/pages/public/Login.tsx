import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Layers } from 'lucide-react';

const demoAccounts = [
  ['Admin', 'admin@minierp.com'],
  ['Manager', 'manager@nexoraops.com'],
  ['Employee', 'employee@nexoraops.com'],
  ['Procurement', 'procurement@nexoraops.com'],
  ['Finance', 'finance@nexoraops.com'],
  ['Project Lead', 'projectlead@nexoraops.com'],
  ['Assets', 'assets@nexoraops.com'],
  ['Support', 'support@nexoraops.com'],
];

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const { post, loading } = useApi();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const useDemoAccount = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await post<any>('/auth/login', data, { showSuccessToast: true });
      if (response) {
        login(response.user);
        // Page redirect will be handled by App.tsx guards
      }
    } catch (error) {
      // Error handled by useApi
    }
  };

  return (
    <div className="card max-w-xl mx-auto p-8 relative overflow-hidden backdrop-blur-md">
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand-500/10 blur-3xl"></div>
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-brand-600/10 blur-3xl"></div>

      <Link to="/home" className="relative z-10 mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-brand-300">
        <ArrowLeft size={16} />
        Back to home
      </Link>
      
      <div className="mb-8 text-center relative z-10">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-white mb-4 shadow-lg shadow-brand-500/30">
          <Layers size={24} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">NexoraOps</h2>
        <p className="mt-2 text-sm text-surface-400">Sign in to a role-based ERP workspace</p>
      </div>

      <form className="space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-slate-300">Email address</label>
          <div className="mt-1">
            <input
              type="email"
              {...register('email')}
              className={`input-field ${errors.email ? 'border-rose-500 focus:ring-rose-500' : ''}`}
            />
            {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Password</label>
          <div className="mt-1 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`input-field pr-11 ${errors.password ? 'border-rose-500 focus:ring-rose-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 transition-colors hover:text-brand-300"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 flex items-center justify-center text-sm shadow-brand-500/30"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Sign in'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 border-t border-surface-700 pt-6 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-200">Demo accounts</p>
            <p className="mt-1 text-xs text-surface-400">Click any role to fill email and password automatically.</p>
          </div>
          <span className="rounded-lg border border-surface-600 bg-surface-700/50 px-3 py-1 font-mono text-xs text-slate-300">password123</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {demoAccounts.map(([label, email]) => (
            <button
              key={email}
              type="button"
              onClick={() => useDemoAccount(email)}
              className="rounded-lg border border-surface-700 bg-surface-900/70 px-3 py-2 text-left transition-colors hover:border-brand-500/50 hover:bg-brand-500/10"
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">{label}</span>
              <span className="mt-1 block break-all font-mono text-xs text-slate-300">{email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
