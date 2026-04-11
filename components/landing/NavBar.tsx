"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/rooms", label: "Rooms" },
    { href: "/pitch", label: "Pitch" },
  ];

  return (
    <nav className="w-full z-50 bg-[#1A1D27]/80 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center">
            <span className="text-white font-heading font-bold text-sm">F</span>
          </div>
          <span className="text-white text-sm font-medium">
            Fruition <span className="font-bold">MKE</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          {links.map((link) => {
            const isActive =
              link.href === "/" || link.href === "/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  isActive
                    ? "text-amber-400 font-medium"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
