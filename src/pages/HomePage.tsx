import { Link } from 'react-router-dom';
import { ListingGrid } from '../components/listings/ListingGrid';
import { mockListings } from '../data/mockListings';

export function HomePage() {
  const latestListings = mockListings.slice(0, 3);

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-emerald-700">Welcome</p>
        <h1 className="mt-2 text-3xl font-bold">I have It Marketplace</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Открий последните food rescue предложения около теб и вземи качествена храна на по-добра цена.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/listings"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
          >
            Разгледай обявите
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
          >
            Създай акаунт
          </Link>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Latest Listings Preview</h2>
          <Link to="/listings" className="text-sm font-medium text-emerald-700 hover:underline">
            Виж всички
          </Link>
        </div>
        <ListingGrid listings={latestListings} />
      </div>
    </section>
  );
}
