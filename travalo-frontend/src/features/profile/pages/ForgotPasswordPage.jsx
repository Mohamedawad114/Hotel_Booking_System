import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { forgotPasswordSchema } from '../schemas/profileSchemas';
import { requestPasswordReset } from '../api/profileApi';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: ({ email }) => requestPasswordReset(email),
    onSuccess: (_, variables) => {
      toast.success('اتبعتلك كود على الإيميل');
      navigate('/reset-password', { state: { email: variables.email } });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'حصل خطأ، حاول تاني');
    },
  });

  return (
    <AuthLayout
      eyebrow="استعادة الحساب"
      title="نسيت الباسورد؟"
      subtitle="اكتب إيميلك وهنبعتلك كود لاستعادة الباسورد"
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
        <Input label="الإيميل" id="email" type="email" {...register('email')} error={errors.email?.message} />
        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          ابعتلي الكود
        </Button>
        <p className="text-center text-sm text-ink-400">
          فاكر باسوردك؟{' '}
          <Link to="/login" className="font-medium text-ink-900 underline underline-offset-4">
            سجّل دخول
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
