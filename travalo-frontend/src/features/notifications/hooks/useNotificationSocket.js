import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { createNotificationSocket } from '@/lib/socket';

// بينادى مرة واحدة في مستوى الـ App (زي useBootstrapAuth) عشان يفضل
// متصل طول ما اليوزر داخل حسابه، ويعرض toast + يحدّث قائمة الإشعارات
// لحظيًا لما يوصل حدث 'notification' من السيرفر.
export function useNotificationSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = createNotificationSocket(accessToken);
    socketRef.current = socket;
    socket.connect();

    socket.on('notification', (payload) => {
      toast(payload.title || 'إشعار جديد', { icon: '🔔' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('connect_error', () => {
      // مش بنعمل حاجة صاخبة هنا، الاتصال هيتحاول تاني تلقائيًا
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, queryClient]);
}
