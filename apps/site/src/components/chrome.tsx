import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from "motion/react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { NasendLogo } from "./brand/NasendLogo";
import { FlippingPairingCode } from "./hero/FlippingPairingCode";
import { GITHUB_REPO } from "../lib/site";
import { TOKENS } from "../tokens";
import { getLenis } from "../lib/lenis";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";
import { hasIntroPlayed } from "../lib/intro";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [hidden, setHidden] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const lastScrollY = useRef(0);

  const loc = useLocation();
  const reduced = usePrefersReducedMotion();
  const introPlayed = hasIntroPlayed();
  const { duration, ease } = TOKENS.motion;

  // Item 13: Nav bottom border opacity maps scrollY 0->48px to 0->1
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 48], [0, 1]);

  // Item 12: Direction detection with 8px threshold
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (reduced) return;
    const diff = latest - lastScrollY.current;

    if (latest <= 120 || hasFocus || open) {
      setHidden(false);
    } else if (diff > 8) {
      // scrolling down
      setHidden(true);
    } else if (diff < -8) {
      // scrolling up
      setHidden(false);
    }
    lastScrollY.current = latest;
  });

  useEffect(() => {
    setOpen(false);
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
    if (!el) return;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el, { offset: -72 });
    } else {
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
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
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setHasFocus(false);
        }
      }}
      initial={reduced || introPlayed ? false : { opacity: 0, y: -6 }}
      animate={{
        opacity: 1,
        y: hidden ? "-100%" : 0,
      }}
      transition={{ duration: 0.28, ease: ease.standard }}
      className="sticky top-0 z-50 w-full bg-[#0C0D0C]"
    >
      {/* Dynamic bottom border fading in on scroll (Item 13) */}
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute bottom-0 inset-x-0 h-[1px] bg-[#343934] pointer-events-none"
      />

      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <NasendLogo size={22} />
          </Link>

          {/* Signaling Connection Status Dot (Item 40: loop pauses when hidden or reduced) */}
          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#343934] bg-[#1B1D1B] text-[10px] font-mono text-[#929690]"
            title="Cloudflare Worker Signaling Server: Operational"
          >
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3B899] opacity-75 duration-1000" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A3B899]" />
            </span>
            <span>Signaling • Edge Operational</span>
          </div>
        </div>

        {/* Desktop Navigation (Item 11: 1px sage underline with layoutId="nav-indicator") */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
          {navLinks.map((link) => {
            const isActive = !link.isAnchor && loc.pathname === link.href;

            if (link.isAnchor) {
              return loc.pathname === "/" ? (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className="relative py-1 text-[#929690] hover:text-[#F2F3F0] transition cursor-pointer link-underline"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={`/#${link.href}`}
                  className="relative py-1 text-[#929690] hover:text-[#F2F3F0] transition link-underline"
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
                  isActive ? "text-[#F2F3F0] font-semibold" : "text-[#929690] hover:text-[#F2F3F0] link-underline"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-[2px] left-0 right-0 h-[1.5px] bg-[#A3B899]"
                    transition={TOKENS.motion.ease.spring}
                  />
                )}
              </Link>
            );
          })}

          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 text-[#929690] hover:text-[#F2F3F0] transition link-underline"
          >
            GitHub
          </a>

          {/* Theme toggle button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[#929690] hover:text-[#F2F3F0] border border-[#343934] hover:bg-[#252825] active:translate-y-px transition cursor-pointer"
            aria-label="Toggle color theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Send / Receive Primary CTA */}
          {loc.pathname === "/" ? (
            <button
              type="button"
              onClick={() => scrollTo("transfer")}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-[#0C0D0C] bg-[#A3B899] hover:bg-[#B5C8AC] active:translate-y-px transition cursor-pointer"
            >
              Transfer Files
            </button>
          ) : (
            <Link
              to="/#transfer"
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-[#0C0D0C] bg-[#A3B899] hover:bg-[#B5C8AC] active:translate-y-px transition"
            >
              Transfer Files
            </Link>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#929690] hover:text-[#F2F3F0] border border-[#343934] active:translate-y-px"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-2 text-[#929690] hover:text-[#F2F3F0] active:translate-y-px"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Item 11: simple text color, no layoutId indicator) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: duration.fast, ease: ease.standard }}
            className="overflow-hidden md:hidden border-b border-[#343934] bg-[#1B1D1B] px-6 py-4 flex flex-col gap-3 text-xs font-mono"
          >
            <Link to="/#transfer" onClick={() => setOpen(false)} className="text-[#929690] hover:text-[#F2F3F0] py-1">
              Transfer Workspace
            </Link>
            <Link to="/#how-it-works" onClick={() => setOpen(false)} className="text-[#929690] hover:text-[#F2F3F0] py-1">
              How it works
            </Link>
            <Link
              to="/security"
              onClick={() => setOpen(false)}
              className={loc.pathname === "/security" ? "text-[#A3B899] font-medium py-1" : "text-[#929690] hover:text-[#F2F3F0] py-1"}
            >
              Security Architecture
            </Link>
            <Link
              to="/docs"
              onClick={() => setOpen(false)}
              className={loc.pathname === "/docs" ? "text-[#A3B899] font-medium py-1" : "text-[#929690] hover:text-[#F2F3F0] py-1"}
            >
              Documentation
            </Link>
            <Link
              to="/brand"
              onClick={() => setOpen(false)}
              className={loc.pathname === "/brand" ? "text-[#A3B899] font-medium py-1" : "text-[#929690] hover:text-[#F2F3F0] py-1"}
            >
              Brand Assets
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#929690] hover:text-[#F2F3F0] py-1"
            >
              GitHub ↗
            </a>
            <Link
              to="/#transfer"
              onClick={() => setOpen(false)}
              className="mt-2 text-center py-2.5 rounded-xl font-medium text-[#0C0D0C] bg-[#A3B899] active:translate-y-px"
            >
              Launch Transfer
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export function Footer() {
  const reduced = usePrefersReducedMotion();
  const { ease } = TOKENS.motion;

  return (
    <footer className="border-t border-[#343934] bg-[#0C0D0C] py-16 text-xs text-[#929690]">
      <div className="mx-auto max-w-5xl px-6 space-y-12">
        {/* Item 35: Pairing Code signature brand element in footer with FlippingPairingCode */}
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

          <FlippingPairingCode showNewCodeButton={true} />
        </div>

        {/* Item 35: Minimal 3-node line schematic scaled down, drawing on view */}
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

            {/* Connecting paths stroking in on view (Item 35: 0.8s pathLength, staggered 150ms) */}
            <motion.path
              d="M 48 40 L 156 32"
              stroke="#A3B899"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: ease.decelerate }}
            />
            <motion.path
              d="M 204 32 L 292 34"
              stroke="#A3B899"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15, ease: ease.decelerate }}
            />
          </svg>
        </div>

        {/* Links & metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NasendLogo size={18} animateOnMount={false} />
            <span className="font-mono text-[11px] text-[#929690]">v0.1.0 • MIT License</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#929690]">
            <Link to="/security" className="hover:text-[#F2F3F0] transition link-underline">
              Security
            </Link>
            <Link to="/docs" className="hover:text-[#F2F3F0] transition link-underline">
              Documentation
            </Link>
            <Link to="/brand" className="hover:text-[#F2F3F0] transition link-underline">
              Brand Assets
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F2F3F0] transition link-underline"
            >
              GitHub ↗
            </a>
          </div>
        </div>

        <div className="border-t border-[#343934]/60 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono">
          <p>
            No user accounts. Zero external file storage. Signaling coordinated via Cloudflare Workers.
          </p>
          <p className="text-[#A3B899]">Port 8743 • DTLS • Local-First</p>
        </div>
      </div>
    </footer>
  );
}
