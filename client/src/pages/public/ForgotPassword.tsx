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
      const response = await post<{ resetToken: string }>('/auth/forgot-password', _data);
      if (response && response.resetToken) {
        // In a real app with email, you wouldn't log this.
        // For this demo, we'll log it to console so it can be tested manually.
        console.log('Reset token (for testing without email):', response.resetToken);
        setIsSuccess(true);
      }
    } catch (error) {
      // Error handled by useApi
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-600 mb-6">
          We have sent a password reset link to your email address.
        </p>
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600">Enter your email to receive a reset link</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email address</label>
          <div className="mt-1">
            <input
              type="email"
              {...register('email')}
              className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </div>
        
        <div className="text-center text-sm">
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;



