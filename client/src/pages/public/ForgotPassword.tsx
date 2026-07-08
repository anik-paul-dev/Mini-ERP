import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { post, loading } = useApi();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (_data: ForgotPasswordFormValues) => {
    try {
      await post('/auth/forgot-password', _data);
      setIsSuccess(true);
    } catch (error) {
      // Error handled by useApi
    }
  };

  if (isSuccess) {
    return (
      <div className="card max-w-md mx-auto p-8 text-center relative overflow-hidden backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-4 border border-emerald-500/20">
          <CheckCircle className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Check your email</h2>
        <p className="text-surface-400 mb-6">
          We have sent a password reset link to your email address.
        </p>
        <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="card max-w-md mx-auto p-8 relative overflow-hidden backdrop-blur-md">
      <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-brand-500/10 blur-3xl"></div>
      <div className="mb-6 text-center relative z-10">
        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Reset Password</h2>
        <p className="mt-2 text-sm text-surface-400">Enter your email to receive a reset link</p>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 flex items-center justify-center text-sm shadow-brand-500/30"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </div>
        
        <div className="text-center text-sm">
          <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
