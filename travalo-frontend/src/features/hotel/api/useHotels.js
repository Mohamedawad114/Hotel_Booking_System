import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { searchHotels, getHotelById, getHotelFacilities } from './hotelApi';

// بيتشال cursor/limit ويتضافوا تلقائي من react-query
export function useHotelSearch(filters) {
  return useInfiniteQuery({
    queryKey: ['hotels', filters],
    queryFn: ({ pageParam }) =>
      searchHotels({ ...filters, cursor: pageParam, limit: 12 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor || undefined,
  });
}

export function useHotelDetails(hotelId) {
  return useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      const { data } = await getHotelById(hotelId);
      return data.data;
    },
    enabled: Boolean(hotelId),
  });
}

export function useHotelFacilities(hotelId) {
  return useQuery({
    queryKey: ['hotel-facilities', hotelId],
    queryFn: async () => {
      const { data } = await getHotelFacilities(hotelId);
      return data.data ?? [];
    },
    enabled: Boolean(hotelId),
  });
}
