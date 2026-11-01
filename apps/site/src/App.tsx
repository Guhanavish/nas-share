import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { MotionConfig, motion, AnimatePresence } from "motion/react";
import Lenis from "lenis";
import { Navbar, Footer } from "./components/chrome";
import { ScrollProgressBar } from "./components/chrome/ScrollProgressBar";
import { SectionRail } from "./components/chrome/SectionRail";
import { ToastProvider } from "./components/toast/ToastProvider";
import { initFaviconAnimation } from "./lib/faviconAnimation";
import { setLenis } from "./lib/lenis";
import { usePrefersReducedMotion } from "./lib/usePrefersReducedMotion";
import { Home } from "./pages/Home";
import { useLatestRelease, type ReleaseInfo } from "./lib/site";
import { TOKENS } from "./tokens";

const TransferPage = lazy(() => import("./pages/TransferPage").then((m) => ({ default: m.TransferPage })));
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

function ScrollManager() {
  const { hash } = useLocation();
  const reduced = usePrefersReducedMotion();

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
  }, [hash, reduced]);

  return null;
}

/** Minimal skeleton for lazy loading */
function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 space-y-4" aria-label="Loading page">
      <div className="h-3 w-28 rounded bg-[#1B1D1B]" />
      <div className="h-8 w-2/3 rounded bg-[#1B1D1B]" />
      <div className="h-4 w-1/2 rounded bg-[#1B1D1B]" />
    </div>
  );
}

function AnimatedRoutes({ release }: { release: ReleaseInfo | null }) {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const { duration, ease } = TOKENS.motion;

  useEffect(() => {
    // Item 36: Refresh ScrollTrigger after a route enters (if on home and loaded)
    if (location.pathname === "/") {
      const t = setTimeout(() => {
        import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          ScrollTrigger.refresh();
        }).catch(() => {});
      }, 150);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        window.scrollTo(0, 0);
      }}
    >
      <motion.div
        key={location.pathname}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, transition: { duration: duration.fast } }}
        transition={{ duration: duration.page, ease: ease.standard }}
      >
        <Suspense fallback={<PageSkeleton />}>
          <Routes location={location}>
            <Route path="/" element={<Home release={release} />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/security" element={<Security />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/brand" element={<Brand />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const release = useLatestRelease();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const cleanupFavicon = initFaviconAnimation();
    if (reduced) {
      setLenis(null);
      return cleanupFavicon;
    }

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    setLenis(lenis);

    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
      if (cleanupFavicon) cleanupFavicon();
    };
  }, [reduced]);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <HashRouter>
          <ScrollProgressBar />
          <ScrollManager />
          <SectionRail />
          <Navbar />
          <main className="min-h-screen bg-[#0C0D0C]">
            <AnimatedRoutes release={release} />
          </main>
          <Footer />
        </HashRouter>
      </ToastProvider>
    </MotionConfig>
  );
}
