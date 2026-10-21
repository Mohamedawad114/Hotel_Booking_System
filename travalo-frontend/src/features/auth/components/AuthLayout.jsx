export function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-sand-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-sand-100 shadow-soft md:grid md:grid-cols-[1fr_1.1fr]">
        {/* اللوحة الجانبية - مش ظاهرة على الموبايل */}
        <aside className="relative hidden flex-col justify-between bg-ink p-10 text-sand-100 md:flex">
          <div>
            <span className="font-display text-2xl tracking-tight">Travalo</span>
          </div>

          <div>
            <p className="mb-4 font-display text-3xl leading-snug">
              الرحلة بتبدأ من هنا
            </p>
            <p className="text-sm text-ink-100/80">
              دوّر، احجز، وسافر. آلاف الفنادق حول العالم في مكان واحد.
            </p>
          </div>

          {/* توقيع بصري: ختم سفر دائري بيدور شوية زي ختم الباسبور */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-100/60">© {new Date().getFullYear()} Travalo</span>
            <div className="flex h-16 w-16 -rotate-6 items-center justify-center rounded-full border-2 border-dashed border-amber/70">
              <span className="font-display text-[10px] leading-tight text-amber">
                VERIFIED
                <br />
                STAY
              </span>
            </div>
          </div>
        </aside>

        {/* الفورم */}
        <div className="relative p-8 sm:p-10">
          {eyebrow && (
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-amber-600">
              {eyebrow}
            </span>
          )}
          <h1 className="mb-2 font-display text-2xl font-semibold text-ink-900">{title}</h1>
          {subtitle && <p className="mb-6 text-sm text-ink-400">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
