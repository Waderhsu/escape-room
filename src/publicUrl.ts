/** Public folder path that works on GitHub Pages (base: /escape-room/). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}
