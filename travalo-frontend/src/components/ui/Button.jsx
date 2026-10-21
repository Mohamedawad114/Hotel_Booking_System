export function Button({
  children,
  isLoading = false,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'bg-ink text-sand-100 hover:bg-ink-600 active:scale-[0.98]',
    outline: 'border border-ink-100 text-ink hover:bg-sand-300',
    ghost: 'text-ink-600 hover:bg-sand-300',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
