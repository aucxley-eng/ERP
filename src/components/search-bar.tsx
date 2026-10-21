import { PROPERTY_TYPES } from "@/lib/constants";

export default function SearchBar({
  defaultQuery = "",
  defaultType = "",
  action = "/listings",
}: {
  defaultQuery?: string;
  defaultType?: string;
  action?: string;
}) {
  return (
    <form
      action={action}
      className="flex w-full items-stretch gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg sm:rounded-full"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-slate-400">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          name="q"
          defaultValue={defaultQuery}
          placeholder="Search town, county or keyword"
          className="w-full bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
      <select
        name="propertyType"
        defaultValue={defaultType}
        className="hidden max-w-[140px] rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand sm:block"
      >
        <option value="">Any type</option>
        {PROPERTY_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <button className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-light sm:rounded-full">
        Search
      </button>
    </form>
  );
}
