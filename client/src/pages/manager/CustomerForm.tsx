import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../../hooks/useApi';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Customer } from '../../types';
import toast from 'react-hot-toast';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phone: z.string().or(z.literal('')),
  address: z.string().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const CustomerForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { get, post, put, loading } = useApi();
  const [fetchingCustomer, setFetchingCustomer] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchCustomer = async () => {
        try {
          const customer = await get<Customer>(`/customers/${id}`);
          if (customer) {
            setValue('name', customer.name);
            setValue('email', customer.email || '');
            setValue('phone', customer.phone || '');
            setValue('address', customer.address || '');
          }
        } catch (error) {
          toast.error('Failed to fetch customer details');
          navigate('/manager/customers');
        } finally {
          setFetchingCustomer(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEditMode, get, setValue, navigate]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (isEditMode) {
        await put(`/customers/${id}`, data, { showSuccessToast: true, successMessage: 'Customer updated' });
      } else {
        await post('/customers', data, { showSuccessToast: true, successMessage: 'Customer created' });
      }
      navigate('/manager/customers');
    } catch (error) {
      // Error handled by useApi
    }
  };

  if (fetchingCustomer) {
    return <div className="p-8 text-center">Loading customer details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center space-x-4">
        <Link to="/manager/customers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
              <input type="text" {...register('name')} className={`mt-1 input-field ${errors.name ? 'border-red-500' : ''}`} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" {...register('email')} className={`mt-1 input-field ${errors.email ? 'border-red-500' : ''}`} />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="text" {...register('phone')} className={`mt-1 input-field ${errors.phone ? 'border-red-500' : ''}`} />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea 
                rows={3}
                {...register('address')} 
                className={`mt-1 input-field ${errors.address ? 'border-red-500' : ''}`} 
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 space-x-3">
            <Link to="/manager/customers" className="btn-outline">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary min-w-[120px]">
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
