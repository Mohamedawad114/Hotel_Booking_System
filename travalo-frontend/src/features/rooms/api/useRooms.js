import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getHotelRooms, getRoomFacilities } from './roomsApi';

export function useHotelRooms(hotelId, filters) {
  return useInfiniteQuery({
    queryKey: ['hotel-rooms', hotelId, filters],
    queryFn: async ({ pageParam }) => {
      const { data } = await getHotelRooms(hotelId, {
        ...filters,
        cursor: pageParam,
        limit: 10,
      });
      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor || undefined,
    enabled: Boolean(hotelId),
  });
}

// بيتنادى lazy (بس لما اليوزر يفتح تفاصيل غرفة معينة) عشان منجيبش
// facilities كل الغرف مرة واحدة
export function useRoomFacilities(roomId, enabled) {
  return useQuery({
    queryKey: ['room-facilities', roomId],
    queryFn: async () => {
      const { data } = await getRoomFacilities(roomId);
      return data.data ?? [];
    },
    enabled: Boolean(roomId) && enabled,
  });
}
