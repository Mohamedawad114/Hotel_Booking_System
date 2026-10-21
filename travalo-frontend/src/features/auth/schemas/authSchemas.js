import { z } from 'zod';

const phoneRegex = /^01[0125][0-9]{8}$/; // رقم مصري - عدّل الـ regex لو الباك اند بيقبل صيغة تانية

export const signupSchema = z
  .object({
    name: z.string().min(2, 'الاسم قصير أوي').max(60, 'الاسم طويل أوي'),
    email: z.string().email('صيغة الإيميل مش صحيحة'),
    password: z
      .string()
      .min(8, 'الباسورد لازم 8 حروف على الأقل')
      .regex(/[A-Z]/, 'لازم حرف كابيتال واحد على الأقل')
      .regex(/[0-9]/, 'لازم رقم واحد على الأقل'),
    confirmPassword: z.string(),
    city: z.string().min(2, 'المدينة مطلوبة'),
    street: z.string().min(2, 'الشارع مطلوب'),
    phone: z.string().regex(phoneRegex, 'رقم الموبايل مش صحيح'),
    date_birth: z
      .string()
      .refine((val) => !Number.isNaN(Date.parse(val)), 'تاريخ الميلاد مش صحيح'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'الباسورد مش متطابق',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('صيغة الإيميل مش صحيحة'),
  password: z.string().min(1, 'الباسورد مطلوب'),
});

export const twoFASchema = z.object({
  code: z.string().length(6, 'الكود لازم يكون 6 أرقام'),
  id: z.string().min(1),
});

export const confirmEmailSchema = z.object({
  OTP: z.string().length(6, 'الكود لازم يكون 6 أرقام'),
  email: z.string().email(),
});
