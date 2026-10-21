import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, id, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-600">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`w-full rounded-xl border bg-sand-100 px-4 py-2.5 text-ink placeholder:text-ink-400/60
          transition-colors focus:border-amber focus:bg-white
          ${error ? 'border-coral' : 'border-ink-100'} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-coral">{error}</span>}
    </div>
  );
});
