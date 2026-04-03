import { z } from 'zod';
import { wealthTierEnum, painCategoryEnum } from './problem';

export const lifeStageEnum = z.enum([
  'EARLY_CAREER',
  'MID_CAREER',
  'PRE_RETIREMENT',
  'RETIREMENT',
  'LEGACY_PLANNING',
]);

export const buyerProfileSchema = z.object({
  wealth_tier: wealthTierEnum,
  life_stage: lifeStageEnum,
  pain_category: painCategoryEnum,
});

export const guardrailsSchema = z.object({
  offer_data: z.object({}).passthrough().refine(
    (val) => Object.keys(val).length > 0,
    { message: 'Offer data is required' },
  ),
});

export const feasibilitySchema = z.object({
  monthly_price: z.number().positive('Monthly price must be a positive number'),
  costs: z.object({}).passthrough(),
  volume: z
    .number()
    .int('Volume must be a whole number')
    .positive('Volume must be a positive number'),
});

export type BuyerProfileInput = z.infer<typeof buyerProfileSchema>;
export type GuardrailsInput = z.infer<typeof guardrailsSchema>;
export type FeasibilityInput = z.infer<typeof feasibilitySchema>;
