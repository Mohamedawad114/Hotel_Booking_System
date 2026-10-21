import { z } from 'zod';

const phoneRegex = /^01[0125][0-9]{8}$/;
// نفس سياسة الباسورد المستخدمة في ResetPasswordDto: لازم صغير + كابيتال + رقم + رمز خاص
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/;
const strongPassword = z
  .string()
  .min(8, 'الباسورد لازم 8 حروف على الأقل')
  .regex(passwordRegex, 'لازم يحتوي على حرف صغير، حرف كابيتال، رقم، ورمز خاص (@$!%?.&-)');

// UpdateProfileDto: كل الفيلدات من غير علامة * في الـ swagger، يعني optional (partial update)
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'الاسم قصير أوي').optional(),
  email: z.string().email('صيغة الإيميل مش صحيحة').optional(),
  city: z.string().min(2).optional(),
  street: z.string().min(2).optional(),
  phone: z.string().regex(phoneRegex, 'رقم الموبايل مش صحيح').optional(),
});

// UpdatePasswordDto { oldPassword*, newPassword*, confirmNewPassword* }
export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'الباسورد الحالي مطلوب'),
    newPassword: strongPassword,
    confirmNewPassword: strongPassword,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'الباسورد مش متطابق',
    path: ['confirmNewPassword'],
  });

// ResetPasswordDto { email*, OTP*, newPassword*, confirmPassword* }
// email مضاف عشان الـ flow بقى public (مش محتاج تسجيل دخول)
export const resetPasswordSchema = z
  .object({
    email: z.string().email('صيغة الإيميل مش صحيحة'),
    OTP: z
      .string()
      .length(6, 'الكود لازم يكون 6 خانات')
      .regex(/^[A-Za-z0-9]+$/, 'الكود حروف وأرقام بس'),
    newPassword: strongPassword,
    confirmPassword: strongPassword,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'الباسورد مش متطابق',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('صيغة الإيميل مش صحيحة'),
});

// EnableTwoFADto — Body('code'). المثال في الـ swagger رقمي (25638، 5 خانات)
// مش مؤكد الطول بالظبط، فمخليها مرنة (4-8 أرقام) بدل قفل على 6
export const enableTwoFASchema = z.object({
  code: z.string().regex(/^\d{4,8}$/, 'الكود لازم يكون أرقام بس'),
});
