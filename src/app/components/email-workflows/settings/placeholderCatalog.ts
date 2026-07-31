/**
 * Namespaced placeholder catalog. CONTACT group mirrors the design spec image exactly.
 * COMPANY/LISTING are provisional (the design image was truncated at COMPANY) — adjust freely.
 */
export interface PlaceholderGroup {
  label: string;
  tokens: { token: string; label: string }[];
}

const t = (token: string, label: string) => ({ token, label });

export const PLACEHOLDER_GROUPS: PlaceholderGroup[] = [
  {
    label: "CONTACT",
    tokens: [
      t("contact.full_name", "Full name"), t("contact.first_name", "First name"),
      t("contact.last_name", "Last name"), t("contact.email", "Email"),
      t("contact.status", "Status"), t("contact.phone", "Phone"),
      t("contact.role", "Role"), t("contact.address", "Address"),
      t("contact.city", "City"), t("contact.state", "State"), t("contact.zip_code", "Zip code"),
    ],
  },
  {
    label: "COMPANY",
    tokens: [t("company.name", "Company name"), t("company.industry", "Industry"), t("company.website", "Website")],
  },
  {
    label: "LISTING",
    tokens: [t("listing.name", "Listing name"), t("listing.status", "Listing status")],
  },
];

/** Legacy flat token → namespaced token. Only the tokens present in the seed need entries. */
const LEGACY_MAP: Record<string, string> = {
  first_name: "contact.first_name",
  last_name: "contact.last_name",
  email: "contact.email",
  listing_name: "listing.name",
};

const TOKEN_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

export function extractPlaceholders(text: string): string[] {
  return [...new Set([...text.matchAll(TOKEN_RE)].map((m) => m[1]))];
}

export function migratePlaceholders(text: string): string {
  // Seed-scoped: only tokens present in LEGACY_MAP are rewritten; any other token passes through unchanged.
  return text.replace(TOKEN_RE, (_full, name: string) => {
    const mapped = LEGACY_MAP[name] ?? name;
    return `{{${mapped}}}`;
  });
}

export function plainTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
