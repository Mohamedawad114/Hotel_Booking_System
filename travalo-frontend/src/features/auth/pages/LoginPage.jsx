import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AuthLayout } from '../components/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema } from '../schemas/authSchemas';
import { login } from '../api/authApi';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: (payload) => login(payload),
    onSuccess: ({ data }) => {
      // الـ backend بيرجع { message, data: { accessToken } } لو الدخول تم على طول
      // أو { message, data: { id } } لو الحساب عليه 2FA (مفيش flag صريح، بنفرّق بوجود accessToken)
      const { accessToken, id } = data.data;

      if (!accessToken && id) {
        navigate('/login/2fa', { state: { id } });
        return;
      }

      setSession({ accessToken });
      toast.success('أهلاً بيك تاني');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'الإيميل أو الباسورد غلط');
    },
  });

  return (
    <AuthLayout eyebrow="أهلاً بيك تاني" title="تسجيل الدخول">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
        <Input label="الإيميل" id="email" type="email" {...register('email')} error={errors.email?.message} />
        <Input
          label="الباسورد"
          id="password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-ink-400 hover:text-ink-900">
            نسيت الباسورد؟
          </Link>
        </div>

        <Button type="submit" isLoading={mutation.isPending} className="mt-2 w-full">
          تسجيل الدخول
        </Button>

        <p className="text-center text-sm text-ink-400">
          لسه معملتش حساب؟{' '}
          <Link to="/signup" className="font-medium text-ink-900 underline underline-offset-4">
            اعمل حساب
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
