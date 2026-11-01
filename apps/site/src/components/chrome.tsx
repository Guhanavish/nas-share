import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { NasendLogo } from "./brand/NasendLogo";
import { GITHUB_REPO } from "../lib/site";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    setOpen((prev) => (prev ? false : prev));
  }, [loc.pathname]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#0e1117]">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <NasendLogo size={18} />
        </Link>

        {/* Desktop Navigation: Exactly 4 links and 1 button (Step 3) */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {loc.pathname === "/" ? (
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-[#8b949e] hover:text-[#f0f6fc] transition cursor-pointer"
            >
              How it works
            </button>
          ) : (
            <Link
              to="/#how-it-works"
              className="text-[#8b949e] hover:text-[#f0f6fc] transition"
            >
              How it works
            </Link>
          )}

          <Link
            to="/security"
            className={`transition ${
              loc.pathname === "/security" ? "text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
          >
            Security
          </Link>

          <Link
            to="/docs"
            className={`transition ${
              loc.pathname === "/docs" ? "text-[#f0f6fc]" : "text-[#8b949e] hover:text-[#f0f6fc]"
            }`}
          >
            Docs
          </Link>

          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8b949e] hover:text-[#f0f6fc] transition"
          >
            GitHub
          </a>

          {loc.pathname === "/" ? (
            <button
              onClick={() => scrollTo("download")}
              className="ml-2 px-3 py-1.5 rounded text-xs font-medium text-[#0e1117] bg-[#38bdf8] hover:bg-[#7dd3fc] transition cursor-pointer"
            >
              Download
            </button>
          ) : (
            <Link
              to="/#download"
              className="ml-2 px-3 py-1.5 rounded text-xs font-medium text-[#0e1117] bg-[#38bdf8] hover:bg-[#7dd3fc] transition"
            >
              Download
            </Link>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-1.5 text-[#8b949e] hover:text-[#f0f6fc]"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-b border-[#30363d] bg-[#161b22] px-6 py-4 flex flex-col gap-3 text-sm">
          <Link to="/#how-it-works" className="text-[#8b949e] py-1">
            How it works
          </Link>
          <Link to="/security" className="text-[#8b949e] py-1">
            Security
          </Link>
          <Link to="/docs" className="text-[#8b949e] py-1">
            Docs
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
            className="mt-2 text-center py-2 rounded text-xs font-medium text-[#0e1117] bg-[#38bdf8]"
          >
            Download
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#30363d] bg-[#0e1117] py-12 text-xs text-[#8b949e]">
      <div className="mx-auto max-w-4xl px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NasendLogo size={16} />
            <span className="font-mono text-[11px] text-[#8b949e]">v0.1.0</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[#8b949e]">
            <Link to="/security" className="hover:text-[#f0f6fc] transition">
              Security
            </Link>
            <Link to="/docs" className="hover:text-[#f0f6fc] transition">
              Docs
            </Link>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f0f6fc] transition"
            >
              GitHub (MIT License)
            </a>
            <a
              href="https://www.cloudflarestatus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f0f6fc] transition"
            >
              Cloudflare Status
            </a>
          </div>
        </div>

        <div className="border-t border-[#30363d]/50 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
          <p>
            No user accounts. No centralized file storage. Signaling handled ephemerally by Cloudflare Workers.
          </p>
          <p className="font-mono">Port 8743 • DTLS 1.3 • Ed25519</p>
        </div>
      </div>
    </footer>
  );
}
