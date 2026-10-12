import { Link } from "react-router-dom";
import { MapPinOff, House, BookOpenText } from "lucide-react";
import { useMeta } from "../lib/meta";

export function NotFound() {
  useMeta({
    title: "Page not found | NAS Share",
    description: "This page does not exist or moved. Head home or read the setup docs.",
    path: "/404",
  });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 pt-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-card text-primary">
        <MapPinOff className="h-8 w-8" />
      </span>
      <p className="font-mono mt-6 text-sm text-accent">404</p>
      <h1 className="font-display mt-2 text-4xl font-bold">This page wandered off</h1>
      <p className="mt-3 text-fog">
        It does not exist here, or it moved. The apps and docs are one tap away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white"
        >
          <House className="h-4 w-4" /> Back home
        </Link>
        <Link
          to="/docs"
          className="flex items-center gap-2 rounded-2xl border border-line bg-card px-6 py-3 font-semibold hover:border-primary/60"
        >
          <BookOpenText className="h-4 w-4" /> Read the docs
        </Link>
      </div>
    </div>
  );
}
