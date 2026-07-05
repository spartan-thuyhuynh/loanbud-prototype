import type { Contact, FilterRule, Listing, Segment } from "../types";

// ── Segment / listing helpers ─────────────────────────────────────────────────

const LISTING_FIELDS = new Set<FilterRule["field"]>(["listingStatus", "listingName"]);

/** Pure boolean chain evaluator — mirrors the original matchContact logic. */
export function evaluateFilterChain(filters: FilterRule[], record: Record<string, string>): boolean {
  if (filters.length === 0) return true;
  const evalOne = (f: FilterRule): boolean => {
    const val = record[f.field] ?? "";
    if (f.operator === "=") return val === f.value;
    if (f.operator === "!=") return val !== f.value;
    if (f.operator === "contains") return val.toLowerCase().includes(f.value.toLowerCase());
    if (f.operator === "not_contains") return !val.toLowerCase().includes(f.value.toLowerCase());
    return false;
  };
  let result = evalOne(filters[0]);
  for (let i = 1; i < filters.length; i++) {
    const next = evalOne(filters[i]);
    result = filters[i - 1].logic === "and" ? result && next : result || next;
  }
  return result;
}

/**
 * Returns the subset of a contact's listings that satisfy the segment filters.
 * - If no listing-field filters exist: returns all listings if the contact matches (1 enrollment per contact).
 * - If listing-field filters exist: returns only the listings where the filter passes (1 enrollment per matching listing).
 * - Returns [] when the contact does not match at all.
 */
export function getMatchedListings(contact: Contact, filters: FilterRule[]): Listing[] {
  const allListings: Listing[] = contact.listings?.length
    ? contact.listings
    : [{ id: `${contact.id}-primary`, name: contact.listingName, status: contact.listingStatus }];

  if (filters.length === 0) return allListings;

  const hasListingFilter = filters.some((f) => LISTING_FIELDS.has(f.field));

  if (!hasListingFilter) {
    // Non-listing segment: one enrollment per contact regardless of listing count
    const contactRecord = contact as unknown as Record<string, string>;
    return evaluateFilterChain(filters, contactRecord) ? allListings : [];
  }

  // Listing-filtered segment: evaluate each listing independently
  return allListings.filter((listing) => {
    const merged: Record<string, string> = {
      ...(contact as unknown as Record<string, string>),
      listingStatus: listing.status,
      listingName: listing.name,
    };
    return evaluateFilterChain(filters, merged);
  });
}

/**
 * Returns all Active segments that the given contact belongs to.
 * Matching rules (in order):
 * 1. Explicit exclude — contact is in `excludedContactIds` → excluded.
 * 2. Explicit include — contact is in `includedContactIds` → included.
 * 3. Filter-based — contact matches `segment.filters` via `getMatchedListings`
 *    AND does NOT match `segment.excludeFilters` (when present).
 */
export function getContactSegments(contact: Contact, segments: Segment[]): Segment[] {
  return segments.filter((segment) => {
    if (segment.status !== "Active") return false;
    if (segment.excludedContactIds?.includes(contact.id)) return false;
    if (segment.includedContactIds?.includes(contact.id)) return true;
    const matched = getMatchedListings(contact, segment.filters).length > 0;
    if (!matched) return false;
    if (segment.excludeFilters && segment.excludeFilters.length > 0) {
      const excluded = getMatchedListings(contact, segment.excludeFilters).length > 0;
      if (excluded) return false;
    }
    return true;
  });
}
