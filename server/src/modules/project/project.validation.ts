import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(2).max(160),
  assigneeName: z.string().max(120).optional().or(z.literal('')),
  dueDate: z.coerce.date(),
  status: z.enum(['todo', 'in_progress', 'done', 'blocked']).optional(),
});

const bodySchema = z.object({
  name: z.string().min(2).max(180),
  clientName: z.string().max(120).optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['planning', 'active', 'completed', 'on_hold']).optional(),
  startDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  budget: z.coerce.number().min(0).optional(),
  description: z.string().max(700).optional().or(z.literal('')),
  tasks: z.array(taskSchema).optional(),
});

export const createProjectSchema = z.object({ body: bodySchema });
export const updateProjectSchema = z.object({
  body: bodySchema.partial(),
  params: z.object({ publicId: z.string().min(1) }),
});
