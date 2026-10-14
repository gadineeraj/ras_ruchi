// Small helpers safe to import from client components (no data imports).
const SEEN_AS: Record<string, string> = {
  Blind: "a blind",
  "Standard Curtains": "curtains",
  "Combo Curtains": "curtains",
  "Cushion Covers": "a cushion cover",
  "Combo Cushion Covers": "cushion covers",
  "Printed Fabric": "fabric by the metre",
  "Table Runner": "a table runner",
  "Table Cloth": "a tablecloth",
};

/** "a blind", "curtains"… for captions and alt text. */
export function seenAs(productType: string) {
  return SEEN_AS[productType] ?? "cloth";
}
