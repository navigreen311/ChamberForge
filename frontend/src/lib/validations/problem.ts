import { z } from 'zod';

export const wealthTierEnum = z.enum([
  'MASS_AFFLUENT',
  'HNW',
  'VHNW',
  'UHNW',
]);

export const buyerTypeEnum = z.enum([
  'INDIVIDUAL',
  'FAMILY_OFFICE',
  'INSTITUTION',
  'TRUST',
]);

export const painCategoryEnum = z.enum([
  'SERVICE_GAP',
  'COST_INEFFICIENCY',
  'TRUST_DEFICIT',
  'ACCESS_LIMITATION',
  'COMPLIANCE_BURDEN',
]);

export const lifecycleStageEnum = z.enum([
  'DISCOVERY',
  'VALIDATION',
  'BUILD',
  'LAUNCH',
  'SCALE',
]);

export const problemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  wealth_tier: wealthTierEnum,
  buyer_type: buyerTypeEnum,
  pain_category: painCategoryEnum,
  urgency_score: z
    .number()
    .int('Urgency score must be a whole number')
    .min(1, 'Urgency score must be at least 1')
    .max(10, 'Urgency score must be at most 10'),
  lifecycle_stage: lifecycleStageEnum,
  trigger_event: z.string().optional(),
  wtp_profile: z.string().optional(),
  trust_channel: z.string().optional(),
});

export type ProblemInput = z.infer<typeof problemSchema>;
