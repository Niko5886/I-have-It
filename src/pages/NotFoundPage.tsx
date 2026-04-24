import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="rounded-2xl bg-white p-10 text-center shadow-sm">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-gray-600">Страницата не беше намерена.</p>
      <Link to="/" className="mt-4 inline-block font-medium text-emerald-700 hover:underline">
        Към началната страница
      </Link>
    </section>
  );
}
