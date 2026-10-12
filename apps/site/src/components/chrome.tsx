import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HardDrive, Menu, X } from "lucide-react";
import { GITHUB_REPO, releasesPage, useLatestRelease } from "../lib/site";

const links = [
  { to: "/", label: "Home" },
  { to: "/#download", label: "Download" },
  { to: "/docs", label: "Docs" },
  { to: "/changelog", label: "Changelog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const release = useLatestRelease();
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? "border-b border-line bg-ink/85 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-blue-500/30">
            <HardDrive className="h-5 w-5" />
          </span>
          <span className="font-display font-bold">NAS Share</span>
          {release && (
            <span className="rounded-full border border-line bg-card px-2.5 py-0.5 font-mono text-[11px] text-accent">
              {release.tag}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-fog md:flex">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="transition hover:text-snow">
              {l.label}
            </Link>
          ))}
          <Link
            to="/#download"
            className="rounded-xl bg-primary px-4 py-2 font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.4)] transition hover:shadow-[0_0_36px_rgba(59,130,246,0.6)]"
          >
            Get the apps
          </Link>
        </nav>

        <button
          className="rounded-lg p-2 text-fog md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-ink/95 px-5 py-4 backdrop-blur-xl md:hidden">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="block rounded-lg px-2 py-2.5 text-fog hover:bg-card hover:text-snow"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <HardDrive className="h-5 w-5" />
            </span>
            <span className="font-display font-bold">NAS Share</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-fog">
            Every device is both server and client. Pool them into one section,
            pair with a code, and pull files from anywhere. MIT licensed.
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-semibold">Product</p>
          <div className="mt-3 space-y-2 text-sm text-fog">
            <Link to="/#download" className="block hover:text-snow">Download</Link>
            <Link to="/docs" className="block hover:text-snow">Docs</Link>
            <Link to="/changelog" className="block hover:text-snow">Changelog</Link>
          </div>
        </div>
        <div>
          <p className="font-display text-sm font-semibold">Project</p>
          <div className="mt-3 space-y-2 text-sm text-fog">
            <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noreferrer" className="block hover:text-snow">
              GitHub
            </a>
            <a href={releasesPage} target="_blank" rel="noreferrer" className="block hover:text-snow">
              Releases
            </a>
            <span className="block">MIT License</span>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center font-mono text-xs text-fog">
        your devices are the cloud · nas share
      </div>
    </footer>
  );
}
