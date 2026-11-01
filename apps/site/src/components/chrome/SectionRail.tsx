import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { getLenis } from "../../lib/lenis";
import { TOKENS } from "../../tokens";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

interface SectionItem {
  id: string;
  num: string;
  label: string;
}

const SECTIONS: SectionItem[] = [
  { id: "top", num: "01", label: "Overview" },
  { id: "transfer", num: "02", label: "Transfer" },
  { id: "how-it-works", num: "03", label: "How it works" },
  { id: "product", num: "04", label: "Product" },
  { id: "security", num: "05", label: "Security" },
  { id: "download", num: "06", label: "Download" },
  { id: "faq", num: "07", label: "FAQ" },
];

export function SectionRail() {
  const [activeId, setActiveId] = useState<string>("top");
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const { duration, ease } = TOKENS.motion;

  // Only visible on home page
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isHome]);

  if (!isHome) return null;

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el, { offset: -72 });
    } else {
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }
  };

  return (
    <nav
      aria-label="Page sections"
      className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 font-mono text-[10px] select-none"
    >
      {SECTIONS.map((sec) => {
        const isActive = activeId === sec.id;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => handleScrollTo(sec.id)}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center gap-2.5 py-1 text-left cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#A3B899] rounded"
          >
            {/* Tick line */}
            <motion.span
              animate={{
                width: isActive ? 24 : 10,
                backgroundColor: isActive ? "#A3B899" : "#343934",
              }}
              transition={{ duration: duration.fast, ease: ease.standard }}
              className="h-[1.5px] block rounded-full"
            />

            {/* Number + Label */}
            <span
              className={`transition-colors duration-200 ${
                isActive ? "text-[#F2F3F0] font-semibold" : "text-[#929690] group-hover:text-[#F2F3F0]"
              }`}
            >
              {sec.num}
            </span>

            {/* Expandable Label on Active */}
            {isActive && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: duration.fast, ease: ease.standard }}
                className="text-[#A3B899] font-medium tracking-wider"
              >
                {sec.label}
              </motion.span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
