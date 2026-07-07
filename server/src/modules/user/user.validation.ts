import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
    rolePublicId: z.string().min(1, 'Role is required'),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    rolePublicId: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    publicId: z.string().min(1),
  }),
});
