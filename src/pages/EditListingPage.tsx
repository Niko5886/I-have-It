import { useParams } from 'react-router-dom';

export function EditListingPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Edit Listing</h1>
      <p className="mt-2 text-gray-600">Редактираш обява с ID: {id}</p>

      <form className="mt-6 grid gap-4">
        <input
          disabled
          placeholder="Updated title"
          className="rounded-lg border border-gray-300 px-3 py-2 text-gray-500"
        />
        <textarea
          disabled
          placeholder="Updated description"
          className="min-h-28 rounded-lg border border-gray-300 px-3 py-2 text-gray-500"
        />
        <button
          type="button"
          disabled
          className="rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-700"
        >
          Update Listing
        </button>
      </form>
    </section>
  );
}
