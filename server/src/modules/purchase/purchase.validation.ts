import { z } from 'zod';

const itemSchema = z.object({
  itemName: z.string().min(2).max(160),
  quantity: z.coerce.number().int().min(1),
  unitCost: z.coerce.number().min(0),
});

const bodySchema = z.object({
  orderNumber: z.string().min(2).max(40),
  supplierPublicId: z.string().min(1),
  expectedDate: z.coerce.date(),
  status: z.enum(['draft', 'ordered', 'received', 'cancelled']).optional(),
  items: z.array(itemSchema).min(1),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const createPurchaseSchema = z.object({ body: bodySchema });
export const updatePurchaseSchema = z.object({
  body: bodySchema.partial(),
  params: z.object({ publicId: z.string().min(1) }),
});
