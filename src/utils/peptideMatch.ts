import { Peptide } from "../types";

/**
 * Synonym-aware compound matcher (architecture-spec gap #3).
 *
 * Replaces the old naive `text.includes(name.toLowerCase())` checks
 * that were scattered across chat code. Those missed every spacing /
 * punctuation variant ("BPC-157" vs "bpc 157" vs "bpc157") and every
 * brand / full-chemical name — which is why analytics' peptide_ids_
 * queried was coming back empty in production.
 *
 * The chat query text never leaves the device (privacy posture — see
 * migration 021), so this resolution MUST run client-side, before the
 * event is sent. That's why this is a TS util, not a server table.
 *
 * Matching strategy per candidate string (name / abbreviation / alias):
 *  - compact form (alphanumerics only, lowercased): "BPC-157",
 *    "bpc 157", "bpc157" all collapse to "bpc157". For candidates
 *    >= 4 compact chars we do a substring test on the compacted text
 *    — robust to any separator the user typed.
 *  - short candidates (< 4 compact chars, e.g. "KPV", "AOD", "BPC")
 *    would false-positive as raw substrings ("kp" inside "workplace"),
 *    so they require a whole-word match on the separator-normalized
 *    text instead.
 */

/** Lowercase, strip everything that isn't a letter or digit. */
export function normalizeCompact(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Lowercase, collapse non-alphanumerics to single spaces, pad ends. */
function normalizeSpaced(s: string): string {
  return ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
}

const MIN_COMPACT_LEN = 4;

/**
 * Return the de-duplicated canonical ids of every compound referenced
 * anywhere in `text`. Order follows `dataset`.
 */
export function extractPeptideIds(text: string, dataset: Peptide[]): string[] {
  if (!text) return [];
  const textCompact = normalizeCompact(text);
  const textSpaced = normalizeSpaced(text);

  const ids: string[] = [];
  for (const p of dataset) {
    const candidates = [p.name, p.abbreviation, ...(p.aliases ?? [])].filter(
      Boolean
    ) as string[];

    const hit = candidates.some((c) => {
      const compact = normalizeCompact(c);
      if (compact.length === 0) return false;
      if (compact.length >= MIN_COMPACT_LEN) {
        return textCompact.includes(compact);
      }
      // Short token: require a whole-word match.
      const spaced = normalizeSpaced(c).trim();
      return spaced.length > 0 && textSpaced.includes(` ${spaced} `);
    });

    if (hit && !ids.includes(p.id)) ids.push(p.id);
  }
  return ids;
}

/**
 * Does `query` (a user-typed search string) match this compound?
 *
 * For search-as-you-type filter boxes — deliberately permissive,
 * unlike extractPeptideIds (which guards against false positives in
 * free-flowing prose). A partial, separator-insensitive substring
 * against name / abbreviation / aliases: typing "bpc 157", "ozemp",
 * or "body protection" all surface the right compound. Empty query
 * matches everything (i.e. no filtering).
 */
export function matchesQuery(p: Peptide, query: string): boolean {
  const q = normalizeCompact(query);
  if (!q) return true;
  const candidates = [p.name, p.abbreviation, ...(p.aliases ?? [])].filter(
    Boolean
  ) as string[];
  return candidates.some((c) => normalizeCompact(c).includes(q));
}
