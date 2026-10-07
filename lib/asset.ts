// Prefix a file in /public with the site's base path so images work on GitHub Pages.
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
