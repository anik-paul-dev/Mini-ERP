import { z } from 'zod';

const bodySchema = z.object({
  assetTag: z.string().min(2).max(60),
  name: z.string().min(2).max(160),
  category: z.string().min(2).max(100),
  location: z.string().max(120).optional().or(z.literal('')),
  assignedTo: z.string().max(120).optional().or(z.literal('')),
  purchaseDate: z.coerce.date(),
  value: z.coerce.number().min(0).optional(),
  condition: z.enum(['new', 'good', 'maintenance', 'retired']).optional(),
  status: z.enum(['available', 'assigned', 'repair', 'disposed']).optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const createAssetSchema = z.object({ body: bodySchema });
export const updateAssetSchema = z.object({
  body: bodySchema.partial(),
  params: z.object({ publicId: z.string().min(1) }),
});
