import { Link } from 'react-router-dom';
import { ListingGrid } from '../components/listings/ListingGrid';
import { useAuth } from '../context/AuthContext';
import { mockListings } from '../data/mockListings';

export function MyListingsPage() {
  const { user } = useAuth();
  const myListings = mockListings.filter((listing) => listing.ownerId === user?.id);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="mt-2 text-gray-600">Твоите активни и последни listing-и.</p>
        </div>
        <Link
          to="/create"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Create Listing
        </Link>
      </header>

      <ListingGrid listings={myListings} emptyText="Все още нямаш публикувани обяви." />
    </section>
  );
}
