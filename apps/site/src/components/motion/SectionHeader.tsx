import { Reveal } from "./Reveal";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  id?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`space-y-3 text-left ${className}`}>
      <Reveal delay={0}>
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#929690]">
          {eyebrow}
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F3F0]">
          {title}
        </h2>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="text-sm sm:text-base text-[#929690] leading-relaxed max-w-xl font-sans">
          {description}
        </p>
      </Reveal>
    </div>
  );
}
