import { z } from 'zod';

export const addReviewSchema = z.object({
  rating: z.number().min(1, 'اختار تقييم').max(5),
  // comment optional في الـ DTO (IsOptional) بس لو اتبعت لازم يكون 4-100 حرف
  comment: z
    .string()
    .trim()
    .refine((val) => val.length === 0 || (val.length >= 4 && val.length <= 100), {
      message: 'التعليق لازم يكون بين 4 و100 حرف',
    })
    .optional(),
});
