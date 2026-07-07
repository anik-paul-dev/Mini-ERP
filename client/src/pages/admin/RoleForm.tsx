import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../../hooks/useApi';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Role } from '../../types';
import toast from 'react-hot-toast';

const PERMISSION_GROUPS = {
  Products: ['products:create', 'products:read', 'products:update', 'products:delete'],
  Customers: ['customers:create', 'customers:read', 'customers:update', 'customers:delete'],
  Sales: ['sales:create', 'sales:read'],
  Users: ['users:create', 'users:read', 'users:update', 'users:delete'],
  Roles: ['roles:create', 'roles:read', 'roles:update', 'roles:delete'],
  Dashboard: ['dashboard:read'],
};

const roleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const RoleForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { get, post, put, loading } = useApi();
  
  const [fetchingRole, setFetchingRole] = useState(isEditMode);
  const [isSystemRole, setIsSystemRole] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      permissions: [],
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchRole = async () => {
        try {
          const role = await get<Role>(`/roles/${id}`);
          if (role) {
            setValue('name', role.name);
            setValue('description', role.description || '');
            setValue('permissions', role.permissions || []);
            setIsSystemRole(role.isSystem);
          }
        } catch (error) {
          toast.error('Failed to fetch role details');
          navigate('/admin/roles');
        } finally {
          setFetchingRole(false);
        }
      };
      
      fetchRole();
    }
  }, [id, isEditMode, get, setValue, navigate]);

  const onSubmit = async (data: RoleFormValues) => {
    try {
      if (isEditMode) {
        // System roles shouldn't have their name changed by the user, but we'll send it and let backend handle or omit it.
        const submitData = isSystemRole ? { permissions: data.permissions, description: data.description } : data;
        await put(`/roles/${id}`, submitData, { showSuccessToast: true, successMessage: 'Role updated successfully' });
      } else {
        await post('/roles', data, { showSuccessToast: true, successMessage: 'Role created successfully' });
      }
      navigate('/admin/roles');
    } catch (error) {
      // Error handled by useApi
    }
  };

  if (fetchingRole) {
    return <div className="p-8 text-center">Loading role details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center space-x-4">
        <Link to="/admin/roles" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Role & Permissions' : 'Create New Role'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role Name *</label>
              <input 
                type="text" 
                {...register('name')} 
                disabled={isSystemRole}
                className={`mt-1 input-field ${errors.name ? 'border-red-500' : ''} ${isSystemRole ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
              />
              {isSystemRole && <p className="mt-1 text-xs text-gray-500">System role names cannot be changed.</p>}
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input 
                type="text" 
                {...register('description')} 
                className="mt-1 input-field" 
              />
            </div>
          </div>

          <div>
            <div className="border-b border-gray-100 pb-2 mb-4">
              <h3 className="text-lg font-medium text-gray-900">Permissions *</h3>
              <p className="text-sm text-gray-500">Select the permissions to assign to this role.</p>
              {errors.permissions && <p className="mt-1 text-sm text-red-600">{errors.permissions.message}</p>}
            </div>

            <Controller
              name="permissions"
              control={control}
              render={({ field }) => (
                <div className="space-y-6">
                  {Object.entries(PERMISSION_GROUPS).map(([groupName, perms]) => (
                    <div key={groupName} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-3">{groupName}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {perms.map(permission => {
                          const isChecked = field.value.includes(permission);
                          const [, action] = permission.split(':');
                          
                          return (
                            <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, permission]);
                                  } else {
                                    field.onChange(field.value.filter((p: string) => p !== permission));
                                  }
                                }}
                                className="rounded text-brand-600 focus:ring-brand-500 border-gray-300"
                              />
                              <span className="text-sm text-gray-700 capitalize">{action}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100 space-x-3">
            <Link to="/admin/roles" className="btn-outline">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary min-w-[120px]">
              {loading ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;

