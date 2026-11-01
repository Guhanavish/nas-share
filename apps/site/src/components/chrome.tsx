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
    { label: "Transfer", href: "transfer", isAnchor: true },
    { label: "How it works", href: "how-it-works", isAnchor: true },
    { label: "Security", href: "/security", isAnchor: false },
    { label: "Docs", href: "/docs", isAnchor: false },
    { label: "Brand", href: "/brand", isAnchor: false },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.normal, ease: ease.standard, delay: 0.1 }}
      className="sticky top-0 z-50 w-full border-b border-[#343934] bg-[#0C0D0C]/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <NasendLogo size={22} />
          </Link>

          {/* Signaling Connection Status Dot (Item 46: 1.5s slow pulse) */}
          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[10px] font-mono text-[#929690]"
            title="Cloudflare Worker Signaling Server: Operational"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3B899] opacity-75 duration-1000" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A3B899]" />
            </span>
            <span>Signaling • Edge Operational</span>
          </div>
        </div>

        {/* Desktop Navigation with Sage Accent Shared Layout Indicator */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
          {navLinks.map((link) => {
            const isActive = !link.isAnchor && loc.pathname === link.href;

            if (link.isAnchor) {
              return loc.pathname === "/" ? (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="relative py-1 text-[#929690] hover:text-[#F2F3F0] transition cursor-pointer"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={`/#${link.href}`}
                  className="relative py-1 text-[#929690] hover:text-[#F2F3F0] transition"
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
                  isActive ? "text-[#F2F3F0] font-semibold" : "text-[#929690] hover:text-[#F2F3F0]"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#A3B899]"
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
            className="py-1 text-[#929690] hover:text-[#F2F3F0] transition"
          >
            GitHub
          </a>

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[#929690] hover:text-[#F2F3F0] border border-[#343934] hover:bg-[#252825] transition cursor-pointer"
            aria-label="Toggle color theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Send / Receive Primary CTA */}
          {loc.pathname === "/" ? (
            <button
              onClick={() => scrollTo("transfer")}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-[#0C0D0C] bg-[#A3B899] hover:bg-[#B5C8AC] active:translate-y-[1px] transition cursor-pointer shadow-sm"
            >
              Transfer Files
            </button>
          ) : (
            <Link
              to="/#transfer"
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-[#0C0D0C] bg-[#A3B899] hover:bg-[#B5C8AC] active:translate-y-[1px] transition shadow-sm"
            >
              Transfer Files
            </Link>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#929690] hover:text-[#F2F3F0] border border-[#343934]"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-[#929690] hover:text-[#F2F3F0]"
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
            className="overflow-hidden md:hidden border-b border-[#343934] bg-[#1B1D1B] px-6 py-4 flex flex-col gap-3 text-xs font-mono"
          >
            <Link to="/#transfer" onClick={() => setOpen(false)} className="text-[#929690] py-1">
              Transfer Workspace
            </Link>
            <Link to="/#how-it-works" onClick={() => setOpen(false)} className="text-[#929690] py-1">
              How it works
            </Link>
            <Link to="/security" onClick={() => setOpen(false)} className="text-[#929690] py-1">
              Security Architecture
            </Link>
            <Link to="/docs" onClick={() => setOpen(false)} className="text-[#929690] py-1">
              Documentation
            </Link>
            <Link to="/brand" onClick={() => setOpen(false)} className="text-[#929690] py-1">
              Brand Assets
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#929690] py-1"
            >
              GitHub ↗
            </a>
            <Link
              to="/#transfer"
              onClick={() => setOpen(false)}
              className="mt-2 text-center py-2.5 rounded-xl font-medium text-[#0C0D0C] bg-[#A3B899]"
            >
              Launch Transfer
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

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
    <footer className="border-t border-[#343934] bg-[#0C0D0C] py-16 text-xs text-[#929690]">
      <div className="mx-auto max-w-5xl px-6 space-y-12">
        {/* Pairing Code signature brand element in footer */}
        <div className="p-6 rounded-xl border border-[#343934] bg-[#1B1D1B] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#A3B899]">
                Ephemeral Pairing Anchor
              </span>
              <span className="text-[10px] font-mono text-[#929690] bg-[#252825] px-2 py-0.5 rounded border border-[#343934]">
                TTL: 5m
              </span>
            </div>
            <p className="font-display text-sm font-medium text-[#F2F3F0]">
              Pair any phone, PC, or TV instantly with a single code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Flipping Characters */}
            <div
              key={keyCounter}
              className="flex items-center gap-1 font-mono text-base font-bold text-[#F2F3F0] bg-[#0C0D0C] px-3.5 py-2 rounded-lg border border-[#343934]"
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
                  className={char === "-" ? "text-[#929690] mx-0.5" : "text-[#A3B899]"}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            <button
              onClick={handleRegenerate}
              className="p-2 rounded-lg bg-[#252825] border border-[#343934] hover:text-[#F2F3F0] hover:bg-[#343934] transition cursor-pointer"
              title="Generate new pairing code"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#A3B899]" />
            </button>

            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-[#252825] border border-[#343934] hover:text-[#F2F3F0] hover:bg-[#343934] transition cursor-pointer flex items-center gap-1.5 text-[11px] font-mono"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#A3B899]" />
                  <span className="text-[#A3B899]">Copied</span>
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

        {/* Minimal line-art drawing of three devices connected */}
        <div className="py-6 flex flex-col items-center justify-center border-y border-[#343934]/60">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#929690] mb-4">
            Unified Device Cloud • Direct Topology
          </div>
          <svg
            viewBox="0 0 360 80"
            className="w-full max-w-sm h-16 stroke-current text-[#929690]"
            fill="none"
          >
            {/* Phone outline on left */}
            <rect x="20" y="15" width="28" height="50" rx="4" strokeWidth="1.5" />
            <circle cx="34" cy="58" r="2" fill="#A3B899" />

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
              stroke="#A3B899"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: duration.reveal, ease: ease.decelerate }}
            />
            <motion.path
              d="M 204 32 L 292 34"
              stroke="#A3B899"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: duration.reveal, ease: ease.decelerate, delay: 0.15 }}
            />
          </svg>
        </div>

        {/* Links & metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NasendLogo size={18} />
            <span className="font-mono text-[11px] text-[#929690]">v0.1.0 • MIT License</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#929690]">
            <Link to="/security" className="hover:text-[#F2F3F0] transition">
              Security
            </Link>
            <Link to="/docs" className="hover:text-[#F2F3F0] transition">
              Documentation
            </Link>
            <Link to="/brand" className="hover:text-[#F2F3F0] transition">
              Brand Assets
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F2F3F0] transition"
            >
              GitHub ↗
            </a>
          </div>
        </div>

        <div className="border-t border-[#343934]/60 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono">
          <p>
            No user accounts. Zero external file storage. Signaling coordinated via Cloudflare Workers.
          </p>
          <p className="text-[#A3B899]">Port 8743 • RFC 7233 • DTLS 1.3</p>
        </div>
      </div>
    </footer>
  );
}
