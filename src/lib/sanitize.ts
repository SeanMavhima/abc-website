import sanitizeHtml from "sanitize-html";

/**
 * Allow-list sanitiser for rich text produced by the CMS editor. Applied when
 * content is saved AND when it is rendered, so stored HTML can never inject
 * scripts, styles or event handlers into the public site.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
    "blockquote", "hr", "img", "figure", "figcaption", "code", "pre",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  // Drop images whose src was removed as unsafe, rather than leaving empty tags.
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//.test(href);
      const next: sanitizeHtml.Attributes = external
        ? { href, target: "_blank", rel: "noopener noreferrer" }
        : { href };
      return { tagName, attribs: next };
    },
    h1: "h2",
  },
};

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
