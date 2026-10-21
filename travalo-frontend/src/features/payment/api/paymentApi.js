import { api } from '@/lib/axios';

// GET /api/payment/gateways — Response: { data: PaymentGateway[] } (enum values زي ['stripe'])
export const getPaymentGateways = () => api.get('/payment/gateways');

// GET /api/payment?page=&limit= — Response: { message, data, meta: { total, pages } }
export const getMyPayments = (page = 1, limit = 20) =>
  api.get('/payment', { params: { page, limit } });

// GET /api/payment/:paymentId — Response: { message, data: payment }
export const getPaymentDetails = (paymentId) => api.get(`/payment/${paymentId}`);

// POST /api/payment/:bookingId/pay — PaymentInput
// { gateway (إجباري), capture_method?, off_session?, amountDetails?, metadata? }
// إحنا بنبعت { gateway } بس، باقي الفيلدات اختيارية ومفيش داعي ليها حاليًا
// Response: { message, data: { clientSecret, id, bookingId }, meta: { gateway } }
export const initiatePayment = (bookingId, payload) => api.post(`/payment/${bookingId}/pay`, payload);
