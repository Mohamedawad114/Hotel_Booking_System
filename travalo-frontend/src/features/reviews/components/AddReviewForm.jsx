import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { StarRatingInput } from './StarRatingInput';
import { addReviewSchema } from '../schemas/reviewSchemas';
import { useAddReview } from '../api/useReviews';

export function AddReviewForm({ hotelId }) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addReviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const mutation = useAddReview(hotelId);

  const onSubmit = (data) => {
    mutation.mutate(
      { rating: data.rating, comment: data.comment || undefined },
      {
        onSuccess: () => {
          toast.success('اتضاف تقييمك، شكرًا!');
          reset({ rating: 0, comment: '' });
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'معرفناش نضيف التقييم');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-sand-100 p-5">
      <p className="text-sm font-medium text-ink-600">قيّم إقامتك</p>
      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <StarRatingInput value={field.value} onChange={field.onChange} error={errors.rating?.message} />
        )}
      />
      <textarea
        {...register('comment')}
        rows={3}
        placeholder="احكيلنا عن تجربتك (اختياري)"
        className="w-full rounded-xl border border-ink-100 bg-white px-4 py-2.5 focus:border-amber"
      />
      {errors.comment && <span className="text-sm text-coral">{errors.comment.message}</span>}
      <Button type="submit" isLoading={mutation.isPending} className="self-start">
        نشر التقييم
      </Button>
    </form>
  );
}
