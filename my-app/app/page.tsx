export default function Home() {
  return (
    <div className="flex h-full flex-col">
      <h2 className="text-2xl font-semibold text-zinc-900">
        Portfolio Overview
      </h2>

      {/* Summary region: future tasks populate this with dynamic data. */}
      <section
        aria-label="Portfolio summary"
        className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500"
      >
        Portfolio summary will appear here.
      </section>
    </div>
  );
}
