import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import PasswordStrength from '../../components/ui/PasswordStrength';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { post, loading } = useApi();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      if (!token) return;
      await post(`/auth/reset-password/${token}`, { password: data.password }, { showSuccessToast: true });
      navigate('/login');
    } catch (error) {
      // Error handled by useApi
    }
  };

  return (
    <div className="card max-w-md mx-auto p-8 relative overflow-hidden backdrop-blur-md">
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand-500/10 blur-3xl"></div>
      <div className="mb-6 text-center relative z-10">
        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Set New Password</h2>
        <p className="mt-2 text-sm text-surface-400">Please enter your new password</p>
      </div>

      <form className="space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-slate-300">New Password</label>
          <div className="mt-1">
            <input
              type="password"
              {...register('password')}
              className={`input-field ${errors.password ? 'border-rose-500 focus:ring-rose-500' : ''}`}
            />
            <PasswordStrength password={passwordValue} />
            {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
          <div className="mt-1">
            <input
              type="password"
              {...register('confirmPassword')}
              className={`input-field ${errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : ''}`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 flex items-center justify-center text-sm shadow-brand-500/30"
          >
            {loading ? 'Saving...' : 'Reset Password'}
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

export default ResetPassword;
