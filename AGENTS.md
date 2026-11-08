# AGENTS.md — Simone Del Grosso Portfolio

## Project Overview
Jekyll-based GitHub Pages portfolio site at https://simonedelgrosso.github.io
- Multi-language: English (`en/`) and Italian (`it/`) via YAML data files
- Auto-redirects based on browser language (`index.html` at root)
- Light and dark themes with a user toggle (see **Theming** below)
- Static deployment via GitHub Pages (push to `main` triggers build)

## Key Commands

```bash
# Requires Ruby + the jekyll gem (this repo has NO Gemfile, so `bundle exec`
# does not apply — `bundle exec jekyll …` fails with "Could not locate Gemfile").
gem install jekyll          # first time only (4.4.1 is what the site is built with)

# Local development
jekyll serve --livereload   # http://127.0.0.1:4000

# Build for production (writes _site/, which is gitignored)
jekyll build

# GitHub Pages parity check: Pages runs Jekyll 3.10.0, so build with it too
jekyll _3.10.0_ build --destination _site-3.10
```

`jekyll _3.10.0_ build` needs that version installed (`gem install jekyll -v 3.10.0`).
The second argument (`--destination _site-3.10`) is optional; without it the
parity build overwrites `_site/`.

Optional HTML validation — the gem is **not** installed by default:

```bash
gem install html-proofer
htmlproofer ./_site --disable-external
```

## Repository Structure

```
├── _config.yml           # Jekyll config (plugins, languages, excludes)
├── _data/                # All content lives here (YAML)
│   ├── personal_info.yml # name, role
│   ├── hero.yml          # headline, tagline, CTAs
│   ├── about.yml         # bio, highlights
│   ├── experience.yml    # work history
│   ├── education.yml     # degrees
│   ├── certifications.yml
│   ├── skills.yml        # categorized skill tags (`value` is no longer rendered)
│   ├── projects.yml      # portfolio projects
│   ├── contact.yml       # links, email
│   ├── footer.yml        # social links, copyright
│   └── navigation.yml    # nav items per language
├── _includes/            # Section partials (one per page section)
├── _layouts/default.html # Single layout + the pre-paint theme script
├── en/index.md           # English entry (front matter only)
├── it/index.md           # Italian entry (front matter only)
├── index.html            # Root redirect + hreflang + language detection
├── assets/css/style.css  # Styles, including both theme token blocks
├── assets/js/script.js   # Theme toggle, nav drawer, reveal, form, preloader
├── tools/probes/         # Headless-browser verification scripts (excluded from the build)
└── apps/piano/           # Standalone piano app (plain HTML/JS)
```

## Theming

- The active scheme lives on **`<html data-color-scheme="light|dark">`**, not on
  `body`. A small inline script in `_layouts/default.html` resolves it **before
  first paint** (stored value → OS preference), so there is no flash.
- The choice is stored in `localStorage` under the key **`theme`** (`light` or
  `dark`). Read failures (private mode) fall back to the OS preference.
- Token blocks live in `assets/css/style.css`: `:root` is the light set,
  `[data-color-scheme="dark"]` overrides it. Both define the same names.
- `applyTheme()` in `script.js` keeps the toggle's `aria-pressed`, the
  `theme-color` meta tag and a `themechange` event (used by the particle canvas
  to re-read its colours) in sync.
- **Prefer semantic tokens** (`--color-text`, `--color-surface`,
  `--color-card-border`, `--shadow-*`, `--space-*`, `--radius-*`) over literal
  hex values. A hard-coded colour is a bug in dark mode unless it is
  theme-invariant by design (for example the white ring on the dark project
  overlay, which is documented where it is used).

## Content Editing Workflow

1. **Edit YAML in `_data/`** — all text content is data-driven
2. **Add translations** — duplicate keys in the per-language block (see `hero.yml`)
3. **Restart Jekyll** — changes to `_data/` require a server restart (`jekyll serve`)
4. **CSS/JS changes** — hot reload works via `--livereload`

## Multi-Language Notes

- Language determined by `page.lang` front matter in `en/index.md` / `it/index.md`
- `_config.yml` sets defaults per path prefix (`en/` → `lang: en`, `it/` → `lang: it`)
- Navigation, hero, footer, etc. read `site.data.*` — structure must match across languages
- Root `index.html` handles auto-redirect + `hreflang` SEO tags
- Italian labels are longer than English ones: the desktop navbar needs ~1176px
  in Italian, which is why the drawer breakpoint is 1024px (see **Layout notes**)

## Layout notes

- **Navigation breakpoint: 1024px.** Below 1025px the nav is a drawer
  (`@media (max-width: 1024px)` in `style.css`, matched by
  `matchMedia('(max-width: 1024px)')` in `script.js` — they must stay in sync).
  Between 1025px and 1199px a compact band (`gap: 8px`, 15px links) keeps the
  Italian bar on one line. The **page layout** breakpoint is still 768px.
- Skills render as **tags**, not progress bars. `_data/skills.yml` keeps the old
  `value` field for reference, but it is not rendered.

## Deployment

- Push to `main` → GitHub Pages builds with Jekyll automatically
- No custom GitHub Actions workflow; uses GitHub Pages native Jekyll support
- `_site/` is in `.gitignore` (generated locally only for testing)
- `plans/`, `tools/` and `AGENTS.md` are excluded in `_config.yml` and are never
  published (root `.md` files without front matter are copied as static files
  otherwise, which is why the explicit excludes matter)

## Common Gotchas

- **YAML changes need Jekyll restart** — `--livereload` only watches `_includes`, `_layouts`, `assets`, markdown files
- **No front matter in section includes** — they're partials, not pages
- **Plugin list in `_config.yml` must match GitHub Pages supported plugins** — only `jekyll-feed`, `jekyll-sitemap`, `jekyll-seo-tag` are safe
- **Absolute URLs in `_config.yml`** — `url: "https://simonedelgrosso.github.io"` required for SEO/sitemap
- **The nav CSS and the JS breakpoint must match** — changing one without the
  other leaves the drawer and the scroll lock disagreeing
- **`plans/plan.md` is the source of truth for ongoing work** — keep its task
  checklist and completion logs updated

## Verification Tooling (`tools/probes/`)

Headless-browser checks used during the restyle. They are **not** part of the
site build and are excluded from `_site`. They need **Node 22 or newer** (the
Chrome ones use a global `WebSocket`, which only exists from Node 21/22 — on
Node 18 they fail with `ReferenceError: WebSocket is not defined`).

The **Chrome probes** each launch their own headless Chrome over CDP and print
one JSON document to stdout. `static.mjs` is just a file server;
`t12firefox3.mjs`/`t12ffdrawer.mjs` attach to an already-running Firefox and
print text; `t7classic.mjs` prints text lines.

```bash
# Start a server first (either one):
jekyll serve --host 127.0.0.1 --port 4010 --no-watch
node tools/probes/static.mjs ./_site 4010          # serve a built copy

# Then, for example (bash/zsh):
node tools/probes/overflow.mjs http://127.0.0.1:4010 320,375 en,it light
node tools/probes/t12probe.mjs http://127.0.0.1:4010 widths
node tools/probes/t6probe.mjs http://127.0.0.1:4010 > /tmp/t6.json
node tools/probes/t6-analyze.mjs /tmp/t6.json

# PowerShell: same, but use $env:TEMP (there is no /tmp on Windows)
node tools/probes/t6probe.mjs http://127.0.0.1:4010 > "$env:TEMP\t6.json"
node tools/probes/t6-analyze.mjs "$env:TEMP\t6.json"
```

| Script | What it checks |
|---|---|
| `overflow.mjs <base> <widths> <langs> <scheme>` | **Width tool of record.** Horizontal overflow with `mobile: false` (desktop metrics; mobile emulation silently widens the layout viewport and hides overflow) |
| `contrast.mjs <base> <lang> <scheme>` | Computed colour contrast of every visible text node, forcing the scroll-reveal state first |
| `static.mjs <dir> <port>` | Minimal static server, for serving a built `_site` copy |
| `t6probe.mjs` + `t6-analyze.mjs` | About chips + timeline reveal, dots, mobile column, no-JS/reduced-motion |
| `t7probe.mjs` + `t7-analyze.mjs` | Certification grid/cards + experience hierarchy, hover lift |
| `t8probe.mjs` + `t8-analyze.mjs` | Skills tags: counts, titles, list semantics, containment |
| `t9probe.mjs` + `t9-analyze.mjs` | Projects: cards, filters (`aria-pressed`), hover, keyboard focus of the overlay link |
| `t10probe.mjs` + `t10-analyze.mjs` | Contact/footer: control sizes, focus rings, native validation, `mailto:` navigation |
| `t11probe.mjs` + `t11-analyze.mjs` | Preloader lifetime/theme, particles, typing, counters, reduced motion |
| `t12probe.mjs <base> [widths\|accept]` | Responsive sweep: `docW` vs `clientW`, wordmark truncation, off-screen controls |
| `t12edges.mjs` | The exact nav band boundaries (1024/1025 and 1199/1200) |
| `t12nav.mjs` | Drawer state machine at 900/1024/1025/1100/1200, including resize-while-open |
| `t7classic.mjs` | Width check that reads `documentElement.clientWidth`, i.e. with a classic scrollbar |

Caveats:

- **Chrome** must be installed at the default Windows path
  (`C:\Program Files\Google\Chrome\Application\chrome.exe`); set
  `CHROME_PATH` to override it.
- The probes write their scratch Chrome profile under
  `%LOCALAPPDATA%\Temp\opencode\`, so they assume Windows. On another OS, set
  `CHROME_PATH` and edit that one line (or run them under a Windows shell).
- Each script uses a fixed CDP debugging port and creates its own temporary
  profile, so run one at a time.
- The `*-analyze.mjs` scripts read the probe's JSON from a file. PowerShell's
  `>` writes UTF-16LE, so they detect and decode both UTF-8 and UTF-16 output.
- `t7classic.mjs` (and the "classic scrollbar" passes elsewhere) is only
  meaningful when `innerWidth - clientWidth > 0`; it now asks for a classic
  scrollbar explicitly and warns when the difference is 0.
- Firefox checks (`tools/probes/t12firefox3.mjs`, `t12ffdrawer.mjs`, optional)
  need Firefox driven over WebDriver BiDi:
  `firefox --headless --remote-debugging-port=9222 --profile <tmp>` first.
- These are development tools, not a CI suite: nothing runs them automatically.

## Testing Checklist (Pre-Push)

```bash
jekyll build
jekyll _3.10.0_ build --destination _site-3.10   # GitHub Pages parity
# Verify _site/ structure:
#   - en/ and it/ directories exist with index.html
#   - assets/ copied correctly
#   - sitemap.xml and feed.xml generated
#   - apps/piano/ preserved
#   - plans/, tools/ and AGENTS.md are NOT present
```

For layout changes, additionally start a server and run:

```bash
node tools/probes/overflow.mjs http://127.0.0.1:4010 320,375,768,1024,1440 en,it light
node tools/probes/contrast.mjs http://127.0.0.1:4010 en light
```

## Adding New Sections

1. Create `_includes/new_section.html`
2. Add data file `_data/new_section.yml` (mirror EN/IT structure)
3. Include in `_layouts/default.html` at desired position
4. Add navigation entry in `_data/navigation.yml` if needed
5. If the section has a background, add `section--alt` to match the alternation
