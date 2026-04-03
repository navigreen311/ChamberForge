import { z } from 'zod';

export const riskLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  relationship: z.string(),
});

export const propertySchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters'),
  type: z.string(),
  risk_level: riskLevelEnum,
});

export type MemberInput = z.infer<typeof memberSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
