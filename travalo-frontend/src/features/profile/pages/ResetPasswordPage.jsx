import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { resetPasswordSchema } from '../schemas/profileSchemas';
import { resetPassword, resendPasswordResetOtp } from '../api/profileApi';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: email || '' },
  });

  const resetMutation = useMutation({
    mutationFn: ({ email, OTP, newPassword, confirmPassword }) =>
      resetPassword({ email, OTP, newPassword, confirmPassword }),
    onSuccess: () => {
      toast.success('اتغيّر الباسورد، سجّل دخول بالباسورد الجديد');
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'الكود غلط أو منتهي');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendPasswordResetOtp(email),
    onSuccess: () => {
      toast.success('اتبعت كود جديد على إيميلك');
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    },
    onError: () => toast.error('معرفناش نبعت الكود، حاول تاني'),
  });

  if (!email) return <Navigate to="/forgot-password" replace />;

  return (
    <AuthLayout
      eyebrow="خطوة أخيرة"
      title="اختار باسورد جديد"
      subtitle={`ادخل الكود اللي وصلك على ${email}`}
    >
      <form onSubmit={handleSubmit((data) => resetMutation.mutate(data))} className="flex flex-col gap-4">
        <input type="hidden" {...register('email')} />
        <Input
          label="الكود"
          id="OTP"
          maxLength={6}
          placeholder="------"
          {...register('OTP')}
          error={errors.OTP?.message}
        />
        <Input
          label="الباسورد الجديد"
          id="newPassword"
          type="password"
          {...register('newPassword')}
          error={errors.newPassword?.message}
        />
        <Input
          label="تأكيد الباسورد الجديد"
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" isLoading={resetMutation.isPending} className="w-full">
          تغيير الباسورد
        </Button>
        <button
          type="button"
          onClick={() => resendMutation.mutate()}
          disabled={resendCooldown > 0 || resendMutation.isPending}
          className="text-center text-sm text-ink-400 hover:text-ink-900 disabled:opacity-50"
        >
          {resendCooldown > 0 ? `تقدر تطلب كود جديد بعد ${resendCooldown} ثانية` : 'ابعتلي الكود تاني'}
        </button>
      </form>
    </AuthLayout>
  );
}
