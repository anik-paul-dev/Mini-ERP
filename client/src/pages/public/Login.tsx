import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const { post, loading } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

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
    <div className="card max-w-md mx-auto p-8 relative overflow-hidden backdrop-blur-md">
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand-500/10 blur-3xl"></div>
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-brand-600/10 blur-3xl"></div>
      
      <div className="mb-8 text-center relative z-10">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-white mb-4 shadow-lg shadow-brand-500/30">
          <Layers size={24} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Mini ERP</h2>
        <p className="mt-2 text-sm text-surface-400">Sign in to your account</p>
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
          <div className="mt-1">
            <input
              type="password"
              {...register('password')}
              className={`input-field ${errors.password ? 'border-rose-500 focus:ring-rose-500' : ''}`}
            />
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
      
      <div className="mt-8 border-t border-surface-700 pt-6 text-xs text-center text-surface-400 relative z-10">
        Demo Accounts:
        <br />
        <span className="inline-block mt-2 font-mono text-slate-300 bg-surface-700/50 px-3 py-1 rounded border border-surface-600">admin@minierp.com / password123</span>
      </div>
    </div>
  );
};

export default Login;
