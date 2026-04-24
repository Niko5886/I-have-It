import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getListingById, updateListing, getListingPhotoUrl } from '../lib/listings';
import { supabase } from '../lib/supabase';
import type { ListingWithUser } from '../types/listing';

export function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
  });

  useEffect(() => {
    async function loadListing() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getListingById(id);

        if (!data) {
          setError('Обявата не е намерена.');
          return;
        }

        // Check if current user is the owner
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user?.id !== data.user_id) {
          setError('Нямаш право да редактираш тази обява.');
          return;
        }

        setListing(data);
        setFormData({
          title: data.title,
          description: data.description || '',
          price: data.price.toString(),
          location: data.location,
        });
      } catch (err) {
        console.error('Failed to load listing:', err);
        setError('Грешка при зареждане на обявата.');
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !listing) return;

    if (!formData.title.trim()) {
      setError('Названието е задължително.');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Цената трябва да е по-голяма от 0.');
      return;
    }

    if (!formData.location.trim()) {
      setError('Местоположението е задължително.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update listing
      await updateListing(id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        location: formData.location.trim(),
      });

      // Upload new photos if selected
      if (selectedFiles.length > 0) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          for (const file of selectedFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('listing-photos')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Error uploading photo:', uploadError);
              continue;
            }

            // Create listing_photos record
            await supabase.from('listing_photos').insert([
              {
                listing_id: id,
                storage_path: fileName,
              },
            ]);
          }
        }
      }

      navigate(`/listing/${id}`);
    } catch (err) {
      console.error('Error updating listing:', err);
      setError('Грешка при актуализиране на обявата. Опитай отново.');
    } finally {
      setSaving(false);
    }
  };

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
        <button
          onClick={() => navigate('/my-listings')}
          className="mt-4 inline-block text-emerald-700 hover:underline font-medium"
        >
          Обратно към моите обявления
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Редактирай обява</h1>
        <p className="mt-2 text-gray-600">Обновете информацията за вашата храна.</p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
            Названиe *
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            disabled={saving}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-2 w-full min-h-28 rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            disabled={saving}
          />
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-gray-900">
              Цена (лв.) *
            </label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={saving}
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-900">
              Местоположение *
            </label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={saving}
            />
          </div>
        </div>

        {/* Current photos */}
        {listing.listing_photos && listing.listing_photos.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Текущи снимки</label>
            <div className="grid grid-cols-2 gap-3">
              {listing.listing_photos.map((photo) => (
                <div key={photo.id} className="rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={getListingPhotoUrl(photo.storage_path)}
                    alt="Listing"
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New photo upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Добави нови снимки</label>

          {selectedFiles.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-emerald-400 transition-colors">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Нажми или претегли нови снимки</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="mt-4 hidden"
                id="file-input"
                disabled={saving}
              />
              <label
                htmlFor="file-input"
                className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
              >
                Избери снимки
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{selectedFiles.length} нова/и снимка/и</p>
              <div className="grid grid-cols-2 gap-3">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                      disabled={saving}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <label
                htmlFor="file-input"
                className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Добави още
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={saving}
              />
            </div>
          )}
        </div>

        {/* Submit buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Актуализиране...' : 'Запази промени'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/listing/${id}`)}
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмени
          </button>
        </div>
      </form>
    </section>
  );
}
