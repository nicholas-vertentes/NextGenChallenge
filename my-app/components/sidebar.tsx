import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
};

// Single entry for now; later tasks add more sections (e.g. Holdings).
const NAV_ITEMS: NavItem[] = [{ href: "/", label: "Portfolio Overview" }];

export function Sidebar() {
  return (
    <nav
      aria-label="Primary"
      className="flex w-full flex-col gap-1 p-4"
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
