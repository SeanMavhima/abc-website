/** Deterministic UUIDs so that seed relationships are stable across runs. */
export function sid(key: string): string {
  const hashes: string[] = [];
  for (let seed = 0; seed < 4; seed++) {
    let h = 0x811c9dc5 ^ (seed * 0x9e3779b1);
    const s = `abc:${seed}:${key}`;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    hashes.push((h >>> 0).toString(16).padStart(8, "0"));
  }
  const hex = hashes.join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
