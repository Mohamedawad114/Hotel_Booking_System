import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { logoutRequest } from '@/features/profile/api/profileApi';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  useProfile();

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      // حتى لو فشل الـ request، امسح الجلسة محليًا
    } finally {
      clearSession();
      toast.success('تم تسجيل الخروج');
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sand-200 px-4 text-center">
      <h1 className="font-display text-3xl text-ink-900">
        أهلاً {user?.name || ''} 👋
      </h1>
      <p className="text-ink-400">ده مكان الـ dashboard، هنبنيه في الخطوة الجاية.</p>
      <div className="flex gap-3">
        <Button onClick={() => navigate('/search')}>دوّر على فندق</Button>
        <Button variant="outline" onClick={() => navigate('/bookings')}>
          حجوزاتي
        </Button>
        <Button variant="outline" onClick={() => navigate('/notifications')}>
          الإشعارات
        </Button>
        <Button variant="outline" onClick={() => navigate('/favorites')}>
          المفضلة
        </Button>
        <Button variant="outline" onClick={() => navigate('/profile')}>
          حسابك
        </Button>
        <Button variant="ghost" onClick={handleLogout}>
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}
