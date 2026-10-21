export function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-sand-100 p-6 shadow-soft">
      <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">{title}</h2>
      {description && <p className="mb-5 text-sm text-ink-400">{description}</p>}
      {children}
    </div>
  );
}
