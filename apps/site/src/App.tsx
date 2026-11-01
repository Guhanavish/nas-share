import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Navbar, Footer } from "./components/chrome";
import { ScrollProgressBar } from "./components/chrome/ScrollProgressBar";
import { initFaviconAnimation } from "./lib/faviconAnimation";
import { Home } from "./pages/Home";
import { useLatestRelease } from "./lib/site";

const Docs = lazy(() => import("./pages/Docs").then((m) => ({ default: m.Docs })));
const Security = lazy(() => import("./pages/Security").then((m) => ({ default: m.Security })));
const Brand = lazy(() => import("./pages/Brand").then((m) => ({ default: m.Brand })));
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

/** Minimal skeleton for lazy loading */
function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 space-y-4" aria-label="Loading page">
      <div className="h-3 w-28 rounded bg-[#161b22]" />
      <div className="h-8 w-2/3 rounded bg-[#161b22]" />
      <div className="h-4 w-1/2 rounded bg-[#161b22]" />
    </div>
  );
}

export default function App() {
  const release = useLatestRelease();

  useEffect(() => {
    const cleanupFavicon = initFaviconAnimation();
    if (reduced) return cleanupFavicon;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      if (cleanupFavicon) cleanupFavicon();
    };
  }, []);

  return (
    <HashRouter>
      <ScrollProgressBar />
      <ScrollManager />
      <Navbar />
      <main className="min-h-screen bg-[#0e1117]">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home release={release} />} />
            <Route path="/security" element={<Security />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/brand" element={<Brand />} />
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
