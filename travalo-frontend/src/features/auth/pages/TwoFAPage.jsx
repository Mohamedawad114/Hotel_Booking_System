import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthLayout } from '../components/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { twoFASchema } from '../schemas/authSchemas';
import { verifyTwoFA } from '../api/authApi';
import { useAuthStore } from '@/store/authStore';

export default function TwoFAPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const id = location.state?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(twoFASchema),
    defaultValues: { id: id || '' },
  });

  const mutation = useMutation({
    mutationFn: (payload) => verifyTwoFA(payload),
    onSuccess: ({ data }) => {
      // مفترض نفس شكل login: { message, data: { accessToken } }
      setSession({ accessToken: data.data.accessToken });
      toast.success('تم التحقق بنجاح');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'الكود غلط أو منتهي');
    },
  });

  // لو المستخدم دخل الصفحة دي مباشرة من غير ما يعدي بـ login الأول
  if (!id) return <Navigate to="/login" replace />;

  return (
    <AuthLayout
      eyebrow="خطوة إضافية للأمان"
      title="أدخل كود التحقق"
      subtitle="ابعتنالك كود من تطبيق المصادقة بتاعك"
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
        <input type="hidden" {...register('id')} />
        <Input
          label="الكود"
          id="code"
          inputMode="numeric"
          maxLength={6}
          placeholder="------"
          {...register('code')}
          error={errors.code?.message}
        />
        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          تأكيد
        </Button>
      </form>
    </AuthLayout>
  );
}
