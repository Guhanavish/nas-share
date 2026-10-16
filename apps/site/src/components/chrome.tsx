import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HardDrive, Menu, X, ExternalLink, ShieldCheck } from "lucide-react";
import { GITHUB_REPO, releasesPage, useLatestRelease } from "../lib/site";
import { ZenAudioToggle, zenAudioEngine } from "./audio/ZenAudio";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(1);
  const release = useLatestRelease();
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      // Determine active chapter based on scroll position
      const scrollY = window.scrollY;
      const totalH = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const ratio = scrollY / totalH;

      if (ratio < 0.2) setActiveChapter(1);
      else if (ratio < 0.4) setActiveChapter(2);
      else if (ratio < 0.6) setActiveChapter(3);
      else if (ratio < 0.8) setActiveChapter(4);
      else setActiveChapter(5);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  const chapters = [
    { id: "chapter-01", num: "01", kanji: "門", label: "Threshold" },
    { id: "chapter-02", num: "02", kanji: "灯", label: "Peers" },
    { id: "chapter-03", num: "03", kanji: "契", label: "Altar" },
    { id: "chapter-04", num: "04", kanji: "流", label: "Stream" },
    { id: "chapter-05", num: "05", kanji: "蔵", label: "Vault" },
  ];

  const scrollToChapter = (id: string) => {
    if (loc.pathname !== "/") {
      window.location.hash = `#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      zenAudioEngine.playChime(600);
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-ink/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-vermilion text-white shadow-[0_0_20px_rgba(255,59,48,0.4)] transition group-hover:scale-105">
            <HardDrive className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold tracking-tight text-snow">
                Nasend
              </span>
              <span className="font-serif text-xs text-vermilion" title="Kage — Shadow Sovereignty">
                影
              </span>
              {release && (
                <span className="hidden sm:inline-block rounded-full border border-line bg-card/60 px-2 py-0.5 font-mono text-[10px] text-accent">
                  {release.tag}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Chapter Walkthrough Quick Jump (Desktop) */}
        {loc.pathname === "/" && (
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-line bg-card/50 p-1 font-mono text-xs backdrop-blur">
            {chapters.map((c, i) => (
              <button
                key={c.id}
                onClick={() => scrollToChapter(c.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all ${
                  activeChapter === i + 1
                    ? "bg-vermilion text-white shadow-[0_0_12px_rgba(255,59,48,0.5)] font-semibold"
                    : "text-fog hover:text-snow hover:bg-white/5"
                }`}
              >
                <span>{c.num}</span>
                <span className="font-serif text-[11px] opacity-70">{c.kanji}</span>
                <span className="hidden xl:inline">{c.label}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ZenAudioToggle />

          <nav className="hidden md:flex items-center gap-5 text-xs font-mono text-fog">
            <Link to="/docs" className="transition hover:text-snow">
              Docs
            </Link>
            <Link to="/changelog" className="transition hover:text-snow">
              Changelog
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition hover:text-snow"
              title="GitHub Source"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <button
              onClick={() => scrollToChapter("chapter-05")}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-vermilion px-4 font-display font-semibold text-white shadow-[0_0_20px_rgba(255,59,48,0.35)] transition hover:bg-vermilion/90 active:scale-95"
            >
              Get Apps
            </button>
          </nav>

          <button
            className="rounded-lg p-2 text-fog transition hover:text-snow md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Navigation Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-b border-line bg-ink/95 px-5 py-6 backdrop-blur-2xl md:hidden animate-fadeIn">
          <nav className="flex flex-col gap-4 text-sm font-mono text-fog">
            <div className="grid grid-cols-5 gap-1 border-b border-line pb-4 text-center">
              {chapters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    scrollToChapter(c.id);
                    setOpen(false);
                  }}
                  className="rounded-lg border border-line bg-card/60 p-2 text-xs hover:border-vermilion"
                >
                  <p className="font-bold text-snow">{c.num}</p>
                  <p className="font-serif text-[11px] text-vermilion">{c.kanji}</p>
                </button>
              ))}
            </div>

            <Link
              to="/docs"
              onClick={() => setOpen(false)}
              className="py-1 text-snow hover:text-vermilion"
            >
              Architecture & Protocol Docs
            </Link>
            <Link
              to="/changelog"
              onClick={() => setOpen(false)}
              className="py-1 text-snow hover:text-vermilion"
            >
              Release Changelog
            </Link>
            <Link
              to="/terms"
              onClick={() => setOpen(false)}
              className="py-1 text-snow hover:text-vermilion"
            >
              Sovereignty Terms
            </Link>
            <Link
              to="/privacy"
              onClick={() => setOpen(false)}
              className="py-1 text-snow hover:text-vermilion"
            >
              Privacy Manifesto
            </Link>
            <button
              onClick={() => {
                scrollToChapter("chapter-05");
                setOpen(false);
              }}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-vermilion text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,59,48,0.4)]"
            >
              Download Windows & Android Apps
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-panel/80 px-5 pt-16 pb-12 text-xs text-fog backdrop-blur-xl">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Col 1: Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-vermilion text-white">
                <HardDrive className="h-4 w-4" />
              </span>
              <span className="font-display text-base font-bold text-snow">Nasend // 影</span>
              <span className="rounded-md border border-line bg-ink px-2 py-0.5 font-mono text-[10px] text-accent">
                Device Cloud
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-fog">
              A private device-as-NAS ecosystem built with Rust, Jetpack Compose,
              and Cloudflare Workers. Your data remains in your living room, protected
              by modern cryptography, zero subscription rent.
            </p>
            <div className="flex items-center gap-2 text-accent font-mono text-[11px] pt-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Zero telemetry • Zero third-party trackers • 100% Open Protocol</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-snow font-semibold">
              Ecosystem
            </span>
            <ul className="mt-3 space-y-2 font-mono text-xs">
              <li>
                <Link to="/docs" className="hover:text-snow transition">
                  Protocol Specifications
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="hover:text-snow transition">
                  Releases & Changelog
                </Link>
              </li>
              <li>
                <a
                  href={releasesPage}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-snow transition"
                >
                  <span>GitHub Releases</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href={`https://github.com/${GITHUB_REPO}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-snow transition"
                >
                  <span>Source Repository</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Sovereignty */}
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-snow font-semibold">
              Sovereignty
            </span>
            <ul className="mt-3 space-y-2 font-mono text-xs">
              <li>
                <Link to="/privacy" className="hover:text-snow transition">
                  Privacy Manifesto
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-snow transition">
                  Terms of Sovereignty
                </Link>
              </li>
              <li>
                <span className="text-fog/70">License: MIT Protocol</span>
              </li>
              <li>
                <span className="text-fog/70">Signaling: Hono + Cloudflare DO</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-line/50 pt-6 font-mono text-[11px] text-fog/70 gap-3">
          <p>© {new Date().getFullYear()} Nasend Ecosystem. Inspired by the Kage 影 aesthetic.</p>
          <p className="text-center sm:text-right">
            Phone ↔ TV ↔ PC • LAN Direct & WebRTC DTLS WAN
          </p>
        </div>
      </div>
    </footer>
  );
}
