import { z } from 'zod';

export const AuthVerifySchema = z.object({
  walletAddress: z
    .string({ required_error: 'walletAddress is required' })
    .min(1, 'walletAddress cannot be empty')
    .trim(),
  signature: z
    .string({ required_error: 'signature is required' })
    .min(1, 'signature cannot be empty'),
  message: z
    .string({ required_error: 'message is required' })
    .min(1, 'message cannot be empty'),
});

export type AuthVerifyInput = z.infer<typeof AuthVerifySchema>;
