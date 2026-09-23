import { z } from 'zod';

const supplierBody = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  category: z.string().min(2).max(100),
  rating: z.coerce.number().min(1).max(5).optional(),
  status: z.enum(['active', 'on_hold', 'inactive']).optional(),
});

export const createSupplierSchema = z.object({ body: supplierBody });
export const updateSupplierSchema = z.object({
  body: supplierBody.partial(),
  params: z.object({ publicId: z.string().min(1) }),
});
