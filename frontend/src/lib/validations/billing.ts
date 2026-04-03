import { z } from 'zod';

export const subscriptionSchema = z.object({
  client_id: z.string().uuid('Please provide a valid client ID'),
  amount: z.number().positive('Amount must be a positive number'),
  plan_name: z.string().min(2, 'Plan name must be at least 2 characters'),
});

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number(),
  quantity: z.number().int().positive(),
});

export const invoiceSchema = z.object({
  client_id: z.string().uuid('Please provide a valid client ID'),
  line_items: z
    .array(lineItemSchema)
    .min(1, 'At least one line item is required'),
  due_date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Please enter a valid date' },
  ),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
