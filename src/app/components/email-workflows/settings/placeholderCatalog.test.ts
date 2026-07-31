import { describe, it, expect } from "vitest";
import { extractPlaceholders, migratePlaceholders, plainTextToHtml, PLACEHOLDER_GROUPS } from "./placeholderCatalog";

describe("extractPlaceholders", () => {
  it("finds dotted, de-duplicated tokens", () => {
    expect(extractPlaceholders("Hi {{contact.first_name}} {{contact.first_name}} at {{company.name}}"))
      .toEqual(["contact.first_name", "company.name"]);
  });
  it("returns [] when none", () => {
    expect(extractPlaceholders("no tokens here")).toEqual([]);
  });
});

describe("migratePlaceholders", () => {
  it("rewrites legacy flat tokens to namespaced", () => {
    expect(migratePlaceholders("Hi {{first_name}}, re {{listing_name}}"))
      .toBe("Hi {{contact.first_name}}, re {{listing.name}}");
  });
  it("leaves already-namespaced tokens alone", () => {
    expect(migratePlaceholders("{{contact.email}}")).toBe("{{contact.email}}");
  });
});

describe("plainTextToHtml", () => {
  it("wraps blocks in <p> and single newlines as <br>", () => {
    expect(plainTextToHtml("Hi there,\n\nWelcome\nLine2"))
      .toBe("<p>Hi there,</p><p>Welcome<br>Line2</p>");
  });
});

describe("PLACEHOLDER_GROUPS", () => {
  it("contains the CONTACT group with full_name first (matches the design)", () => {
    const contact = PLACEHOLDER_GROUPS.find((g) => g.label === "CONTACT");
    expect(contact?.tokens[0].token).toBe("contact.full_name");
  });
});
