import { z } from 'zod';

const bodySchema = z.object({
  ticketNumber: z.string().min(2).max(60),
  subject: z.string().min(2).max(180),
  requesterName: z.string().min(2).max(120),
  requesterEmail: z.string().email().optional().or(z.literal('')),
  department: z.string().max(120).optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  source: z.enum(['customer', 'internal', 'supplier']).optional(),
  description: z.string().min(10).max(1200),
  resolution: z.string().max(1000).optional().or(z.literal('')),
});

export const createTicketSchema = z.object({ body: bodySchema });
export const updateTicketSchema = z.object({
  body: bodySchema.partial(),
  params: z.object({ publicId: z.string().min(1) }),
});
