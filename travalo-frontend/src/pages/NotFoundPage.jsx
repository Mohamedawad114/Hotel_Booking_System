import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-sand-200 px-4 text-center">
      <h1 className="font-display text-4xl text-ink-900">404</h1>
      <p className="text-ink-400">الصفحة اللي بتدور عليها مش موجودة.</p>
      <Link to="/" className="text-ink-900 underline underline-offset-4">
        ارجع للرئيسية
      </Link>
    </div>
  );
}
