type ListingSearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function ListingSearchBar({ query, onQueryChange }: ListingSearchBarProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <label htmlFor="listing-search" className="mb-2 block text-sm font-medium text-gray-700">
        Търси по заглавие, магазин или град
      </label>
      <input
        id="listing-search"
        type="search"
        placeholder="Пример: bakery, София..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-emerald-500 focus:ring"
      />
    </div>
  );
}
