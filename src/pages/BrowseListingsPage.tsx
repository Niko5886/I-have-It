import { useMemo, useState } from 'react';
import { ListingGrid } from '../components/listings/ListingGrid';
import { ListingSearchBar } from '../components/listings/ListingSearchBar';
import { Pagination } from '../components/listings/Pagination';
import { mockListings } from '../data/mockListings';

const PAGE_SIZE = 6;

export function BrowseListingsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return mockListings;
    }

    return mockListings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(q) ||
        listing.storeName.toLowerCase().includes(q) ||
        listing.city.toLowerCase().includes(q),
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedListings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [currentPage, filtered]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Browse Listings</h1>
        <p className="mt-2 text-gray-600">Списък с активни предложения, търсене и странициране.</p>
      </header>

      <ListingSearchBar
        query={query}
        onQueryChange={(nextQuery) => {
          setQuery(nextQuery);
          setPage(1);
        }}
      />

      <ListingGrid listings={pagedListings} emptyText="Няма резултати за твоето търсене." />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
