import { z } from 'zod';

const bodySchema = z.object({
  title: z.string().min(2).max(160),
  category: z.string().min(2).max(100),
  amount: z.coerce.number().min(0),
  expenseDate: z.coerce.date(),
  paymentMethod: z.enum(['cash', 'bank', 'card', 'mobile']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']).optional(),
  vendor: z.string().max(120).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const createExpenseSchema = z.object({ body: bodySchema });
export const updateExpenseSchema = z.object({
  body: bodySchema.partial(),
  params: z.object({ publicId: z.string().min(1) }),
});
