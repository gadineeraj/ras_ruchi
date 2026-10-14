import type { ReactNode } from "react";

// Rozha One has no kerning, so a capital W or V leaves an open gap before the
// lowercase letter after it ("W eave", "V ase"). This tucks the next letter in.
// Use it wherever display text is set in Rozha One.
export function kern(text: string): ReactNode {
  const parts = text.split(/([WV])(?=[a-z])/);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={`kern-${part.toLowerCase()}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
