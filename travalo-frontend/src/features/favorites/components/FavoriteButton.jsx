import toast from 'react-hot-toast';
import { useIsFavorite, useToggleFavorite } from '../api/useFavorites';

export function FavoriteButton({ hotelId, className = '' }) {
  const isFavorite = useIsFavorite(hotelId);
  const { add, remove, isPending } = useToggleFavorite(hotelId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const action = isFavorite ? remove : add;
    action.mutate(undefined, {
      onError: (error) => toast.error(error?.response?.data?.message || 'حصل خطأ'),
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorite ? 'شيل من المفضلة' : 'ضيف للمفضلة'}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-soft transition-transform hover:scale-105 disabled:opacity-60 ${className}`}
    >
      <span className={isFavorite ? 'text-coral' : 'text-ink-300'}>{isFavorite ? '♥' : '♡'}</span>
    </button>
  );
}
