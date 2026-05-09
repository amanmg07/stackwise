/**
 * Parse a free-form cycle duration string into a number of weeks.
 *
 * Handles strings like:
 *   "6-8 weeks"                                 → 8
 *   "16+ weeks"                                 → 16
 *   "12 weeks"                                  → 12
 *   "4-6 weeks (GHK-Cu daily, ...)"             → 6
 *   "2-4 weeks on, 2 weeks off"                 → 4
 *   "ongoing", undefined, ""                    → fallback
 */
export function parseDurationWeeks(source?: string, fallback = 8): number {
  if (!source) return fallback;
  const range = source.match(/(\d+)\s*-\s*(\d+)\s*weeks?/i);
  if (range) return parseInt(range[2], 10);
  const plus = source.match(/(\d+)\s*\+\s*weeks?/i);
  if (plus) return parseInt(plus[1], 10);
  const single = source.match(/(\d+)\s*weeks?/i);
  if (single) return parseInt(single[1], 10);
  return fallback;
}
