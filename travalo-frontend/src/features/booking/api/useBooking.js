import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  searchAvailability,
  selectRooms,
  createBooking,
  getBookings,
  getBookingDetail,
  cancelBooking,
} from './bookingApi';
import { generateIdempotencyKey } from '@/lib/idempotency';

export function useSearchAvailability(hotelId) {
  return useMutation({
    // hotels array من Hotelbeds — بناخد أول فندق بس لأننا بندور بـ hotel واحد محدد
    mutationFn: async (payload) => {
      const { data } = await searchAvailability(hotelId, payload);
      return data.data?.[0] ?? null; // { rooms: [{ code, name, rates: [...] }] }
    },
  });
}

// rooms: [{ rateKey, adults, children }]
export function useSelectRooms(hotelId) {
  return useMutation({
    mutationFn: (rooms) => selectRooms(hotelId, rooms).then((r) => r.data),
  });
}

// input: { rooms: [{ guests }], holder, paymentType }
export function useCreateBooking(hotelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createBooking(hotelId, input, generateIdempotencyKey()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

const PAGE_SIZE = 10;

export function useBookings() {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['bookings', page],
    queryFn: async () => {
      const { data } = await getBookings(page, PAGE_SIZE);
      return { bookings: data.data ?? [], meta: data.meta };
    },
  });

  const total = query.data?.meta?.total ?? 0;
  const hasNextPage = page * PAGE_SIZE < total;

  return {
    ...query,
    bookings: query.data?.bookings ?? [],
    page,
    setPage,
    hasNextPage,
    hasPrevPage: page > 1,
  };
}

export function useBookingDetail(id) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data } = await getBookingDetail(id);
      return data.data ?? data;
    },
    enabled: Boolean(id),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    // response غير ملفوف: { message } أو { message, refundAmount, cancellationFee }
    mutationFn: ({ bookingId, reason }) =>
      cancelBooking(bookingId, reason, generateIdempotencyKey()).then((r) => r.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
}
