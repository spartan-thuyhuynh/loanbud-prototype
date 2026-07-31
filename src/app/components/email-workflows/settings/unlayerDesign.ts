import type { UnlayerDesign } from "../../../types";

/**
 * Minimal Unlayer design that renders raw HTML in one HTML content block.
 * Used to open legacy HTML-only templates (no stored design) in the visual builder.
 * Approximate: the HTML shows as a single block rather than decomposed into visual rows.
 */
export function htmlToUnlayerDesign(html: string): UnlayerDesign {
  return {
    body: {
      rows: [
        {
          columns: [
            { contents: [{ type: "html", values: { html } }] },
          ],
        },
      ],
    },
  };
}
