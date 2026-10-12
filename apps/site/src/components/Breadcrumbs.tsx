import { Link } from "react-router-dom";
import { ChevronRight, House } from "lucide-react";

/** Breadcrumb trail for subpages. */
export function Breadcrumbs({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 font-mono text-xs text-fog">
      <Link to="/" className="flex items-center gap-1 hover:text-snow">
        <House className="h-3 w-3" />
        Home
      </Link>
      {trail.map((t) => (
        <span key={t.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {t.to ? (
            <Link to={t.to} className="hover:text-snow">
              {t.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-snow">
              {t.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
