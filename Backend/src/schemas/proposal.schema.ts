import { z } from 'zod';

export const CreateProposalSchema = z.object({
  title: z
    .string({ required_error: 'title is required' })
    .min(1, 'title cannot be empty')
    .max(200, 'title cannot exceed 200 characters')
    .trim(),
  summary: z
    .string({ required_error: 'summary is required' })
    .min(1, 'summary cannot be empty')
    .max(5000, 'summary cannot exceed 5000 characters'),
  budget: z
    .number({ required_error: 'budget is required' })
    .min(0, 'budget cannot be negative'),
  currency: z
    .string()
    .trim()
    .default('GHS'),
  actionItems: z
    .array(z.string().min(1, 'action item cannot be empty'))
    .default([]),
  rationale: z
    .string()
    .default(''),
  dissent: z
    .string()
    .default(''),
  recipient: z
    .string()
    .trim()
    .default(''),
  deadline: z
    .string()
    .datetime({ message: 'deadline must be a valid ISO 8601 datetime' })
    .optional(),
  communityId: z
    .string({ required_error: 'communityId is required' })
    .min(1, 'communityId cannot be empty'),
});

export type CreateProposalInput = z.infer<typeof CreateProposalSchema>;

export const UpdateProposalSchema = CreateProposalSchema.partial();

export type UpdateProposalInput = z.infer<typeof UpdateProposalSchema>;

export const PublishProposalSchema = z.object({
  proposalId: z
    .string({ required_error: 'proposalId is required' })
    .min(1, 'proposalId cannot be empty'),
});

export type PublishProposalInput = z.infer<typeof PublishProposalSchema>;
