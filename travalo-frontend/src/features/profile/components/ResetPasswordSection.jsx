import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { resetPasswordSchema } from '../schemas/profileSchemas';
import { requestPasswordReset, resendPasswordResetOtp, resetPassword } from '../api/profileApi';

// بديل لتغيير الباسورد من غير ما تكتب الباسورد الحالي: بتطلب OTP على إيميلك
// وبعدين تأكده. الاتنين محتاجين تكون داخل حسابك بالفعل (JWT).
export function ResetPasswordSection({ userEmail }) {
  const [otpRequested, setOtpRequested] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const requestMutation = useMutation({
    mutationFn: () => requestPasswordReset(),
    onSuccess: () => {
      toast.success(`اتبعت كود على ${userEmail || 'إيميلك'}`);
      setOtpRequested(true);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'حصل خطأ، حاول تاني');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendPasswordResetOtp(),
    onSuccess: () => {
      toast.success('اتبعت كود جديد');
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
    onError: () => toast.error('معرفناش نبعت الكود'),
  });

  const confirmMutation = useMutation({
    mutationFn: (payload) => resetPassword(payload),
    onSuccess: () => {
      toast.success('اتغيّر الباسورد. اتسجّل خروجك من باقي الأجهزة تلقائيًا.');
      reset();
      setOtpRequested(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'الكود غلط أو منتهي');
    },
  });

  return (
    <SectionCard
      title="تغيير الباسورد بكود بدل الباسورد الحالي"
      description="لو مش فاكر باسوردك الحالي، تقدر تأكد بكود بيتبعت على إيميلك"
    >
      {!otpRequested ? (
        <Button variant="outline" isLoading={requestMutation.isPending} onClick={() => requestMutation.mutate()}>
          ابعتلي كود
        </Button>
      ) : (
        <form onSubmit={handleSubmit((data) => confirmMutation.mutate(data))} className="flex flex-col gap-4">
          <Input
            label="الكود"
            id="reset-OTP"
            maxLength={6}
            placeholder="------"
            {...register('OTP')}
            error={errors.OTP?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="الباسورد الجديد"
              id="reset-newPassword"
              type="password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
            />
            <Input
              label="تأكيد الباسورد"
              id="reset-confirmPassword"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={confirmMutation.isPending}>
              تأكيد التغيير
            </Button>
            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={resendCooldown > 0 || resendMutation.isPending}
              className="text-sm text-ink-400 hover:text-ink-900 disabled:opacity-50"
            >
              {resendCooldown > 0 ? `كود جديد بعد ${resendCooldown}s` : 'ابعتلي الكود تاني'}
            </button>
          </div>
        </form>
      )}
    </SectionCard>
  );
}
