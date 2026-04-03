import { z } from 'zod';

export const scenarioAdjustmentsSchema = z.object({
  margin_change: z.number(),
  staffing_change: z.number(),
  scale_factor: z.number().positive('Scale factor must be a positive number'),
});

export const scenarioSchema = z.object({
  base_price: z.number().positive('Base price must be a positive number'),
  base_clients: z
    .number()
    .int('Base clients must be a whole number')
    .positive('Base clients must be a positive number'),
  adjustments: scenarioAdjustmentsSchema,
});

export type ScenarioInput = z.infer<typeof scenarioSchema>;
