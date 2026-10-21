import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { UpdateProfileForm } from '../components/UpdateProfileForm';
import { UpdatePasswordForm } from '../components/UpdatePasswordForm';
import { ResetPasswordSection } from '../components/ResetPasswordSection';
import { TwoFASetup } from '../components/TwoFASetup';
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload';
import { logoutRequest, logoutAllRequest } from '../api/profileApi';

export default function ProfilePage() {
  const { data: user, isLoading } = useProfile();
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  const handleLogout = async (all = false) => {
    try {
      await (all ? logoutAllRequest() : logoutRequest());
    } catch {
      // امسح الجلسة محليًا حتى لو الـ request فشل
    } finally {
      clearSession();
      toast.success(all ? 'تم تسجيل الخروج من كل الأجهزة' : 'تم تسجيل الخروج');
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-200">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-200 px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl text-ink-900">حسابك</h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => handleLogout(false)}>
              تسجيل الخروج
            </Button>
            <Button variant="outline" onClick={() => handleLogout(true)}>
              خروج من كل الأجهزة
            </Button>
          </div>
        </div>

        <SectionCard title="صورة البروفايل">
          <ProfilePhotoUpload user={user} />
        </SectionCard>

        <UpdateProfileForm user={user} />
        <TwoFASetup user={user} />
        <UpdatePasswordForm />
        <ResetPasswordSection userEmail={user?.email} />

        <SectionCard title="خطر" description="الإجراءات دي مبتترجعش">
          <Button variant="outline" className="border-coral text-coral hover:bg-coral/10">
            حذف الحساب
          </Button>
          <p className="mt-2 text-xs text-ink-400">
            TODO: مفيش endpoint لحذف الحساب ظاهر في الـ swagger، الزرار ده placeholder.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
