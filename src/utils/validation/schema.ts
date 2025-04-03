import {z} from 'zod'

export const transactionSchema = z.object({
  walletAddress: z.string().min(42).regex(/^0x[a-fA-F0-9]{40}$/)
})