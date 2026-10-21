import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthLayout } from '../components/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signupSchema } from '../schemas/authSchemas';
import { signup } from '../api/authApi';

export default function SignupPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const mutation = useMutation({
    mutationFn: (payload) => signup(payload),
    onSuccess: (_, variables) => {
      toast.success('اتبعتلك كود تأكيد على الإيميل');
      navigate('/confirm-email', { state: { email: variables.email } });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'حصل خطأ، حاول تاني');
    },
  });

  const onSubmit = (data) => {
    // confirmPassword مش جزء من الـ DTO، بتتشال قبل الإرسال
    const { confirmPassword, ...payload } = data;
    mutation.mutate(payload);
  };

  return (
    <AuthLayout
      eyebrow="ابدأ رحلتك"
      title="اعمل حساب جديد"
      subtitle="هتحتاج تأكد إيميلك بكود بيتبعت بعد التسجيل"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="الاسم بالكامل" id="name" {...register('name')} error={errors.name?.message} />
        <Input label="الإيميل" id="email" type="email" {...register('email')} error={errors.email?.message} />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="الباسورد"
            id="password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Input
            label="تأكيد الباسورد"
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="المدينة" id="city" {...register('city')} error={errors.city?.message} />
          <Input label="الشارع" id="street" {...register('street')} error={errors.street?.message} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="رقم الموبايل" id="phone" {...register('phone')} error={errors.phone?.message} />
          <Input
            label="تاريخ الميلاد"
            id="date_birth"
            type="date"
            {...register('date_birth')}
            error={errors.date_birth?.message}
          />
        </div>

        <Button type="submit" isLoading={mutation.isPending} className="mt-2 w-full">
          إنشاء الحساب
        </Button>

        <p className="text-center text-sm text-ink-400">
          عندك حساب بالفعل؟{' '}
          <Link to="/login" className="font-medium text-ink-900 underline underline-offset-4">
            سجّل دخول
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
