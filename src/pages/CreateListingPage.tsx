export function CreateListingPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Create Listing</h1>
      <p className="mt-2 text-gray-600">Формата за създаване на listing ще се имплементира в следваща стъпка.</p>

      <form className="mt-6 grid gap-4">
        <input
          disabled
          placeholder="Title"
          className="rounded-lg border border-gray-300 px-3 py-2 text-gray-500"
        />
        <textarea
          disabled
          placeholder="Description"
          className="min-h-28 rounded-lg border border-gray-300 px-3 py-2 text-gray-500"
        />
        <button
          type="button"
          disabled
          className="rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-700"
        >
          Save Draft
        </button>
      </form>
    </section>
  );
}
