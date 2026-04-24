import { Link } from 'react-router-dom';
import type { ListingWithPhotos } from '../../types/listing';
import { getListingPhotoUrl } from '../../lib/listings';

type ListingCardProps = {
  listing: ListingWithPhotos;
};

export function ListingCard({ listing }: ListingCardProps) {
  const coverPhoto = listing.listing_photos?.[0];
  const imageUrl = coverPhoto ? getListingPhotoUrl(coverPhoto.storage_path) : null;

  const priceFormatted = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'BGN',
    maximumFractionDigits: 2,
  }).format(listing.price);

  const createdAt = new Date(listing.created_at).toLocaleDateString('bg-BG');

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Image or placeholder */}
      <div className="relative bg-gray-100 aspect-video overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
          {listing.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{listing.description}</p>
          )}
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <p className="flex items-start">
            <svg
              className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{listing.location}</span>
          </p>
          <p className="text-xs text-gray-500">Публикувано: {createdAt}</p>
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-emerald-600">{priceFormatted}</p>
          </div>

          <Link
            to={`/listing/${listing.id}`}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Виж детайли
          </Link>
        </div>
      </div>
    </article>
  );
}
