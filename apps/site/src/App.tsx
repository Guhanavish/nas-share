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
      // Delay slightly for elements to mount if route changed
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

/** Skeleton matching Kage subpage layout so lazy loads feel seamless */
function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-5 pt-32 pb-24" aria-label="Loading page">
      <div className="h-4 w-36 rounded bg-card/60" />
      <div className="mt-4 h-12 w-2/3 rounded-xl bg-card/60" />
      <div className="mt-3 h-4 w-1/2 rounded bg-card/40" />
      <div className="mt-10 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="kage-card rounded-2xl p-6">
            <div className="h-5 w-1/3 rounded bg-card/60" />
            <div className="mt-3 h-4 w-full rounded bg-card/40" />
            <div className="mt-2 h-4 w-4/5 rounded bg-card/30" />
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
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
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
