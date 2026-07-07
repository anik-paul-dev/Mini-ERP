import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi } from '../../hooks/useApi';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ImageUpload from '../../components/ui/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  purchasePrice: z.coerce.number().min(0, 'Must be positive'),
  sellingPrice: z.coerce.number().min(0, 'Must be positive'),
  stockQuantity: z.coerce.number().int().min(0, 'Must be positive'),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { get, post, put, loading } = useApi();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [fetchingProduct, setFetchingProduct] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const product = await get<Product>(`/products/${id}`);
          if (product) {
            setValue('name', product.name);
            setValue('sku', product.sku);
            setValue('category', product.category);
            setValue('purchasePrice', product.purchasePrice);
            setValue('sellingPrice', product.sellingPrice);
            setValue('stockQuantity', product.stockQuantity);
            setCurrentImage(product.image);
          }
        } catch (error) {
          toast.error('Failed to fetch product details');
          navigate('/admin/products');
        } finally {
          setFetchingProduct(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, get, setValue, navigate]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!isEditMode && !imageFile) {
      toast.error('Product image is required');
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (isEditMode) {
        await put(`/products/${id}`, formData, { 
          showSuccessToast: true, 
          successMessage: 'Product updated',
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await post('/products', formData, { 
          showSuccessToast: true, 
          successMessage: 'Product created',
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/admin/products');
    } catch (error) {
      // Error handled by useApi
    }
  };

  if (fetchingProduct) {
    return <div className="p-8 text-center">Loading product details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center space-x-4">
        <Link to="/admin/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image {isEditMode ? '' : '*'}</label>
              <ImageUpload 
                onImageSelected={setImageFile} 
                currentImageUrl={currentImage} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input type="text" {...register('name')} className={`mt-1 input-field ${errors.name ? 'border-red-500' : ''}`} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SKU *</label>
              <input type="text" {...register('sku')} className={`mt-1 input-field ${errors.sku ? 'border-red-500' : ''}`} />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <input type="text" {...register('category')} className={`mt-1 input-field ${errors.category ? 'border-red-500' : ''}`} />
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Quantity *</label>
              <input type="number" {...register('stockQuantity')} className={`mt-1 input-field ${errors.stockQuantity ? 'border-red-500' : ''}`} />
              {errors.stockQuantity && <p className="mt-1 text-sm text-red-600">{errors.stockQuantity.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Price ($) *</label>
              <input type="number" step="0.01" {...register('purchasePrice')} className={`mt-1 input-field ${errors.purchasePrice ? 'border-red-500' : ''}`} />
              {errors.purchasePrice && <p className="mt-1 text-sm text-red-600">{errors.purchasePrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Selling Price ($) *</label>
              <input type="number" step="0.01" {...register('sellingPrice')} className={`mt-1 input-field ${errors.sellingPrice ? 'border-red-500' : ''}`} />
              {errors.sellingPrice && <p className="mt-1 text-sm text-red-600">{errors.sellingPrice.message}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 space-x-3">
            <Link to="/admin/products" className="btn-outline">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary min-w-[120px]">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
