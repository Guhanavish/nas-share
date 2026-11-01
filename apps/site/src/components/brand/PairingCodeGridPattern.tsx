/**
 * Quiet Brand Pattern derived from the Crockford Base32 Character Grid
 * Used strictly as low-contrast architectural background texture (Item 4).
 */
export function PairingCodeGridPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-[0.025]"
      aria-hidden="true"
    >
      <div className="font-mono text-[10px] tracking-[0.5em] leading-[2.5em] text-[#f0f6fc] break-all whitespace-normal">
        {Array.from({ length: 48 }).map((_, i) => (
          <p key={i}>
            23456789ABCDEFGHJKMNPQRSTVWXYZ K7M2-Q9XD 8743 DTLS ED25519 23456789ABCDEFGHJKMNPQRSTVWXYZ
          </p>
        ))}
      </div>
    </div>
  );
}
