import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getListingById, getListingPhotoUrl } from '../lib/listings';
import type { ListingWithUser } from '../types/listing';

export function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    async function loadListing() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getListingById(id);
        if (!data) {
          setError('Обявата не е намерена.');
        } else {
          setListing(data);
        }
      } catch (err) {
        console.error('Failed to load listing:', err);
        setError('Грешка при зареждане на обявата.');
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [id]);

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <div className="inline-block">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
        </div>
        <p className="mt-4 text-gray-600">Зареждане на обявата...</p>
      </section>
    );
  }

  if (error || !listing) {
    return (
      <section className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{error || 'Обявата не е намерена'}</h1>
        <Link to="/listings" className="mt-4 inline-block text-emerald-700 hover:underline font-medium">
          Обратно към обявите
        </Link>
      </section>
    );
  }

  const photos = listing.listing_photos || [];
  const currentPhoto = photos[currentPhotoIndex];
  const currentPhotoUrl = currentPhoto ? getListingPhotoUrl(currentPhoto.storage_path) : null;

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % Math.max(1, photos.length));
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + Math.max(1, photos.length)) % Math.max(1, photos.length));
  };

  const createdAt = new Date(listing.created_at).toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const priceFormatted = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'BGN',
    maximumFractionDigits: 2,
  }).format(listing.price);

  return (
    <section className="space-y-8">
      <Link to="/listings" className="inline-flex items-center text-emerald-700 hover:text-emerald-600">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Обратно към обявите
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Image slider */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-gray-100 overflow-hidden">
            <div className="relative aspect-square bg-gray-200">
              {currentPhotoUrl ? (
                <img
                  src={currentPhotoUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-gray-400"
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

              {/* Image slider controls */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 transition-colors"
                    aria-label="Предишна снимка"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 transition-colors"
                    aria-label="Следваща снимка"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Photo counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentPhotoIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail grid */}
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-4">
                {photos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentPhotoIndex ? 'border-emerald-600' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getListingPhotoUrl(photo.storage_path)}
                      alt={`Снимка ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>

            {listing.description && (
              <p className="mt-4 text-gray-700 leading-relaxed">{listing.description}</p>
            )}

            {/* Price */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">Цена</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{priceFormatted}</p>
            </div>

            {/* Location */}
            <div className="mt-4">
              <p className="text-sm text-gray-600">Местоположение</p>
              <p className="mt-1 text-gray-900 font-medium flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {listing.location}
              </p>
            </div>

            {/* Date */}
            <div className="mt-4">
              <p className="text-xs text-gray-500">Публикувано: {createdAt}</p>
            </div>
          </div>

          {/* Seller info */}
          {listing.user_profiles && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Продавач</h3>

              <div className="space-y-3">
                {listing.user_profiles.name && (
                  <div>
                    <p className="text-sm text-gray-600">Име</p>
                    <p className="font-medium text-gray-900">{listing.user_profiles.name}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a
                    href={`mailto:${listing.user_profiles.email}`}
                    className="font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    {listing.user_profiles.email}
                  </a>
                </div>

                {listing.user_profiles.phone_number && (
                  <div>
                    <p className="text-sm text-gray-600">Телефон</p>
                    <a
                      href={`tel:${listing.user_profiles.phone_number}`}
                      className="font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {listing.user_profiles.phone_number}
                    </a>
                  </div>
                )}
              </div>

              <button className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 transition-colors">
                Свържи се със продавача
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
