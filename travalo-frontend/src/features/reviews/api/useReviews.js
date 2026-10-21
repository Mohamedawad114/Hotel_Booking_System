import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getHotelReviews, addReview } from './reviewsApi';

const PAGE_SIZE = 10;

export function useHotelReviews(hotelId) {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['hotel-reviews', hotelId, page],
    queryFn: async () => {
      const { data } = await getHotelReviews(hotelId, page, PAGE_SIZE);
      return data.data ?? [];
    },
    enabled: Boolean(hotelId),
  });

  return {
    ...query,
    page,
    setPage,
    hasNextPage: (query.data?.length ?? 0) === PAGE_SIZE,
    hasPrevPage: page > 1,
  };
}

export function useAddReview(hotelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addReview(hotelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-reviews', hotelId] });
    },
  });
}
