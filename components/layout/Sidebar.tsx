"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/experiments", label: "Experiments" },
  { href: "/papers", label: "Papers" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/cases", label: "Featured Cases" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-white md:flex md:flex-col">
      <div className="px-5 py-6">
        <span className="font-serif text-xl font-semibold text-ink">LAB2PUB</span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-teal-light text-teal-dark" : "text-slate hover:bg-paper hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-5 py-5 text-xs text-slate">v2 foundation</div>
    </aside>
  );
}
