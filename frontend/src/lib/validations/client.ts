import { z } from 'zod';
import { wealthTierEnum, buyerTypeEnum } from './problem';

export const clientStatusEnum = z.enum([
  'PROSPECT',
  'ACTIVE',
  'PAUSED',
  'CHURNED',
]);

export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Company must be at least 2 characters'),
  wealth_tier: wealthTierEnum,
  buyer_type: buyerTypeEnum,
  status: clientStatusEnum,
});

export type ClientInput = z.infer<typeof clientSchema>;
