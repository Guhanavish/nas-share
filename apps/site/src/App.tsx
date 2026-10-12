import { useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Navbar, Footer } from "./components/chrome";
import { Home } from "./pages/Home";
import { Docs } from "./pages/Docs";
import { Changelog } from "./pages/Changelog";
import { useAllReleases, useLatestRelease } from "./lib/site";

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

export default function App() {
  const release = useLatestRelease();
  const releases = useAllReleases();

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
        <Routes>
          <Route path="/" element={<Home release={release} />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/changelog" element={<Changelog releases={releases} />} />
          <Route path="*" element={<Home release={release} />} />
        </Routes>
      </main>
      <Footer />
    </HashRouter>
  );
}
