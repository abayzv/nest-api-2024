import { z, ZodType } from 'zod';

export class UserValidation {
    static readonly REGISTER: ZodType = z.object({
        username: z.string().min(3).max(100),
        email: z.string().email(),
        password: z.string().min(8),
        firstName: z.string().min(1),
        lastName: z.string().optional(),
    });

    static readonly LOGIN: ZodType = z.object({
        username: z.string().min(3).max(100),
        password: z.string().min(8),
    })
}