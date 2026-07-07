import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Role name must be at least 2 characters').max(50),
    permissions: z.array(z.string()).min(1, 'At least one permission is required'),
    description: z.string().optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    permissions: z.array(z.string()).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    publicId: z.string().min(1),
  }),
});
