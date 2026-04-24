import { Link } from 'react-router-dom';
import type { Listing } from '../../types/listing';

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const discount = Math.round((1 - listing.price / listing.originalPrice) * 100);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
          -{discount}%
        </span>
        <span className="text-xs uppercase tracking-wide text-gray-500">{listing.category}</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
      <p className="mt-2 text-sm text-gray-600">{listing.description}</p>

      <div className="mt-4 space-y-1 text-sm text-gray-700">
        <p>
          <strong>Магазин:</strong> {listing.storeName}
        </p>
        <p>
          <strong>Град:</strong> {listing.city}
        </p>
        <p>
          <strong>Вземане:</strong> {listing.pickupWindow}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">{listing.price.toFixed(2)} лв.</p>
          <p className="text-xs text-gray-500 line-through">{listing.originalPrice.toFixed(2)} лв.</p>
        </div>

        <Link
          to={`/listing/${listing.id}`}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Виж детайли
        </Link>
      </div>
    </article>
  );
}
