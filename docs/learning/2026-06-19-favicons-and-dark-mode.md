# Favicons, dark mode, and why the tab icon "wouldn't change"

_Logged 2026-06-19, after fixing the Keyz tab icon being invisible in dark mode._

## The problem
The Keyz logo (navy key + house) was **invisible in dark-mode browser tabs**. The logo was
navy on a transparent background, so on a dark tab it just disappeared.

## What I learned

### 1. A browser doesn't use just one favicon
A site can declare several icon files, and the browser picks one:
- `favicon.ico` — the classic fallback (Safari, bookmarks, browsing history).
- `icon.svg` / `icon0.svg` — an SVG icon. **Chrome and Firefox prefer the SVG** over `.ico` when it exists.
- `icon.png` / `icon1.png` — a PNG link icon.
- `apple-icon.png` — iOS home-screen tile (not the desktop tab).
- manifest icons (`web-app-manifest-*.png`) — Android PWA install tile.

**Lesson:** to change "the favicon," you must update *all* the tab-icon sources, not just one —
otherwise the browser keeps showing whichever one you missed (for us, the SVG).

### 2. Why Next.js had so many icon files
Next.js App Router turns files in `src/app/` named `favicon.ico`, `icon0.svg`, `icon1.png`,
`apple-icon.png` into `<link rel="icon">` tags automatically. Ours came from a favicon generator
that dumped several at once.

### 3. The dark-mode fix: a white background
Giving the icon a solid **white background** makes the navy logo visible on a dark tab.
Trade-off: in a *light* tab the white square is invisible (blends in), so you just see the
navy logo — which is fine. (A fancier option is an SVG whose colors adapt to
`prefers-color-scheme`, so it's navy on light and light on dark with no white box. We skipped it
since the white-bg version was enough.)

We intentionally left `apple-icon.png` and the maskable PWA icons navy — the OS gives those a
colored tile anyway.

### 4. Favicons cache HARD
After deploying, the new icon didn't show — even after a hard refresh **and** incognito.
Browsers keep a **separate favicon cache** that ignores normal refreshes. It eventually updated.
The way to *prove* the fix is live (instead of arguing with the cache): fetch the icon URL from
production and check the actual pixels (we drew it to a canvas and read RGB = pure white). The
deploy was correct the whole time; the browser was just showing a stale icon.

## Takeaway
When a favicon "won't change," separate two questions:
1. **Is the right file deployed?** → verify the served bytes/pixels, not the tab.
2. **Is the browser showing it?** → that's a caching problem, solved by time / clearing the favicon cache, not by re-deploying.
