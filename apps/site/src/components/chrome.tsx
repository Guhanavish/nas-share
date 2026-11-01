import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ExternalLink, BookOpen } from "lucide-react";
import { NasendLogo } from "./brand/NasendLogo";
import { GITHUB_REPO } from "../lib/site";
import { ZenAudioToggle, zenAudioEngine } from "./audio/ZenAudio";
import { ThemePresetToggle } from "./theme/ThemePresetToggle";

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple scroll spy
      const sections = ["hero", "constellation", "pairing", "streaming", "vault", "faq"];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(s);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  const navLinks = [
    { id: "how-it-works", label: "How It Works" },
    { id: "features", label: "Features" },
    { id: "pairing", label: "Pairing" },
    { id: "security", label: "Security" },
    { id: "vault", label: "Downloads" },
    { id: "faq", label: "FAQ" },
  ];

  const scrollTo = (id: string) => {
    if (loc.pathname !== "/") {
      navigate(`/#${id}`);
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
          ? "border-b border-white/10 bg-ink/75 backdrop-blur-2xl shadow-lg shadow-black/40"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5">
        {/* Brand Logo with Nasend Monogram */}
        <Link to="/" className="flex items-center gap-3 group">
          <NasendLogo size={36} withText={true} />
        </Link>

        {/* Desktop Quick Nav Anchors */}
        {loc.pathname === "/" && (
          <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  activeSection === link.id
                    ? "bg-cyan-mesh/15 text-cyan-mesh font-semibold border border-cyan-mesh/30"
                    : "text-fog hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right Actions: Audio, Theme, Docs, GitHub */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemePresetToggle />
          <ZenAudioToggle />

          <Link
            to="/docs"
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-snow flex items-center gap-1.5 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-mesh" />
            <span>Docs</span>
          </Link>

          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-snow hover:text-cyan-mesh transition"
            aria-label="GitHub Repository"
          >
            <GitHubIcon />
          </a>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ZenAudioToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.05] text-snow"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="md:hidden border-b border-white/10 bg-ink/95 backdrop-blur-2xl px-5 py-6 space-y-4 animate-fade-in">
          {loc.pathname === "/" && (
            <div className="flex flex-col gap-2 pb-4 border-b border-white/10">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    scrollTo(link.id);
                    setOpen(false);
                  }}
                  className="text-left py-2 px-3 rounded-lg text-sm font-mono text-snow hover:bg-white/5"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm font-mono">
            <Link to="/docs" className="py-2 px-3 rounded-lg text-snow hover:bg-white/5">
              Documentation &amp; Protocol
            </Link>
            <Link to="/changelog" className="py-2 px-3 rounded-lg text-snow hover:bg-white/5">
              Releases &amp; Changelog
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-lg text-cyan-mesh hover:bg-white/5 flex items-center justify-between"
            >
              <span>GitHub Source Code</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink/90 backdrop-blur-xl py-16 px-5">
      <div className="mx-auto max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-8 text-xs font-mono text-fog">
        <div className="flex flex-col items-center md:items-start gap-2">
          <NasendLogo size={28} withText={true} />
          <p className="text-fog/70 mt-1 max-w-sm text-center md:text-left">
            Sovereign device-as-NAS ecosystem. Zero cloud rent, zero tracking, total cryptographic privacy.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link to="/docs" className="hover:text-white transition">
            Docs
          </Link>
          <Link to="/changelog" className="hover:text-white transition">
            Changelog
          </Link>
          <Link to="/terms" className="hover:text-white transition">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-white transition">
            Privacy
          </Link>
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-mesh transition"
          >
            GitHub
          </a>
        </div>

        <div className="text-center md:text-right space-y-1">
          <p className="text-snow">MIT License • Built by Guhanavish</p>
          <p className="text-fog/50">Production Verified Device Mesh</p>
        </div>
      </div>
    </footer>
  );
}
