import { Link } from "react-router-dom";
import { Compass, House, BookOpenText, ArrowRight } from "lucide-react";
import { useMeta } from "../lib/meta";

export function NotFound() {
  useMeta({
    title: "Path Lost in Mist | 影 KAGE — Nasend",
    description: "The requested route does not exist in the sovereign mesh. Return to the threshold.",
    path: "/404",
  });

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-5 pt-28 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-vermilion/30 bg-vermilion/10 text-vermilion">
        <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: "16s" }} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-vermilion font-mono text-[9px] font-bold text-ink">
          迷
        </span>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span className="font-mono text-xs tracking-[0.3em] text-vermilion">
          404 // 虚境 UNCHARTED PATH
        </span>
      </div>

      <h1 className="font-display mt-3 text-4xl font-black text-snow sm:text-5xl">
        Wandered Beyond the Torii
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-fog">
        This route does not exist within the shadow mesh, or has dematerialized.
        The peer nodes and sacred archives remain open.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-vermilion px-6 py-3 font-mono text-xs font-bold text-ink shadow-[0_0_25px_rgba(255,59,48,0.4)] transition hover:bg-vermilion/90 hover:scale-[1.02]"
        >
          <House className="h-4 w-4" />
          <span>Return to Threshold</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 rounded-2xl border border-line bg-card/60 px-6 py-3 font-mono text-xs font-semibold text-snow hover:border-vermilion/40 hover:bg-card"
        >
          <BookOpenText className="h-4 w-4" />
          <span>Inspect Protocol Docs</span>
        </Link>
      </div>
    </div>
  );
}
