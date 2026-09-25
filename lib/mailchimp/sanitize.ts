import "server-only";

import sanitizeHtml from "sanitize-html";

const color = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([0-9.,\s%]+\)$/i, /^[a-z]+$/i];
const length = [/^(?:auto|0|[0-9.]+(?:px|em|rem|%|pt))$/i];

export function sanitizeMailchimpHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [
      "a", "abbr", "article", "b", "blockquote", "br", "caption", "center", "code", "col", "colgroup",
      "div", "em", "figure", "figcaption", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header",
      "hr", "i", "img", "li", "main", "ol", "p", "pre", "section", "small", "span", "strong", "sub",
      "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul",
    ],
    allowedAttributes: {
      "*": ["style", "title"],
      a: ["href", "name", "target", "rel", "style", "title"],
      img: ["src", "alt", "width", "height", "style", "title"],
      table: ["align", "border", "cellpadding", "cellspacing", "role", "style", "width"],
      td: ["align", "colspan", "rowspan", "style", "valign", "width"],
      th: ["align", "colspan", "rowspan", "scope", "style", "valign", "width"],
      col: ["span", "style", "width"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    allowedStyles: {
      "*": {
        "background-color": color,
        "border": [/^[0-9.]+px\s+(?:solid|dashed|dotted)\s+(?:#[0-9a-f]{3,8}|[a-z]+)$/i, /^0$/],
        "border-color": color,
        "border-radius": length,
        "border-style": [/^(?:none|solid|dashed|dotted)$/i],
        "border-width": length,
        "color": color,
        "font-family": [/^[a-z0-9 ,"'-]+$/i],
        "font-size": length,
        "font-style": [/^(?:normal|italic)$/i],
        "font-weight": [/^(?:normal|bold|[1-9]00)$/i],
        "height": length,
        "line-height": [/^(?:normal|[0-9.]+(?:px|em|rem|%|pt)?)$/i],
        "margin": [/^[0-9.\s%-]+(?:px|em|rem|%|pt|auto)?$/i],
        "margin-bottom": length,
        "margin-left": length,
        "margin-right": length,
        "margin-top": length,
        "max-width": length,
        "padding": [/^[0-9.\s%-]+(?:px|em|rem|%|pt)?$/i],
        "padding-bottom": length,
        "padding-left": length,
        "padding-right": length,
        "padding-top": length,
        "text-align": [/^(?:left|right|center|justify)$/i],
        "text-decoration": [/^(?:none|underline)$/i],
        "vertical-align": [/^(?:top|middle|bottom|baseline)$/i],
        "width": length,
      },
    },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  });
}

export function plainTextFromHtml(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
