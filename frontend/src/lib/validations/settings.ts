import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(100, 'Workspace name must be at most 100 characters'),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase alphanumeric characters and hyphens',
    ),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
