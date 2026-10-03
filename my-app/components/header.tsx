export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 px-6">
      <h1 className="text-lg font-semibold text-white">
        Wealth Management Dashboard
      </h1>

      {/* Reserved for future controls (currency toggle, account selector). */}
      <div className="flex items-center gap-3" />
    </header>
  );
}
