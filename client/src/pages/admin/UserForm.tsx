import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../../../hooks/useApi';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { User, Role } from '../../../types';
import toast from 'react-hot-toast';
import PasswordStrength from '../../../components/ui/PasswordStrength';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  rolePublicId: z.string().min(1, 'Role is required'),
});

type UserFormValues = z.infer<typeof userSchema>;

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { get, post, put, loading } = useApi();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [fetchingUser, setFetchingUser] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const passwordValue = watch('password');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await get<{data: Role[]}>('/roles');
        if (rolesData) setRoles(rolesData.data);
      } catch (error) {
        toast.error('Failed to load roles');
      }
    };
    
    fetchRoles();

    if (isEditMode) {
      const fetchUser = async () => {
        try {
          const user = await get<any>(`/users/${id}`); // user type doesn't have rolePublicId, but response from backend might
          if (user) {
            setValue('name', user.name);
            setValue('email', user.email);
            // We need to find the role id based on role name for edit mode, or backend should return role id
            const matchedRole = roles.find(r => r.name === user.roleName);
            if (matchedRole) {
              setValue('rolePublicId', matchedRole.publicId);
            }
          }
        } catch (error) {
          toast.error('Failed to fetch user details');
          navigate('/admin/users');
        } finally {
          setFetchingUser(false);
        }
      };
      
      if (roles.length > 0) {
        fetchUser();
      }
    } else {
      setFetchingUser(false);
    }
  }, [id, isEditMode, get, setValue, navigate, roles.length]);

  const onSubmit = async (data: UserFormValues) => {
    if (!isEditMode && !data.password) {
      toast.error('Password is required for new users');
      return;
    }

    try {
      if (isEditMode) {
        // Remove password if empty in edit mode
        const submitData = { ...data };
        if (!submitData.password) delete submitData.password;
        
        await put(`/users/${id}`, submitData, { showSuccessToast: true, successMessage: 'User updated' });
      } else {
        await post('/users', data, { showSuccessToast: true, successMessage: 'User created' });
      }
      navigate('/admin/users');
    } catch (error) {
      // Error handled by useApi
    }
  };

  if (fetchingUser) {
    return <div className="p-8 text-center">Loading user details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center space-x-4">
        <Link to="/admin/users" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit User' : 'Add New User'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input type="text" {...register('name')} className={`mt-1 input-field ${errors.name ? 'border-red-500' : ''}`} />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address *</label>
            <input type="email" {...register('email')} className={`mt-1 input-field ${errors.email ? 'border-red-500' : ''}`} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role *</label>
            <select {...register('rolePublicId')} className={`mt-1 input-field ${errors.rolePublicId ? 'border-red-500' : ''}`}>
              <option value="">-- Select Role --</option>
              {roles.map(role => (
                <option key={role.publicId} value={role.publicId}>{role.name}</option>
              ))}
            </select>
            {errors.rolePublicId && <p className="mt-1 text-sm text-red-600">{errors.rolePublicId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password {isEditMode ? '(Leave blank to keep current)' : '*'}
            </label>
            <input 
              type="password" 
              {...register('password')} 
              className={`mt-1 input-field ${errors.password ? 'border-red-500' : ''}`} 
            />
            {passwordValue && <PasswordStrength password={passwordValue} />}
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 space-x-3">
            <Link to="/admin/users" className="btn-outline">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary min-w-[120px]">
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
