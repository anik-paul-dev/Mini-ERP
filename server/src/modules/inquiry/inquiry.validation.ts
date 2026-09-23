import { z } from 'zod';

export const createInquirySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    company: z.string().max(120).optional().or(z.literal('')),
    phone: z.string().max(30).optional().or(z.literal('')),
    interest: z.string().max(120).optional().or(z.literal('')),
    message: z.string().min(10).max(1200),
  }),
});

export const updateInquirySchema = z.object({
  body: z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'closed']),
  }),
  params: z.object({ publicId: z.string().min(1) }),
});
