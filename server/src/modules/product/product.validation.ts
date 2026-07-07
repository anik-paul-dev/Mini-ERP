import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
    sku: z.string().min(1, 'SKU is required').max(50),
    category: z.string().min(1, 'Category is required').max(100),
    purchasePrice: z.coerce.number().min(0, 'Purchase price cannot be negative'),
    sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative'),
    stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    sku: z.string().max(50).optional(),
    category: z.string().max(100).optional(),
    purchasePrice: z.coerce.number().min(0).optional(),
    sellingPrice: z.coerce.number().min(0).optional(),
    stockQuantity: z.coerce.number().int().min(0).optional(),
  }),
  params: z.object({
    publicId: z.string().min(1),
  }),
});
