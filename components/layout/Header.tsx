"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/calculate", label: "Calculator" },
  { href: "/planner", label: "Planner" },
  { href: "/predict", label: "Predictor" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-[hsl(var(--primary))] font-semibold text-base tracking-tight hover:opacity-80 transition-opacity"
            aria-label="NPTEL Score Calculator — Home"
          >
            <Calculator className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:inline">NPTEL Score Calculator</span>
            <span className="sm:hidden">NPTEL Calc</span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded transition-colors",
                  pathname === link.href
                    ? "text-[hsl(var(--primary))] font-medium bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t border-gray-100 bg-white"
          aria-label="Mobile navigation"
        >
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2 text-sm rounded transition-colors",
                  pathname === link.href
                    ? "text-[hsl(var(--primary))] font-medium bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
