import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Navbar, Footer } from "./components/chrome";
import { Home } from "./pages/Home";
import { useLatestRelease } from "./lib/site";

const Docs = lazy(() => import("./pages/Docs").then((m) => ({ default: m.Docs })));
const Changelog = lazy(() =>
  import("./pages/Changelog").then((m) => ({ default: m.Changelog }))
);
const Terms = lazy(() => import("./pages/Terms").then((m) => ({ default: m.Terms })));
const Privacy = lazy(() =>
  import("./pages/Privacy").then((m) => ({ default: m.Privacy }))
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound }))
);

const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

/** Skeleton matching subpage layout so lazy loads never flash blank. */
function PageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-5 pt-32 pb-24" aria-label="Loading page">
      <div className="h-4 w-40 rounded bg-card" />
      <div className="mt-4 h-10 w-3/4 rounded-xl bg-card" />
      <div className="mt-2 h-4 w-1/2 rounded bg-card" />
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-line bg-panel p-6">
            <div className="h-5 w-1/3 rounded bg-card" />
            <div className="mt-3 h-4 w-full rounded bg-card" />
            <div className="mt-2 h-4 w-5/6 rounded bg-card" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const release = useLatestRelease();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <HashRouter>
      <ScrollManager />
      <Navbar />
      <main className="min-h-screen">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home release={release} />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </HashRouter>
  );
}
