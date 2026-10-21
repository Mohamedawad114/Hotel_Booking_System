import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { updatePasswordSchema } from '../schemas/profileSchemas';
import { updatePassword } from '../api/profileApi';

export function UpdatePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(updatePasswordSchema) });

  const mutation = useMutation({
    mutationFn: (payload) => updatePassword(payload),
    onSuccess: () => {
      toast.success('اتغيّر الباسورد بنجاح');
      reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'الباسورد الحالي غلط');
    },
  });

  return (
    <SectionCard title="تغيير الباسورد">
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
        <Input
          label="الباسورد الحالي"
          id="oldPassword"
          type="password"
          {...register('oldPassword')}
          error={errors.oldPassword?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="الباسورد الجديد"
            id="newPassword"
            type="password"
            {...register('newPassword')}
            error={errors.newPassword?.message}
          />
          <Input
            label="تأكيد الباسورد الجديد"
            id="confirmNewPassword"
            type="password"
            {...register('confirmNewPassword')}
            error={errors.confirmNewPassword?.message}
          />
        </div>
        <Button type="submit" isLoading={mutation.isPending} className="self-start">
          تحديث الباسورد
        </Button>
      </form>
    </SectionCard>
  );
}
