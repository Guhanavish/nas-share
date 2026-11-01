import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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

function AnimatedRoutes({
  release,
  releaseStatus,
}: {
  release: ReleaseInfo | null;
  releaseStatus: "loading" | "ok" | "none" | "error";
}) {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const { duration, ease } = TOKENS.motion;

  useEffect(() => {
    // Refresh ScrollTrigger after route enters (if on home and loaded)
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
            <Route path="/" element={<Home release={release} releaseStatus={releaseStatus} />} />
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
  const { status: releaseStatus, release } = useLatestRelease();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const cleanupFavicon = initFaviconAnimation();
    if (reduced) {
      setLenis(null);
      return cleanupFavicon;
    }

    let raf = 0;
    let lenisInstance: Lenis | null = null;

    const startLenis = () => {
      lenisInstance = new Lenis({ lerp: 0.1, smoothWheel: true });
      setLenis(lenisInstance);

      const loop = (t: number) => {
        lenisInstance?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    // Lazy initialize Lenis after first paint (T15.2)
    if ("requestIdleCallback" in window) {
      const idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(startLenis, { timeout: 1500 });
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
        }
        cancelAnimationFrame(raf);
        lenisInstance?.destroy();
        setLenis(null);
        if (cleanupFavicon) cleanupFavicon();
      };
    } else {
      const timer = setTimeout(startLenis, 150);
      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(raf);
        lenisInstance?.destroy();
        setLenis(null);
        if (cleanupFavicon) cleanupFavicon();
      };
    }
  }, [reduced]);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        {/* Skip to content link for accessibility (T10.6) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#A3B899] focus:text-[#0C0D0C] focus:font-mono focus:text-xs focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[#F2F3F0]"
        >
          Skip to main content
        </a>

        <BrowserRouter>
          <ScrollProgressBar />
          <ScrollManager />
          <SectionRail />
          <Navbar />
          <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#0C0D0C] outline-none">
            <AnimatedRoutes release={release} releaseStatus={releaseStatus} />
          </main>
          <Footer />
        </BrowserRouter>
      </ToastProvider>
    </MotionConfig>
  );
}
