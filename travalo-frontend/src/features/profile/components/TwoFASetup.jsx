import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { enableTwoFASchema } from '../schemas/profileSchemas';
import { setupTwoFA, enableTwoFA } from '../api/profileApi';

export function TwoFASetup({ user }) {
  const queryClient = useQueryClient();
  const [qrSrc, setQrSrc] = useState(null); // نص (data URI أو رابط) بيفتح كصورة QR في المتصفح مباشرة
  const [backupCodes, setBackupCodes] = useState(null); // بتتعرض مرة واحدة بس بعد التفعيل

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(enableTwoFASchema) });

  const startSetupMutation = useMutation({
    mutationFn: () => setupTwoFA(),
    onSuccess: ({ data }) => {
      // الـ response عبارة عن نص لو حطيته في src بيتفسّر كصورة QR
      const raw = data?.data ?? data;
      setQrSrc(typeof raw === 'string' ? raw : raw?.qrCode || raw?.qr || null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'معرفناش نبدأ إعداد الـ 2FA');
    },
  });

  const enableMutation = useMutation({
    // enable-2fa payload: { code } نص بسيط
    mutationFn: ({ code }) => enableTwoFA({ code }),
    onSuccess: ({ data }) => {
      setQrSrc(null);
      setBackupCodes(data.data.backupCodes);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'الكود غلط');
    },
  });

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('اتنسخت الأكواد');
  };

  if (backupCodes) {
    return (
      <SectionCard
        title="احفظ أكواد الاسترجاع دي"
        description="دي المرة الوحيدة اللي هتظهرلك فيها الأكواد دي. احفظها في مكان آمن — هتحتاجها لو ضاع منك جهاز المصادقة."
      >
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-sand-300 p-4 font-mono text-sm">
          {backupCodes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={handleCopyBackupCodes}>
            نسخ الأكواد
          </Button>
          <Button onClick={() => setBackupCodes(null)}>حفظتها، تمام</Button>
        </div>
      </SectionCard>
    );
  }

  if (user?.isTwoFA) {
    return (
      <SectionCard title="المصادقة الثنائية (2FA)">
        <div className="flex items-center gap-2 text-sm text-ink-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          مفعّلة على حسابك
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="المصادقة الثنائية (2FA)"
      description="طبقة حماية إضافية: هتحتاج كود من تطبيق مصادقة عند كل تسجيل دخول"
    >
      {!qrSrc ? (
        <Button
          variant="outline"
          isLoading={startSetupMutation.isPending}
          onClick={() => startSetupMutation.mutate()}
        >
          فعّل الـ 2FA
        </Button>
      ) : (
        <div className="flex flex-col gap-4">
          <img
            src={qrSrc}
            alt="QR code لإعداد المصادقة الثنائية"
            className="h-48 w-48 self-center rounded-xl border border-ink-100 bg-white p-2"
          />
          <p className="text-sm text-ink-400">
            امسح الـ QR بتطبيق زي Google Authenticator، وبعدين ادخل الكود اللي ظهرلك:
          </p>
          <form
            onSubmit={handleSubmit((data) => enableMutation.mutate(data))}
            className="flex items-end gap-3"
          >
            <div className="flex-1">
              <Input
                label="الكود"
                id="code"
                inputMode="numeric"
                maxLength={8}
                placeholder="------"
                {...register('code')}
                error={errors.code?.message}
              />
            </div>
            <Button type="submit" isLoading={enableMutation.isPending}>
              تأكيد التفعيل
            </Button>
          </form>
        </div>
      )}
    </SectionCard>
  );
}
