import type { ListingWithPhotos } from '../../types/listing';
import { ListingCard } from './ListingCard';

type ListingGridProps = {
  listings: ListingWithPhotos[];
  emptyText?: string;
};

export function ListingGrid({ listings, emptyText = 'Няма намерени обяви.' }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
