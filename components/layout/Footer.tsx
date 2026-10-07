import Link from "next/link";
import { Calculator } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-[hsl(var(--primary))] font-semibold text-sm mb-2">
              <Calculator className="w-4 h-4" aria-hidden="true" />
              NPTEL Score Calculator
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              An independent utility to help NPTEL students calculate scores,
              check certificate eligibility, and plan exam preparation.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Tools
            </h3>
            <ul className="space-y-1.5">
              {[
                { href: "/calculate", label: "Score Calculator" },
                { href: "/planner", label: "Score Planner" },
                { href: "/predict", label: "Performance Predictor" },
                { href: "/courses", label: "Course Browser" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Information
            </h3>
            <ul className="space-y-1.5">
              {[
                { href: "/about", label: "About" },
                {
                  href: "https://nptel.ac.in",
                  label: "Official NPTEL Website",
                  external: true,
                },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                    {link.external && (
                      <span className="sr-only"> (opens in new tab)</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer + copyright */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            This calculator provides estimates based on configured scoring rules.
            Always verify the official grading criteria for your specific NPTEL
            course and semester. Not affiliated with or endorsed by NPTEL or IITs.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © {new Date().getFullYear()} NPTEL Score Calculator. Open source.
          </p>
        </div>
      </div>
    </footer>
  );
}
