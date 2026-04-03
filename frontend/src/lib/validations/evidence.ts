import { z } from 'zod';

export const sourceTypeEnum = z.enum([
  'ACADEMIC',
  'INDUSTRY_REPORT',
  'NEWS',
  'INTERVIEW',
  'SURVEY',
  'INTERNAL',
]);

export const evidenceSchema = z.object({
  source_url: z.string().url('Please enter a valid URL'),
  source_type: sourceTypeEnum,
  publication_date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Please enter a valid date' },
  ),
});

export const ingestSchema = z.object({
  text: z.string().min(50, 'Text must be at least 50 characters'),
  source_type: sourceTypeEnum,
});

export type EvidenceInput = z.infer<typeof evidenceSchema>;
export type IngestInput = z.infer<typeof ingestSchema>;
