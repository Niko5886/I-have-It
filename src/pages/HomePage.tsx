import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingGrid } from '../components/listings/ListingGrid';
import { getLatestListings } from '../lib/listings';
import type { ListingWithPhotos } from '../types/listing';

export function HomePage() {
  const [listings, setListings] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLatestListings() {
      try {
        setLoading(true);
        setError(null);
        const data = await getLatestListings(6);
        setListings(data);
      } catch (err) {
        console.error('Failed to load latest listings:', err);
        setError('Грешка при зареждане на обявите.');
      } finally {
        setLoading(false);
      }
    }

    loadLatestListings();
  }, []);

  return (
    <section className="space-y-12">
      {/* Welcome section */}
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-emerald-700 font-semibold">Добре дошъл/а</p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900">I have It Marketplace</h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600 leading-relaxed">
          Открий последните food rescue предложения около теб и вземи качествена храна на по-добра
          цена от местни магазини и ресторанти.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/listings"
            className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Разгледай обявите
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Създай акаунт
          </Link>
        </div>
      </div>

      {/* Latest listings section */}
      <div>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Последни обявления</h2>
            <p className="mt-1 text-sm text-gray-600">6 най-новите предложения</p>
          </div>
          <Link
            to="/listings"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-600 transition-colors"
          >
            Виж всички →
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <div className="inline-block">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
            </div>
            <p className="mt-4 text-gray-600">Зареждане на обявите...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-600">Няма налични обявления в момента.</p>
          </div>
        ) : (
          <ListingGrid listings={listings} />
        )}
      </div>
    </section>
  );
}
