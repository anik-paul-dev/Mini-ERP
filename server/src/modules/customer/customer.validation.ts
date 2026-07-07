import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().max(20).optional().or(z.literal('')),
    address: z.string().max(300).optional().or(z.literal('')),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().max(20).optional().or(z.literal('')),
    address: z.string().max(300).optional().or(z.literal('')),
  }),
  params: z.object({
    publicId: z.string().min(1),
  }),
});
