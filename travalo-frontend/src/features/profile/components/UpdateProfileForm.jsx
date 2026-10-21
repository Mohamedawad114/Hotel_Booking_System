import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { updateProfileSchema } from '../schemas/profileSchemas';
import { updateProfile } from '../api/profileApi';

export function UpdateProfileForm({ user }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(updateProfileSchema) });

  // تعبئة الفورم لما بيانات اليوزر توصل من /profile
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        city: user.city || '',
        street: user.street || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (payload) => updateProfile(payload),
    onSuccess: () => {
      toast.success('اتحدّثت بياناتك');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'حصل خطأ، حاول تاني');
    },
  });

  return (
    <SectionCard title="بياناتك الشخصية" description="عدّل بياناتك وهتتحفظ فورًا">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
        <Input label="الاسم" id="name" {...register('name')} error={errors.name?.message} />
        <Input label="الإيميل" id="email" type="email" {...register('email')} error={errors.email?.message} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="المدينة" id="city" {...register('city')} error={errors.city?.message} />
          <Input label="الشارع" id="street" {...register('street')} error={errors.street?.message} />
        </div>
        <Input label="رقم الموبايل" id="phone" {...register('phone')} error={errors.phone?.message} />
        <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty} className="self-start">
          حفظ التعديلات
        </Button>
      </form>
    </SectionCard>
  );
}
