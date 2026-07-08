import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import PasswordStrength from '../../components/ui/PasswordStrength';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { user, login } = useAuth();
  const { put, post, loading } = useApi();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const newPasswordValue = watchPassword('newPassword');

  useEffect(() => {
    if (user) {
      setProfileValue('name', user.name);
    }
  }, [user, setProfileValue]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      const updatedUser = await put<any>('/auth/profile', data, { showSuccessToast: true });
      if (updatedUser && user) {
        login({ ...user, name: updatedUser.name });
      }
    } catch (error) {
      // Error handled by useApi
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }, { showSuccessToast: true });
      resetPasswordForm();
    } catch (error) {
      // Error handled by useApi
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
      </div>

      <div className="card">
        <div className="border-b border-surface-700/50">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-brand-500 text-brand-400 bg-surface-700/20'
                  : 'border-transparent text-surface-400 hover:text-slate-300 hover:border-surface-500'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'password'
                  ? 'border-brand-500 text-brand-400 bg-surface-700/20'
                  : 'border-transparent text-surface-400 hover:text-slate-300 hover:border-surface-500'
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300">Role</label>
                <div className="mt-1">
                  <input
                    type="text"
                    disabled
                    value={user?.roleName || ''}
                    className="input-field bg-surface-700/50 text-surface-400 cursor-not-allowed opacity-70 border-surface-600"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300">Email</label>
                <div className="mt-1">
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="input-field bg-surface-700/50 text-surface-400 cursor-not-allowed opacity-70 border-surface-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    {...registerProfile('name')}
                    className={`input-field ${profileErrors.name ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                  />
                  {profileErrors.name && <p className="mt-1 text-sm text-rose-400">{profileErrors.name.message}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300">Current Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    {...registerPassword('currentPassword')}
                    className={`input-field ${passwordErrors.currentPassword ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                  />
                  {passwordErrors.currentPassword && <p className="mt-1 text-sm text-rose-400">{passwordErrors.currentPassword.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">New Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    {...registerPassword('newPassword')}
                    className={`input-field ${passwordErrors.newPassword ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                  />
                  <PasswordStrength password={newPasswordValue} />
                  {passwordErrors.newPassword && <p className="mt-1 text-sm text-rose-400">{passwordErrors.newPassword.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Confirm New Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    {...registerPassword('confirmPassword')}
                    className={`input-field ${passwordErrors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                  />
                  {passwordErrors.confirmPassword && <p className="mt-1 text-sm text-rose-400">{passwordErrors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
