import { Link } from "react-router-dom";
import { useMeta } from "../lib/meta";

export function NotFound() {
  useMeta({
    title: "404 Not Found — Nasend",
    description: "The requested page does not exist.",
    path: "/404",
  });

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-6 py-24 space-y-4">
      <div className="font-mono text-xs text-[#8b949e]">
        404
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-[#f0f6fc]">
        Page not found
      </h1>

      <p className="text-sm text-[#8b949e] leading-relaxed">
        The requested path does not exist on this site.
      </p>

      <div className="pt-2 flex items-center gap-4 text-xs font-mono">
        <Link
          to="/"
          className="px-3.5 py-1.5 rounded text-[#0e1117] bg-[#38bdf8] hover:bg-[#7dd3fc] font-medium transition"
        >
          Return to home
        </Link>
        <Link
          to="/docs"
          className="text-[#8b949e] hover:text-[#f0f6fc] transition underline underline-offset-4"
        >
          Documentation
        </Link>
      </div>
    </div>
  );
}
