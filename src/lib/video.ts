export type VideoEmbed =
  | { kind: "iframe"; src: string; title: string }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string }
  | null;

/** Turns a YouTube / Vimeo / uploaded video URL into a privacy-friendly embed. */
export function parseVideoUrl(url: string | null | undefined): VideoEmbed {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");

  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else if (/^\/(embed|shorts|live)\//.test(u.pathname)) id = u.pathname.split("/")[2];
  }
  if (id && /^[\w-]{6,20}$/.test(id)) {
    return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`, title: "YouTube video" };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const vid = u.pathname.split("/").filter(Boolean).find((p) => /^\d+$/.test(p));
    if (vid) return { kind: "iframe", src: `https://player.vimeo.com/video/${vid}?dnt=1`, title: "Vimeo video" };
  }

  if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: "file", src: u.toString() };
  return { kind: "link", src: u.toString() };
}
