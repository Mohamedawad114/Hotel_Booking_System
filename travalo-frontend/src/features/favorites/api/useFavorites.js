import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getFavorites, addFavorite, removeFavorite } from './favoritesApi';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await getFavorites();
      return data.data ?? [];
    },
  });
}

export function useIsFavorite(hotelId) {
  const { data: favorites = [] } = useFavorites();
  return favorites.some((f) => f.hotelId === hotelId || f.hotel?.id === hotelId);
}

export function useToggleFavorite(hotelId) {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['favorites'] });

  const add = useMutation({
    mutationFn: () => addFavorite(hotelId),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: () => removeFavorite(hotelId),
    onSuccess: invalidate,
  });

  return { add, remove, isPending: add.isPending || remove.isPending };
}
