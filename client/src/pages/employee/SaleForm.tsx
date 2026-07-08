import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Customer, Product, PaginatedResponse, Sale } from '../../types';

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
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { get, post, put, loading } = useApi();
  const { hasPermission } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchingSale, setFetchingSale] = useState(isEditMode);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
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
        const customersPromise = hasPermission('customers:read')
          ? get<PaginatedResponse<Customer>>('/customers?limit=100')
          : Promise.resolve(null);

        const productsPromise = hasPermission('products:read')
          ? get<PaginatedResponse<Product>>('/products?limit=100')
          : Promise.resolve(null);

        const salePromise = isEditMode && id
          ? get<Sale>(`/sales/${id}`)
          : Promise.resolve(null);

        const [customersData, productsData, saleData] = await Promise.all([customersPromise, productsPromise, salePromise]);

        if (customersData) setCustomers(customersData.data);
        if (productsData) setProducts(isEditMode ? productsData.data : productsData.data.filter(p => p.stockQuantity > 0));
        if (saleData) {
          reset({
            customerPublicId: saleData.customerPublicId,
            items: saleData.items.map(item => ({
              productPublicId: item.productPublicId,
              quantity: item.quantity,
            })),
          });
        }
      } catch (error) {
        navigate('/employee/sales');
      } finally {
        setFetchingSale(false);
      }
    };
    fetchData();
  }, [get, hasPermission, id, isEditMode, navigate, reset]);

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
      if (isEditMode) {
        await put(`/sales/${id}`, data, { showSuccessToast: true, successMessage: 'Sale updated successfully' });
      } else {
        await post('/sales', data, { showSuccessToast: true, successMessage: 'Sale completed successfully' });
      }
      navigate('/employee/sales');
    } catch (error) {
      // Error handled by useApi
    }
  };

  if (fetchingSale) {
    return <div className="p-8 text-center text-slate-300">Loading sale details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center space-x-4">
        <Link to="/employee/sales" className="text-surface-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">{isEditMode ? 'Edit Sale' : 'Create New Sale'}</h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-slate-100 border-b border-surface-700/50 pb-2 mb-4">Customer Details</h3>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-300">Select Customer *</label>
              <select {...register('customerPublicId')} className={`mt-1 input-field ${errors.customerPublicId ? 'border-rose-500' : ''}`}>
                <option value="">-- Select a Customer --</option>
                {customers.map(c => (
                  <option key={c.publicId} value={c.publicId}>{c.name} ({c.email || c.phone})</option>
                ))}
              </select>
              {errors.customerPublicId && <p className="mt-1 text-sm text-rose-400">{errors.customerPublicId.message}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-surface-700/50 pb-2 mb-4">
              <h3 className="text-lg font-medium text-slate-100">Order Items</h3>
              <button
                type="button"
                onClick={() => append({ productPublicId: '', quantity: 1 })}
                className="text-sm font-medium text-brand-400 hover:text-brand-300 flex items-center transition-colors"
              >
                <Plus size={16} className="mr-1" /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const selectedProductPublicId = watchItems[index]?.productPublicId;
                const selectedProduct = products.find(p => p.publicId === selectedProductPublicId);

                return (
                  <div key={field.id} className="flex flex-col sm:flex-row items-end gap-4 bg-surface-800/50 border border-surface-700/50 p-4 rounded-lg">
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-sm font-medium text-slate-300">Product</label>
                      <select
                        {...register(`items.${index}.productPublicId`)}
                        className={`mt-1 input-field ${errors.items?.[index]?.productPublicId ? 'border-rose-500' : ''}`}
                      >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p.publicId} value={p.publicId}>
                            {p.name} - ${p.sellingPrice} ({p.stockQuantity} in stock)
                          </option>
                        ))}
                      </select>
                      {errors.items?.[index]?.productPublicId && (
                        <p className="mt-1 text-sm text-rose-400">{errors.items[index]?.productPublicId?.message}</p>
                      )}
                    </div>

                    <div className="w-full sm:w-32">
                      <label className="block text-sm font-medium text-slate-300">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct?.stockQuantity || undefined}
                        {...register(`items.${index}.quantity`)}
                        className={`mt-1 input-field ${errors.items?.[index]?.quantity ? 'border-rose-500' : ''}`}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="mt-1 text-sm text-rose-400">{errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>

                    <div className="w-full sm:w-32 sm:pb-2 sm:text-right flex sm:block justify-between items-center">
                      <span className="block text-sm text-surface-400">Subtotal</span>
                      <span className="font-medium text-slate-100">
                        ${selectedProduct ? ((selectedProduct.sellingPrice * (watchItems[index]?.quantity || 0)).toFixed(2)) : '0.00'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-rose-400 hover:text-rose-300 mb-1 transition-colors self-end"
                      disabled={fields.length === 1}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
            {errors.items?.root && <p className="mt-2 text-sm text-rose-400">{errors.items.root.message}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-surface-700/50 gap-4">
            <div>
              <p className="text-lg font-medium text-slate-100">Grand Total</p>
              <p className="text-3xl font-bold text-brand-400">${grandTotal.toFixed(2)}</p>
            </div>

            <div className="flex space-x-3 w-full sm:w-auto">
              <Link to="/employee/sales" className="btn-outline flex-1 sm:flex-none text-center">Cancel</Link>
              <button type="submit" disabled={loading} className="btn-primary flex-1 sm:flex-none min-w-[150px]">
                {loading ? 'Processing...' : isEditMode ? 'Update Sale' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;
