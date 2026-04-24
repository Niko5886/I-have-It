import { Link, useParams } from 'react-router-dom';
import { mockListings } from '../data/mockListings';

export function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const listing = mockListings.find((item) => item.id === id);

  if (!listing) {
    return (
      <section className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <Link to="/listings" className="mt-4 inline-block text-emerald-700 hover:underline">
          Обратно към обявите
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <p className="text-sm uppercase tracking-wide text-emerald-700">Listing Details</p>
      <h1 className="mt-2 text-3xl font-bold">{listing.title}</h1>
      <p className="mt-4 text-gray-700">{listing.description}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Магазин</p>
          <p className="font-semibold">{listing.storeName}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Град</p>
          <p className="font-semibold">{listing.city}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pickup Window</p>
          <p className="font-semibold">{listing.pickupWindow}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Цена</p>
          <p className="font-semibold">{listing.price.toFixed(2)} лв.</p>
        </div>
      </div>
    </section>
  );
}
