import { z } from 'zod';

export const createSaleSchema = z.object({
  body: z.object({
    customerPublicId: z.string().min(1, 'Customer is required'),
    items: z
      .array(
        z.object({
          productPublicId: z.string().min(1, 'Product is required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .min(1, 'At least one item is required'),
  }),
});
