import { z } from 'zod';

export const deliveryModelEnum = z.enum([
  'DONE_FOR_YOU',
  'DONE_WITH_YOU',
  'SELF_SERVICE',
  'HYBRID',
]);

export const pricingModelSchema = z.object({
  monthly_price: z.number().positive('Monthly price must be a positive number'),
});

export const offerSchema = z.object({
  name: z
    .string()
    .min(3, 'Offer name must be at least 3 characters')
    .max(200, 'Offer name must be at most 200 characters'),
  delivery_model: deliveryModelEnum,
  pricing_model: pricingModelSchema,
});

export const generateOfferSchema = z.object({
  problem_id: z.string().uuid('Please provide a valid problem ID'),
});

export type OfferInput = z.infer<typeof offerSchema>;
export type GenerateOfferInput = z.infer<typeof generateOfferSchema>;
