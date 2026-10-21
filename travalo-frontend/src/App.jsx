import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AppRoutes } from '@/routes/AppRoutes';
import { useBootstrapAuth } from '@/hooks/useBootstrapAuth';
import { useNotificationSocket } from '@/features/notifications/hooks/useNotificationSocket';

export default function App() {
  useBootstrapAuth();
  useNotificationSocket();

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <AppRoutes />
    </BrowserRouter>
  );
}
