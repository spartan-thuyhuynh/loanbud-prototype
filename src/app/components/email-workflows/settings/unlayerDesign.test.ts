import { describe, it, expect } from "vitest";
import { htmlToUnlayerDesign } from "./unlayerDesign";

describe("htmlToUnlayerDesign", () => {
  it("wraps html in a single html content block", () => {
    const d = htmlToUnlayerDesign("<p>Hi</p>");
    expect(d.body.rows).toHaveLength(1);
    // deep path: rows[0].columns[0].contents[0] is an html block carrying the html
    const content = (d.body.rows[0] as any).columns[0].contents[0];
    expect(content.type).toBe("html");
    expect(content.values.html).toBe("<p>Hi</p>");
  });
});
