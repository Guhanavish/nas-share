import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Sun, Moon, RefreshCw, Copy, Check } from "lucide-react";
import { NasendLogo } from "./brand/NasendLogo";
import { GITHUB_REPO } from "../lib/site";
import { TOKENS } from "../tokens";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const loc = useLocation();
  const { duration, ease } = TOKENS.motion;

  useEffect(() => {
    setOpen((prev) => (prev ? false : prev));
  }, [loc.pathname]);

  // Sync theme with document element
  useEffect(() => {
    const saved = localStorage.getItem("nasend-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("nasend-theme", next);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "How it works", href: "how-it-works", isAnchor: true },
    { label: "Security", href: "/security", isAnchor: false },
    { label: "Docs", href: "/docs", isAnchor: false },
    { label: "Brand", href: "/brand", isAnchor: false },
  ];

  return (
    // Item 18: Fade in nav on a short stagger
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.normal, ease: ease.standard, delay: 0.15 }}
      className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#0e1117]/95 backdrop-blur-none"
    >
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <NasendLogo size={18} />
          </Link>

          {/* Item 46: Connection status dot pulsing slowly (1.5s period) */}
          <div
            className="hidden sm:flex items-center gap-2 px-2 py-0.5 rounded border border-[#30363d] bg-[#161b22] text-[10px] font-mono text-[#8b949e]"
            title="Cloudflare Worker Signaling Server: Operational"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75 duration-1000" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38bdf8]" />
            </span>
            <span>Signaling • Edge Active</span>
          </div>
        </div>

        {/* Desktop Navigation with Item 42 Shared Layout Indicator */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-mono">
          {navLinks.map((link) => {
            const isActive = !link.isAnchor && loc.pathname === link.href;

            if (link.isAnchor) {
              return loc.pathname === "/" ? (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="relative py-1 text-[#8b949e] hover:text-[#f0f6fc] transition cursor-pointer"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={`/#${link.href}`}
                  className="relative py-1 text-[#8b949e] hover:text-[#f0f6fc] transition"
                >
                  {link.label}
                </Link>
              );
            }

            return (
              <Link
                key={link.label}
                to={link.href}
                className={`relative py-1 transition ${
                  isActive ? "text-[#f0f6fc] font-semibold" : "text-[#8b949e] hover:text-[#f0f6fc]"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#38bdf8]"
                    transition={{ duration: duration.fast, ease: ease.standard }}
                  />
                )}
              </Link>
            );
          })}

          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 text-[#8b949e] hover:text-[#f0f6fc] transition"
          >
            GitHub
          </a>

          {/* Item 45: Theme toggle button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] hover:bg-[#21262d] transition cursor-pointer"
            aria-label="Toggle color theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Download CTA Button (Item 41 press feedback) */}
          {loc.pathname === "/" ? (
            <button
              onClick={() => scrollTo("download")}
              className="px-3.5 py-1.5 rounded text-xs font-mono font-medium text-[#0e1117] bg-[#38bdf8] hover:bg-[#7dd3fc] active:translate-y-[1px] transition cursor-pointer"
            >
              Download
            </button>
          ) : (
            <Link
              to="/#download"
              className="px-3.5 py-1.5 rounded text-xs font-mono font-medium text-[#0e1117] bg-[#38bdf8] hover:bg-[#7dd3fc] active:translate-y-[1px] transition"
            >
              Download
            </Link>
          )}
        </nav>

        {/* Mobile menu and theme buttons */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d]"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc]"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: duration.fast, ease: ease.standard }}
            className="overflow-hidden md:hidden border-b border-[#30363d] bg-[#161b22] px-6 py-4 flex flex-col gap-3 text-xs font-mono"
          >
            <Link to="/#how-it-works" onClick={() => setOpen(false)} className="text-[#8b949e] py-1">
              How it works
            </Link>
            <Link to="/security" onClick={() => setOpen(false)} className="text-[#8b949e] py-1">
              Security
            </Link>
            <Link to="/docs" onClick={() => setOpen(false)} className="text-[#8b949e] py-1">
              Docs
            </Link>
            <Link to="/brand" onClick={() => setOpen(false)} className="text-[#8b949e] py-1">
              Brand
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8b949e] py-1"
            >
              GitHub
            </a>
            <Link
              to="/#download"
              onClick={() => setOpen(false)}
              className="mt-2 text-center py-2 rounded font-medium text-[#0e1117] bg-[#38bdf8]"
            >
              Download binaries
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// Generate random Crockford Base32 8-rune code
function generatePairingCode(): string {
  const alphabet = TOKENS.brand.crockfordAlphabet;
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export function Footer() {
  const [code, setCode] = useState("K7M2-Q9XD");
  const [copied, setCopied] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);
  const { duration, ease } = TOKENS.motion;

  // Item 47: Generate new code & re-run flip animation
  const handleRegenerate = () => {
    setCode(generatePairingCode());
    setKeyCounter((k) => k + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-[#30363d] bg-[#0e1117] py-16 text-xs text-[#8b949e]">
      <div className="mx-auto max-w-4xl px-6 space-y-12">
        {/* Item 47: Pairing Code signature brand element in footer */}
        <div className="p-6 rounded border border-[#30363d] bg-[#161b22] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#38bdf8]">
                Ephemeral Pairing Anchor
              </span>
              <span className="text-[10px] font-mono text-[#8b949e] bg-[#21262d] px-1.5 py-0.5 rounded border border-[#30363d]">
                TTL: 5m
              </span>
            </div>
            <p className="text-sm font-medium text-[#f0f6fc]">
              Pair any phone, PC, or TV instantly with a single code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Flipping Characters */}
            <div
              key={keyCounter}
              className="flex items-center gap-1 font-mono text-base font-bold text-[#f0f6fc] bg-[#0e1117] px-3.5 py-2 rounded border border-[#30363d]"
            >
              {code.split("").map((char, i) => (
                <motion.span
                  key={`${keyCounter}-${i}`}
                  initial={{ opacity: 0, rotateX: 90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  transition={{
                    duration: duration.fast,
                    ease: ease.standard,
                    delay: i * 0.04,
                  }}
                  className={char === "-" ? "text-[#8b949e] mx-0.5" : "text-[#38bdf8]"}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            <button
              onClick={handleRegenerate}
              className="p-2 rounded bg-[#21262d] border border-[#30363d] hover:text-[#f0f6fc] hover:bg-[#30363d] transition cursor-pointer"
              title="Generate new 8-character pairing code"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#38bdf8]" />
            </button>

            <button
              onClick={handleCopy}
              className="p-2 rounded bg-[#21262d] border border-[#30363d] hover:text-[#f0f6fc] hover:bg-[#30363d] transition cursor-pointer flex items-center gap-1 text-[11px] font-mono"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span className="text-[#38bdf8]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Item 48: Minimal line-art drawing of three devices connected, stroking into view */}
        <div className="py-6 flex flex-col items-center justify-center border-y border-[#30363d]/50">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#8b949e] mb-4">
            Unified Device Cloud • Topology
          </div>
          <svg
            viewBox="0 0 360 80"
            className="w-full max-w-sm h-16 stroke-current text-[#8b949e]"
            fill="none"
          >
            {/* Phone outline on left */}
            <rect x="20" y="15" width="28" height="50" rx="4" strokeWidth="1.5" />
            <circle cx="34" cy="58" r="2" fill="#38bdf8" />

            {/* PC outline in center */}
            <rect x="156" y="15" width="48" height="34" rx="2" strokeWidth="1.5" />
            <line x1="180" y1="49" x2="180" y2="60" strokeWidth="1.5" />
            <line x1="168" y1="60" x2="192" y2="60" strokeWidth="1.5" />

            {/* TV outline on right */}
            <rect x="292" y="16" width="52" height="36" rx="2" strokeWidth="1.5" />
            <line x1="306" y1="58" x2="330" y2="58" strokeWidth="1.5" />

            {/* Connecting paths stroking in on view */}
            <motion.path
              d="M 48 40 L 156 32"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: duration.slow, ease: ease.decelerate }}
            />
            <motion.path
              d="M 204 32 L 292 34"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: duration.slow, ease: ease.decelerate, delay: 0.15 }}
            />
          </svg>
        </div>

        {/* Links & metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NasendLogo size={16} />
            <span className="font-mono text-[11px] text-[#8b949e]">v0.1.0 • MIT License</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#8b949e]">
            <Link to="/security" className="hover:text-[#f0f6fc] transition">
              Security
            </Link>
            <Link to="/docs" className="hover:text-[#f0f6fc] transition">
              Documentation
            </Link>
            <Link to="/brand" className="hover:text-[#f0f6fc] transition">
              Brand Guidelines
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f0f6fc] transition"
            >
              GitHub ↗
            </a>
          </div>
        </div>

        <div className="border-t border-[#30363d]/50 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono">
          <p>
            No user accounts. Zero external file storage. Signaling coordinated via Cloudflare Workers.
          </p>
          <p className="text-[#38bdf8]">Port 8743 • RFC 7233 • DTLS 1.3</p>
        </div>
      </div>
    </footer>
  );
}
