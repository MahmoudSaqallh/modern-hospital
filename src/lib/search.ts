/**
 * Normalize text for forgiving search: Arabic letter variants (أ/إ/آ → ا,
 * ة → ه, ى → ي), diacritics and tatweel removed, Latin lower-cased.
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/^ال/, "")
    .toLowerCase()
    .trim();
}

export function matchesQuery(query: string, ...fields: string[]): boolean {
  const q = normalizeForSearch(query);
  if (!q) return true;
  const terms = q.split(/\s+/).map((t) => t.replace(/^ال/, ""));
  const haystack = fields.map(normalizeForSearch).join(" ");
  return terms.every((term) => haystack.includes(term));
}
