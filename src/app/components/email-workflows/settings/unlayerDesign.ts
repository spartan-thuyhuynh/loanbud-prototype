import type { UnlayerDesign } from "../../../types";

/**
 * A complete, valid Unlayer (v16) design that renders raw HTML inside a single HTML content block.
 * Used to open legacy HTML-only templates (no stored Unlayer design) in the visual builder.
 * Every field Unlayer's renderer touches (row.cells, *.values, counters, schemaVersion) is present,
 * so the column container does not crash. Approximate fidelity: the HTML appears as one block.
 */
export function htmlToUnlayerDesign(html: string): UnlayerDesign {
  return {
    counters: { u_row: 1, u_column: 1, u_content_html: 1 },
    body: {
      id: "u_body",
      rows: [
        {
          id: "u_row_1",
          cells: [1],
          columns: [
            {
              id: "u_column_1",
              contents: [
                {
                  id: "u_content_html_1",
                  type: "html",
                  values: {
                    html,
                    hideDesktop: false,
                    displayCondition: null,
                    container: { padding: "0px" },
                    anchor: "",
                    _meta: { htmlID: "u_content_html_1", htmlClassNames: "u_content_html" },
                    selectable: true,
                    draggable: true,
                    duplicatable: true,
                    deletable: true,
                    hideable: true,
                  },
                },
              ],
              values: {
                _meta: { htmlID: "u_column_1", htmlClassNames: "u_column" },
                border: {},
                padding: "0px",
                borderRadius: "0px",
                backgroundColor: "",
              },
            },
          ],
          values: {
            displayCondition: null,
            columns: false,
            backgroundColor: "",
            columnsBackgroundColor: "",
            backgroundImage: { url: "", fullWidth: true, repeat: "no-repeat", size: "custom", position: "center" },
            padding: "0px",
            anchor: "",
            hideDesktop: false,
            _meta: { htmlID: "u_row_1", htmlClassNames: "u_row" },
            selectable: true,
            draggable: true,
            duplicatable: true,
            deletable: true,
            hideable: true,
          },
        },
      ],
      headers: [],
      footers: [],
      values: {
        popupPosition: "center",
        popupWidth: "600px",
        popupHeight: "auto",
        borderRadius: "10px",
        contentAlign: "center",
        contentVerticalAlign: "center",
        contentWidth: "500px",
        fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        textColor: "#000000",
        popupBackgroundColor: "#FFFFFF",
        popupBackgroundImage: { url: "", fullWidth: true, repeat: "no-repeat", size: "cover", position: "center" },
        popupOverlay_backgroundColor: "rgba(0, 0, 0, 0.1)",
        popupCloseButton_position: "top-right",
        popupCloseButton_backgroundColor: "#DDDDDD",
        popupCloseButton_iconColor: "#000000",
        popupCloseButton_borderRadius: "0px",
        popupCloseButton_margin: "0px",
        popupCloseButton_action: {
          name: "close_popup",
          attrs: { onClick: "document.querySelector('.u-popup-container').style.display = 'none';" },
        },
        backgroundColor: "#F7F8F9",
        backgroundImage: { url: "", fullWidth: true, repeat: "no-repeat", size: "custom", position: "center" },
        preheaderText: "",
        linkStyle: { body: true, linkColor: "#0000ee", linkHoverColor: "#0000ee", linkUnderline: true, linkHoverUnderline: true },
        _meta: { htmlID: "u_body", htmlClassNames: "u_body" },
      },
    },
    schemaVersion: 16,
  };
}
