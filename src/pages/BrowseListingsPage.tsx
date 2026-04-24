import { useEffect, useMemo, useState } from 'react';
import { ListingGrid } from '../components/listings/ListingGrid';
import { ListingSearchBar } from '../components/listings/ListingSearchBar';
import { Pagination } from '../components/listings/Pagination';
import { getListings } from '../lib/listings';
import type { ListingWithPhotos } from '../types/listing';

const PAGE_SIZE = 6;

export function BrowseListingsPage() {
  const [allListings, setAllListings] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // Fetch all listings on mount
  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        setError(null);
        const { listings } = await getListings(1, 100); // Load more for client-side search
        setAllListings(listings);
      } catch (err) {
        console.error('Failed to load listings:', err);
        setError('Грешка при зареждане на обявите. Опитай отново.');
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  // Filter listings based on search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allListings;
    }

    return allListings.filter((listing) =>
      [listing.title, listing.description, listing.location]
        .filter(Boolean)
        .some((text) => text?.toLowerCase().includes(q))
    );
  }, [query, allListings]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedListings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [currentPage, filtered]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Разгледай обявите</h1>
        <p className="mt-2 text-gray-600">
          Намери качествена храна на по-добра цена от местни магазини и ресторанти.
        </p>
      </header>

      <ListingSearchBar
        query={query}
        onQueryChange={(nextQuery) => {
          setQuery(nextQuery);
          setPage(1);
        }}
      />

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
      ) : pagedListings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 21l-4.35-4.35m0 0A7.5 7.5 0 103.305 3.305a7.5 7.5 0 0010.345 10.345z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Няма резултати</h3>
          <p className="mt-2 text-sm text-gray-600">
            {query
              ? 'Не намерихме обявления, които да отговарят на твоето търсене.'
              : 'Няма налични обявления в момента.'}
          </p>
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setPage(1);
              }}
              className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Изчисти търсенето
            </button>
          )}
        </div>
      ) : (
        <>
          <ListingGrid listings={pagedListings} emptyText="Няма резултати за твоето търсене." />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}
