import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
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
  const loading = false;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch('password');

  const onSubmit = async (_data: ResetPasswordFormValues) => {
    try {
      // In a real app, this endpoint would exist.
      // await post(`/auth/reset-password/${token}`, { password: data.password }, { showSuccessToast: true });
      navigate('/login');
    } catch (error) {
      // Error handled by useApi
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Set New Password</h2>
        <p className="mt-2 text-sm text-gray-600">Please enter your new password</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <div className="mt-1">
            <input
              type="password"
              {...register('password')}
              className={`input-field ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            <PasswordStrength password={passwordValue} />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div className="mt-1">
            <input
              type="password"
              {...register('confirmPassword')}
              className={`input-field ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;

