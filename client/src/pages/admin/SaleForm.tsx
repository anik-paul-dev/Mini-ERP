import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../../hooks/useApi';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Customer, Product, PaginatedResponse } from '../../types';
import toast from 'react-hot-toast';

const saleSchema = z.object({
  customerPublicId: z.string().min(1, 'Please select a customer'),
  items: z.array(z.object({
    productPublicId: z.string().min(1, 'Please select a product'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'Add at least one item'),
});

type SaleFormValues = z.infer<typeof saleSchema>;

const SaleForm = () => {
  const navigate = useNavigate();
  const { get, post, loading } = useApi();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      items: [{ productPublicId: '', quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, productsData] = await Promise.all([
          get<PaginatedResponse<Customer>>('/customers?limit=100'),
          get<PaginatedResponse<Product>>('/products?limit=100')
        ]);
        
        if (customersData) setCustomers(customersData.data);
        if (productsData) setProducts(productsData.data.filter(p => p.stockQuantity > 0)); // Only items in stock
      } catch (error) {
        toast.error('Failed to load customers or products');
      }
    };
    fetchData();
  }, [get]);

  // Calculate grand total dynamically
  const grandTotal = watchItems.reduce((total, item) => {
    if (item.productPublicId) {
      const product = products.find(p => p.publicId === item.productPublicId);
      if (product) {
        return total + (product.sellingPrice * (item.quantity || 0));
      }
    }
    return total;
  }, 0);

  const onSubmit = async (data: SaleFormValues) => {
    try {
      await post('/sales', data, { showSuccessToast: true, successMessage: 'Sale completed successfully' });
      navigate('/admin/sales');
    } catch (error) {
      // Error handled by useApi
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center space-x-4">
        <Link to="/admin/sales" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Sale</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Customer Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Customer Details</h3>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700">Select Customer *</label>
              <select {...register('customerPublicId')} className={`mt-1 input-field ${errors.customerPublicId ? 'border-red-500' : ''}`}>
                <option value="">-- Select a Customer --</option>
                {customers.map(c => (
                  <option key={c.publicId} value={c.publicId}>{c.name} ({c.email || c.phone})</option>
                ))}
              </select>
              {errors.customerPublicId && <p className="mt-1 text-sm text-red-600">{errors.customerPublicId.message}</p>}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              <button 
                type="button" 
                onClick={() => append({ productPublicId: '', quantity: 1 })}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const selectedProductPublicId = watchItems[index]?.productPublicId;
                const selectedProduct = products.find(p => p.publicId === selectedProductPublicId);

                return (
                  <div key={field.id} className="flex items-end gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Product</label>
                      <select 
                        {...register(`items.${index}.productPublicId`)} 
                        className={`mt-1 input-field ${errors.items?.[index]?.productPublicId ? 'border-red-500' : ''}`}
                      >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p.publicId} value={p.publicId}>
                            {p.name} - ${p.sellingPrice} ({p.stockQuantity} in stock)
                          </option>
                        ))}
                      </select>
                      {errors.items?.[index]?.productPublicId && (
                        <p className="mt-1 text-sm text-red-600">{errors.items[index]?.productPublicId?.message}</p>
                      )}
                    </div>
                    
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input 
                        type="number" 
                        min="1"
                        max={selectedProduct?.stockQuantity || 1}
                        {...register(`items.${index}.quantity`)} 
                        className={`mt-1 input-field ${errors.items?.[index]?.quantity ? 'border-red-500' : ''}`} 
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>

                    <div className="w-32 pb-2 text-right">
                      <span className="block text-sm text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-900">
                        ${selectedProduct ? ((selectedProduct.sellingPrice * (watchItems[index]?.quantity || 0)).toFixed(2)) : '0.00'}
                      </span>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:text-red-700 mb-1"
                      disabled={fields.length === 1}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
            {errors.items?.root && <p className="mt-2 text-sm text-red-600">{errors.items.root.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              <p className="text-lg font-medium text-gray-900">Grand Total</p>
              <p className="text-3xl font-bold text-brand-600">${grandTotal.toFixed(2)}</p>
            </div>
            
            <div className="flex space-x-3">
              <Link to="/admin/sales" className="btn-outline">Cancel</Link>
              <button type="submit" disabled={loading} className="btn-primary min-w-[150px]">
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;
