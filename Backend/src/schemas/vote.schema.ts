import { z } from 'zod';

export const VoteSchema = z.object({
  proposalId: z
    .string({ required_error: 'proposalId is required' })
    .min(1, 'proposalId cannot be empty'),
  choice: z.enum(['yes', 'no', 'abstain'], {
    required_error: 'choice is required',
    invalid_type_error: 'choice must be one of: yes, no, abstain',
  }),
});

export type VoteInput = z.infer<typeof VoteSchema>;
