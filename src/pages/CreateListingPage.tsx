import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../lib/listings';
import { supabase } from '../lib/supabase';

export function CreateListingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
  });

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
      setLoading(true);
      setError(null);

      // Create listing
      const listing = await createListing({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        location: formData.location.trim(),
      });

      // Upload photos if selected
      if (selectedFiles.length > 0) {
        setUploadingPhotos(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          for (const file of selectedFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${listing.id}/${Date.now()}.${fileExt}`;

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
                listing_id: listing.id,
                storage_path: fileName,
              },
            ]);
          }
        }
      }

      navigate(`/listing/${listing.id}`);
    } catch (err) {
      console.error('Error creating listing:', err);
      setError('Грешка при създаване на обявата. Опитай отново.');
    } finally {
      setLoading(false);
      setUploadingPhotos(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Създай нова обява</h1>
        <p className="mt-2 text-gray-600">Попълни информацията за твоята храна и добави снимки.</p>
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
            placeholder="нпр. Пресни хлебчета от пекарната"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            disabled={loading}
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
            placeholder="Опиши детайли за храната, съставки, срок на изтичане и т.н."
            className="mt-2 w-full min-h-28 rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            disabled={loading}
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
              placeholder="5.99"
              step="0.01"
              min="0"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={loading}
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
              placeholder="нпр. София, ул. Цар Симеон"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Снимки</label>
          
          {selectedFiles.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-emerald-400 transition-colors">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Нажми или прeтегли снимки</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="mt-4 hidden"
                id="file-input"
                disabled={loading || uploadingPhotos}
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
              <p className="text-sm text-gray-600">{selectedFiles.length} снимка/и избрана/и</p>
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
                      disabled={loading || uploadingPhotos}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <label
                htmlFor="file-input"
                className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Добави още снимки
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={loading || uploadingPhotos}
              />
            </div>
          )}
        </div>

        {/* Submit buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || uploadingPhotos}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Създаване...' : uploadingPhotos ? 'Качване на снимки...' : 'Публикувай обява'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-listings')}
            disabled={loading || uploadingPhotos}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмени
          </button>
        </div>
      </form>
    </section>
  );
}
