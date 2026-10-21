import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthLayout } from '../components/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { confirmEmailSchema } from '../schemas/authSchemas';
import { confirmEmail, resendOtp } from '../api/authApi';

export default function ConfirmEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: { email: email || '' },
  });

  const confirmMutation = useMutation({
    mutationFn: (payload) => confirmEmail(payload),
    onSuccess: () => {
      toast.success('تم تأكيد الإيميل، سجّل دخول دلوقتي');
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'الكود غلط أو منتهي');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendOtp(email),
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

  if (!email) return <Navigate to="/signup" replace />;

  return (
    <AuthLayout
      eyebrow="خطوة أخيرة"
      title="أكّد إيميلك"
      subtitle={`بعتنا كود تأكيد لـ ${email}`}
    >
      <form onSubmit={handleSubmit((data) => confirmMutation.mutate(data))} className="flex flex-col gap-4">
        <input type="hidden" {...register('email')} />
        <Input
          label="كود التأكيد"
          id="OTP"
          inputMode="numeric"
          maxLength={6}
          placeholder="------"
          {...register('OTP')}
          error={errors.OTP?.message}
        />
        <Button type="submit" isLoading={confirmMutation.isPending} className="w-full">
          تأكيد الإيميل
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
