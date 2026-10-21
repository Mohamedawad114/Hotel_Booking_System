export function StarRatingInput({ value, onChange, error }) {
  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-transform hover:scale-110 ${
              star <= value ? 'text-amber' : 'text-ink-100'
            }`}
            aria-label={`${star} نجوم`}
          >
            ★
          </button>
        ))}
      </div>
      {error && <span className="text-sm text-coral">{error}</span>}
    </div>
  );
}
