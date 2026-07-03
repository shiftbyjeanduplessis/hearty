Hearty sales page image speed patch

Minimal purpose:
- Keep the real/original icon artwork.
- Add optimized .webp versions generated from the original PNG assets in hearty-main (20).zip.
- Point index.html icon references to those .webp files.
- Remove lazy loading from the sales-page icons so they do not appear only when scrolling into view.
- Add preload hints for the 13 small icon files.

Deploy contents to site root:
- index.html -> /index.html
- assets/*.webp -> /assets/

No copy/layout redesign. No generated replacement art. No app files.
