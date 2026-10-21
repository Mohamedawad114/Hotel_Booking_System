import { z } from 'zod';

export const guestSchema = z.object({
  firstName: z.string().min(1, 'مطلوب'),
  lastName: z.string().min(1, 'مطلوب'),
  age: z.coerce.number().int().min(0).max(120).optional(),
});

export const holderSchema = z.object({
  firstName: z.string().min(1, 'مطلوب'),
  lastName: z.string().min(1, 'مطلوب'),
  email: z.string().email('صيغة الإيميل مش صحيحة'),
  phone: z.string().min(10, 'رقم قصير أوي').max(15),
});

// TODO: قيم PaymentType مؤكدة (AT_WEB, AT_HOTEL) من الـ cancel handler
export const paymentTypeOptions = [
  { value: 'AT_WEB', label: 'ادفع أونلاين دلوقتي' },
  { value: 'AT_HOTEL', label: 'ادفع في الفندق' },
];
