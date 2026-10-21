import { useMutation, useQuery } from '@tanstack/react-query';
import { getPaymentGateways, getMyPayments, getPaymentDetails, initiatePayment } from './paymentApi';

export function usePaymentGateways() {
  return useQuery({
    queryKey: ['payment-gateways'],
    queryFn: async () => {
      const { data } = await getPaymentGateways();
      return data.data ?? [];
    },
    staleTime: Infinity, // ثابتة عمليًا (enum)
  });
}

export function useMyPayments(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['my-payments', page],
    queryFn: async () => {
      const { data } = await getMyPayments(page, limit);
      return data;
    },
  });
}

export function usePaymentDetails(paymentId) {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const { data } = await getPaymentDetails(paymentId);
      return data.data;
    },
    enabled: Boolean(paymentId),
  });
}

// payload: { gateway }
export function useInitiatePayment(bookingId) {
  return useMutation({
    mutationFn: (payload) => initiatePayment(bookingId, payload).then((r) => r.data),
  });
}
