import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserListings, deleteListing, getListingPhotoUrl } from '../lib/listings';
import type { ListingWithPhotos } from '../types/listing';

export function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyListings() {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getUserListings();
        setListings(data);
      } catch (err) {
        console.error('Failed to load my listings:', err);
        setError('Грешка при зареждане на твоите обявления.');
      } finally {
        setLoading(false);
      }
    }

    loadMyListings();
  }, [user]);

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Сигурен ли си, че искаш да изтриеш този listing?')) {
      return;
    }

    try {
      setDeleting(id);
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Failed to delete listing:', err);
      alert('Не успяхме да изтрием listing-а. Опитай отново.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Моите обявления</h1>
          <p className="mt-2 text-gray-600">Управление на твоите активни обявления.</p>
        </div>
        <Link
          to="/create"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Нова обява
        </Link>
      </header>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="inline-block">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
          </div>
          <p className="mt-4 text-gray-600">Зареждане на твоите обявления...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      ) : listings.length === 0 ? (
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
              d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6H6"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Все още нямаш обявления</h3>
          <p className="mt-2 text-sm text-gray-600">Начни да продаваш качествена храна на по-добра цена!</p>
          <Link
            to="/create"
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Създай първа обява
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => {
            const coverPhoto = listing.listing_photos?.[0];
            const imageUrl = coverPhoto ? getListingPhotoUrl(coverPhoto.storage_path) : null;
            const createdAt = new Date(listing.created_at).toLocaleDateString('bg-BG');
            const priceFormatted = new Intl.NumberFormat('bg-BG', {
              style: 'currency',
              currency: 'BGN',
              maximumFractionDigits: 2,
            }).format(listing.price);

            return (
              <div
                key={listing.id}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <svg
                        className="w-8 h-8 text-gray-400"
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{listing.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{listing.location}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xl font-bold text-emerald-600">{priceFormatted}</span>
                    <span className="text-xs text-gray-500">{createdAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/listing/${listing.id}`}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Преглед
                  </Link>

                  <Link
                    to={`/edit/${listing.id}`}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Редактирай
                  </Link>

                  <button
                    onClick={() => handleDeleteListing(listing.id)}
                    disabled={deleting === listing.id}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting === listing.id ? 'Изтриване...' : 'Изтрий'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
