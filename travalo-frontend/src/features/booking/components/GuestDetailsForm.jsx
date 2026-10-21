import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { guestSchema, holderSchema, paymentTypeOptions } from '../schemas/bookingSchemas';

// selectedRooms: [{ rateKey, adults, children, roomName }]
export function GuestDetailsForm({ selectedRooms, onSubmit, isLoading }) {
  const schema = z.object({
    rooms: z.array(
      z.object({
        guests: z.array(guestSchema),
      })
    ),
    holder: holderSchema,
    paymentType: z.enum(['AT_WEB', 'AT_HOTEL']),
  });

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      rooms: selectedRooms.map((r) => ({
        guests: Array.from({ length: r.adults + r.children }).map(() => ({
          firstName: '',
          lastName: '',
        })),
      })),
      holder: { firstName: '', lastName: '', email: '', phone: '' },
      paymentType: 'AT_WEB',
    },
  });

  const { fields: roomFields } = useFieldArray({ control, name: 'rooms' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {roomFields.map((roomField, roomIndex) => (
        <div key={roomField.id} className="rounded-2xl border border-ink-100 bg-sand-100 p-5">
          <h3 className="mb-3 font-display text-lg text-ink-900">
            {selectedRooms[roomIndex]?.roomName || `غرفة ${roomIndex + 1}`}
          </h3>
          <div className="flex flex-col gap-3">
            {selectedRooms[roomIndex] &&
              Array.from({ length: selectedRooms[roomIndex].adults + selectedRooms[roomIndex].children }).map(
                (_, guestIndex) => (
                  <div key={guestIndex} className="grid grid-cols-3 gap-3">
                    <Input
                      label={`اسم الضيف ${guestIndex + 1} (الأول)`}
                      {...register(`rooms.${roomIndex}.guests.${guestIndex}.firstName`)}
                      error={errors.rooms?.[roomIndex]?.guests?.[guestIndex]?.firstName?.message}
                    />
                    <Input
                      label="اسم العائلة"
                      {...register(`rooms.${roomIndex}.guests.${guestIndex}.lastName`)}
                      error={errors.rooms?.[roomIndex]?.guests?.[guestIndex]?.lastName?.message}
                    />
                    <Input
                      label="السن (اختياري)"
                      type="number"
                      {...register(`rooms.${roomIndex}.guests.${guestIndex}.age`)}
                    />
                  </div>
                )
              )}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-ink-100 bg-sand-100 p-5">
        <h3 className="mb-3 font-display text-lg text-ink-900">بيانات صاحب الحجز</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="الاسم الأول" {...register('holder.firstName')} error={errors.holder?.firstName?.message} />
          <Input label="اسم العائلة" {...register('holder.lastName')} error={errors.holder?.lastName?.message} />
          <Input label="الإيميل" type="email" {...register('holder.email')} error={errors.holder?.email?.message} />
          <Input label="رقم الموبايل" {...register('holder.phone')} error={errors.holder?.phone?.message} />
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-sand-100 p-5">
        <h3 className="mb-3 font-display text-lg text-ink-900">طريقة الدفع</h3>
        <Controller
          control={control}
          name="paymentType"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {paymentTypeOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={field.value === opt.value}
                    onChange={() => field.onChange(opt.value)}
                  />
                  <span className="text-sm text-ink-600">{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        />
      </div>

      <Button type="submit" isLoading={isLoading}>
        تأكيد الحجز
      </Button>
    </form>
  );
}
