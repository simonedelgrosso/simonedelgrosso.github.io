# Plan: Modern & elegant restyle of the portfolio

Status: **In progress.** Created 2026-10-24. Revised 2026-10-24
after the user answered the open questions.
Completed: **T0, T1, T2**. Next: **T3**.
Previous plan: none (`plans/` did not exist before this file).

## 0. Progress log

| Task | Status | Verified by |
|---|---|---|
| T0 – Baseline capture | **Done** | `jekyll build` + headless screenshots at 375/768/1024/1440 for EN/IT (light and dark); console showed only the 3 expected `console.log` greetings, no errors. |
| T1 – Design tokens, fonts, theme token sets | **Done** | Builds (Jekyll 4.4.1 + 3.10.0), screenshots in both themes at 320/375/768/1024/1440 for EN/IT, computed-style checks, theme-resolution matrix, reveal-forced contrast audit (0 failures, 4 combinations), Lighthouse a11y 0.89. |
| T2 – Theme toggle | **Done** | `togglecheck.mjs` **28/28** (OS following, persistence, no-flash, ARIA correct before parsing, no init event, live OS follow, storage blocked, Space key, IT label); strict overflow audit clean at 320/375/768/1024/1440 for EN+IT in both themes; contrast 0 failures; Lighthouse a11y **95** EN+IT; both Jekyll builds clean. Two independent review rounds: 2 P3 + 2 minor in round 2, all fixed and re-verified. See the T2 completion log. |

Verification tooling used (temporary, outside the repo, in
`%LOCALAPPDATA%\Temp\opencode\`): `shot.mjs` (headless Chrome via CDP,
per-width full-page screenshots), `themecheck.mjs` (theme-resolution
matrix), `contrast.mjs` (reveal-forced contrast audit that does not rely
on Lighthouse), `overflow.mjs` (**strict** overflow audit, `mobile: false`,
the tool of record for width checks), `togglecheck.mjs` (theme-toggle
acceptance checks with real key events), `navshot.mjs` (clipped navbar
screenshots + nav metrics), and the throwaway `bisect.mjs`/`chain.mjs`/
`logofit.mjs` probes used to isolate the 320px regressions.
Screenshots: `baseline\` (before), `t1-dark\`, `t1-light\`, `t1-final\`,
`t1-review*\`, `t1-320*`, `t2-light\`, `t2-nav\`.

## 1. Objective

Give https://simonedelgrosso.github.io a modern, elegant visual refresh while
keeping the page structure, section order, content, URLs, anchors,
multi-language behaviour, and existing JavaScript features. Changes agreed
with the user:
- new accent color and new fonts
- a working **light/dark theme toggle**
- **skills shown as simple tags** instead of progress bars
- `AGENTS.md` build commands corrected

Visual changes come mainly from CSS. Markup changes are small and targeted.

## 2. Decisions log (user answers, 2026-10-24)

| # | Question | Decision | Resulting design choice |
|---|---|---|---|
| 1 | Accent color | User: "up to you" | **Indigo accent with an indigo → sky gradient** for highlights. Dark: `#818cf8` → `#38bdf8`. Light: `#4f46e5` → `#0369a1` (originally `#0284c7`; deepened during review because white text on `#0284c7` is only 4.10:1, under AA for the 13px badge text). This replaces cyan `#00c8ff`. |
| 2 | Fonts | Can be changed | **Plus Jakarta Sans** (600/700/800) for headings and **Inter** (400/500/600) for body, in a single Google Fonts request with `display=swap`. Because Inter stops at 600, body-font elements cap at `--font-weight-semibold`; `--font-weight-bold` (700) is display-family only. Remove the unused `Space Grotesk`/`Geist`/`Berkeley Mono` names from the font stacks. |
| 3 | Light mode | Implement | Turn the theme toggle back on as a proper button in `.nav-controls`. The first visit follows `prefers-color-scheme`; the user's choice is saved in `localStorage`; an inline script in `<head>` sets the theme before the page draws so it doesn't flash the wrong theme. |
| 4 | Preloader and particles | OK (keep, restyle, reduced-motion aware) | Keep both and restyle them. Particle colors come from CSS variables, so they follow the theme. Particles are turned off under `prefers-reduced-motion`. |
| 5 | Skills | Switch to simple tags | Render each category as a card of pill tags. Remove the bar markup and bar JS. Keep the `value` key in `_data/skills.yml` but stop rendering it, so there is no data migration. |
| 6 | AGENTS.md | Yes, may be updated | Fix the commands: there is no Gemfile, so use plain `jekyll build` / `jekyll serve`. Document the theme toggle and the skills tags. |

> If you want a different accent color (for example emerald or violet) or a
> different heading font, only the values in T1 need to change. Everything
> else reads those tokens.

## 3. Scope

### In scope
- `assets/css/style.css`: tokens for both themes, typography, and the styles
  for each section.
- `_layouts/default.html`:
  - fonts link
  - `theme-color` metas for both themes
  - `<meta name="color-scheme" content="dark light">`
  - an inline script in `<head>` that sets the theme early
  - removing the hard-coded `data-color-scheme="dark"` from `<body>`
- `_includes/navigation_section.html`: the theme toggle button.
- `_includes/skills_section.html`: tag markup.
- `_data/navigation.yml`: **new keys only**, for the toggle's accessible
  labels in EN and IT. Existing keys stay unchanged.
- `assets/js/script.js`:
  - theme toggle logic
  - remove the skill-bar code
  - theme-aware particle colors
  - inline-style cleanups (preloader, card hover, hamburger)
  - reduced-motion handling
- Small accessibility touches in includes: `aria-label` and
  `rel="noopener noreferrer"` on icon and `target="_blank"` links.
- `AGENTS.md`: command and documentation fixes (task T13).

### Out of scope
- Section order, adding or removing sections, and rewriting text content.
- Sass, CSS frameworks, build pipelines, new Jekyll plugins, and adding a
  Gemfile. A Gemfile would change dependencies, so it is only noted as a
  follow-up.
- `apps/piano/`, which must stay byte-for-byte unchanged.
- The SEO/sitemap observations in section 10.

## 4. Observed facts (from inspection)

| Area | Observation |
|---|---|
| Stack | Jekyll on the native GitHub Pages build. **No Gemfile**, **no `.github/` workflows**, no tests, no lint config. |
| Local tooling | `ruby 3.3.8`, `Bundler 2.7.1`, `jekyll 4.4.1` and `3.10.0` installed globally, plus `jekyll-feed`, `jekyll-seo-tag` and `jekyll-sitemap`. `html-proofer` is **not** installed. |
| Commands | `bundle exec …` from AGENTS.md fails because there is no Gemfile. `jekyll build -d "$env:LOCALAPPDATA\Temp\opencode\site-baseline"` **was run and succeeded** (about 1.3 s) and produced `en/`, `it/`, `assets/`, `apps/`, `feed.xml` and `sitemap.xml`. |
| Layout | `_layouts/default.html` contains, in order: nav, hero, about, education, certifications, experience, skills, projects, contact, footer. `<body data-color-scheme="dark">` is hard-coded. |
| CSS | `assets/css/style.css` is 1,931 lines. Lines 1–785 are a generic design system: `:root` light tokens plus `[data-color-scheme="dark"]` (around line 228) and `[data-color-scheme="light"]` (around line 293) blocks. Lines 786+ are portfolio styles with `--portfolio-primary: #00c8ff` and `--portfolio-dark: #000` (used 5 times). About 13 hard-coded hex/rgba colors after line 786 won't adapt to a light theme. Breakpoints are 768px and 480px. |
| Theme selectors | The CSS uses bare `[data-color-scheme="…"]` selectors, not `body[...]`, so moving the attribute to `<html>` works once the body attribute is removed. |
| Fonts | The CSS asks for `"Space Grotesk"` first, but only Inter is loaded. |
| Theme toggle | `createThemeToggle()` is commented out (around lines 429–460). It uses inline styles, has no persistence, and toggles `document.body`. |
| Skills | `_data/skills.yml`: `items.{programming_languages, frameworks, markup}[]` with `name` and `value`, plus `translations.{it,en}.sections`. The bar is animated through `.skill-progress[data-skill]` → `animateSkillBar()` (around line 162) and the observer selector (around line 212). |
| Particles | Colors are hard-coded in JS: `rgba(255,255,255,…)` and `rgba(0,200,255,…)` around lines 587–608. They would be invisible or wrong in light mode. |
| JS hooks to keep | `#navbar`, `.navbar.scrolled`, `#nav-menu`, `#hamburger .bar`, `.nav-link.active`, `#typing-text`, `.typing-container .cursor.blinking`, `.stat-number[data-target]`, `.timeline-item`, `.certification-card`, `.project-card[data-category]`, `.filter-badge.active[aria-pressed]`, `#contact-form`, `#contact-me`, `.lang-switch.en-active/.it-active`, `.lang-slider`, `.lang-link.active`, `#scroll-progress`, `.age`, `.animated`, and the preloader, scroll-to-top button and particle canvas that JS creates. |
| Inline JS styling | Preloader `cssText`, project-card hover `style.transform` (around lines 816–826), hamburger bar transforms (around lines 41–66), and card reveal opacity/transform in the observer. |
| Accessibility | `:focus-visible` styles exist. No `prefers-reduced-motion` handling. The hamburger is a `div role="button"`. Footer icon links have no accessible names. |
| Third parties | Google Analytics `G-H8RCS18K2T`, Google Fonts, and cdnjs Font Awesome 6.7.2 with SRI. |

## 5. Assumptions

- **A1:** "Without changing too much the structure" means the same sections,
  order, nav items and content. Layout changes inside a section are fine.
- **A2:** No new runtime dependencies or third-party origins. Only the Google
  Fonts request changes.
- **A3:** The target is evergreen browsers. `color-mix()` and
  `backdrop-filter` are already used; add `-webkit-backdrop-filter` for
  Safari.
- **A4:** Storing the theme in `localStorage` under the key `theme` is
  acceptable. It is strictly functional and needs no consent.
- **A5:** The default theme follows the operating system preference. Today the
  site is always dark, so light-OS visitors will now see light mode first.
  This is intended.
- **A6:** No visual-regression tooling exists, so verification is a build plus
  manual browser checks.

## 6. Remaining open questions (non-blocking; defaults apply)

1. Where should the toggle go? *Default:* inside `.nav-controls`, next to the
   language switch. It stays visible on mobile.
2. Should the skills tags show the proficiency level, for example a subtle dot
   scale or a tooltip? *Default:* no. Names only, as "simple tags" asked for.
3. Should a `Gemfile` with `github-pages` be added later so that
   `bundle exec` works? *Default:* not in this task; recorded as a follow-up.

## 7. Design direction (reference for all tasks)

- **Dark theme:**
  - background `#0b0d12`
  - surface `#12151c`
  - raised surface `#171b24`
  - borders `rgba(255,255,255,.08)`
  - text `#e6e8ee`
  - muted text `#9aa3b2`
  - accent `#818cf8`
  - gradient `linear-gradient(135deg,#818cf8,#38bdf8)`
- **Light theme:**
  - background `#f8f9fb`
  - surface `#ffffff`
  - borders `rgba(15,23,42,.08)`
  - text `#0f172a`
  - muted text `#475569`
  - accent `#4f46e5`
  - gradient `linear-gradient(135deg,#4f46e5,#0284c7)`
- **Typography:**
  - headings in Plus Jakarta Sans with tight letter-spacing (`-0.02em`)
  - body in Inter at 16px with line-height 1.65
  - fluid sizes with `clamp()`: hero h1 about 2.5–4rem, h2 about 1.75–2.5rem
- **Surfaces:** cards with 16–20px radius, 1px hairline border, soft layered
  shadow. Translucent blur only on the navbar.
- **Motion:** 150–250 ms eased transitions and a 2–4px hover lift with no
  scaling. All non-essential motion is off under `prefers-reduced-motion`.
- **Spacing:** sections about 96–112px apart on desktop and 64px on mobile.
  Container max width about 1140px.
- **Rule:** section styles use only semantic tokens (`--color-*` and
  portfolio tokens), never hard-coded colors, so both themes work
  automatically.

## 8. Task checklist (ordered, each independently verifiable)

> Shared verification commands:
> ```powershell
> jekyll build                                   # verified working (global jekyll 4.4.1)
> jekyll serve --livereload                      # http://127.0.0.1:4000/en/ and /it/
> jekyll _3.10.0_ build -d "$env:LOCALAPPDATA\Temp\opencode\site-gh"   # GH Pages parity; verified working
> Test-Path _site/en/index.html, _site/it/index.html, _site/assets/css/style.css, _site/sitemap.xml, _site/feed.xml, _site/apps/piano/index.html
> Test-Path _site/plans                          # must be False (plans/ is excluded in _config.yml)
> git diff --quiet -- apps/piano                 # must exit 0
> node "$env:LOCALAPPDATA\Temp\opencode\overflow.mjs" http://127.0.0.1:4017 320,375,768,1024,1440 en,it light
> node "$env:LOCALAPPDATA\Temp\opencode\contrast.mjs" http://127.0.0.1:4017 en light
> ```
> Restart `jekyll serve` after editing `_data/` (AGENTS.md gotcha).
> `htmlproofer` is optional and needs `gem install html-proofer` with user
> approval.
>
> **Width checks must use `overflow.mjs`, not `shot.mjs`.** `shot.mjs` uses
> mobile emulation, where Chrome widens `innerWidth` to fit overflowing
> content, so `scrollWidth <= innerWidth` can never fail (this produced a
> false "no overflow" result during T1).
>
> Manual check matrix for each task: `/en/` and `/it/` × dark and light
> (after T2) × widths 320, 375, 768, 1024 and 1440.

### T0 – Baseline capture ✅ Done (2026-10-24)
- [x] **Objective:** Record the current look and behaviour so the result can
  be compared.
- **Files changed:** none.
- **Checks run:**
  - `jekyll build -d "$env:LOCALAPPDATA\Temp\opencode\site-baseline"`: exit 0,
    about 1.3 s, produced `en/`, `it/`, `assets/`, `apps/`, `feed.xml`,
    `sitemap.xml`.
  - Headless Chrome screenshots: `baseline\{en,it}-{375,768,1024,1440}.png`.
  - Console: only the 3 informational welcome messages, no errors.
  - Horizontal overflow: none at any of the 8 combinations.
- **Notes:** the full-page screenshots show a large blank band inside the hero
  and empty project/certification grids. Both are caused by
  screenshot-time artifacts, not by the page: `100vh` grows with the CDP
  viewport override used for full-page capture, and those cards are revealed
  by `IntersectionObserver` which doesn't fire for the off-screen area. This
  matches the pre-change page; keep it in mind when comparing screenshots.

### T1 – Design tokens, fonts and theme token sets ✅ Done (2026-10-24)
- [x] **Objective:** Define the palette for both themes, the type scale,
  radius, shadows and motion tokens. Load the new fonts.
- **Files changed:**
  - `assets/css/style.css`
    - `:root`: new type scale (body 16px, tighter headings), display/mono font
      stacks, extended spacing (40–112) and radius (`xl`, `2xl`) tokens, a
      shared neutral ramp and brand accents.
    - `:root` now holds the **light** palette (default cascade); the old
      teal/cream light tokens were replaced with indigo/slate: background
      #f8f9fb, surface #ffffff, text #0f172a, muted #475569, accent #4f46e5.
      `--portfolio-*` and shadow tokens are defined per theme, together with
      new tokens (`--color-surface-raised`, `--color-border-subtle`,
      `--color-glass`, `--color-overlay`, `--color-on-accent`,
      `--particle-rgb`, `--particle-line-rgb`, `--accent-rgb`).
    - `[data-color-scheme="dark"]`: full dark palette (`#0b0d12` background,
      `#12151c` surface, `#e6e8ee` text, `#a8b0c0` muted, `#818cf8` accent,
      indigo→sky gradient) plus dark shadows and `color-scheme: dark`.
    - Removed the duplicated light/dark `:root` blocks, the old
      `[data-color-scheme="light"]` block (light now lives in `:root`), the
      orphan `@font-face` for Space Grotesk, and the old portfolio `:root`.
    - Hard-coded colors replaced with tokens: navbar background, lang switch
      surface/border/shadow, lang link colors, hero background, cursor,
      stat cards, scroll-to-top button, project overlay and link, footer,
      `.btn--primary:hover` (was hard `white`), and the undefined
      `--color-border-secondary` reference.
    - Typography: headings use `--font-family-display`; h1/h2 use `clamp()`;
      body font size 16px and line-height 1.65.
  - `_layouts/default.html`
    - one Google Fonts request for `Inter:wght@400;500;600` and
      `Plus+Jakarta+Sans:wght@600;700;800`
    - inline pre-paint script that resolves `localStorage.theme` (valid values
      only) and falls back to `prefers-color-scheme`, setting
      `data-color-scheme` on `<html>`; it sits after `/assets/css/style.css`
      so the stylesheet is discovered first and still applies after the
      attribute is set
    - `theme-color` metas for both schemes
    - removed the hard-coded `data-color-scheme="dark"` from `<body>`
  - `assets/js/script.js`: particle colors now read `--particle-rgb` /
    `--particle-line-rgb` via `getComputedStyle` and refresh on the
    `themechange` event (T2 will dispatch it). Density/opacity untouched.
  - `_config.yml`: added `exclude: [plans]` so the planning notes are not
    copied into `_site` (a deviation from the original scope: creating
    `plans/plan.md` made this file publishable on GitHub Pages, so it is a
    direct consequence of this task).
- **Checks run and results:**
  - `jekyll build`: exit 0.
  - `jekyll _3.10.0_ build -d "$env:LOCALAPPDATA\Temp\opencode\site-gh"`:
    exit 0 (GitHub Pages parity).
  - Built HTML check: `<body>` has no scheme attribute, the early script and
    both `theme-color` metas are present.
  - Computed styles: `data-color-scheme` resolves to `light` with no stored
    preference and a light OS; `--color-background` = `#f8f9fb` (light) /
    `#0b0d12` (dark); hero h1 renders in **Plus Jakarta Sans** at 43px;
    body renders in **Inter** at 16px; loaded font faces are Inter
    400/500/600 and Plus Jakarta Sans 600/700.
  - Theme-resolution matrix (`themecheck.mjs`), all 5 cases correct:
    - no stored preference, OS dark → dark
    - no stored preference, OS light → light
    - stored `dark`, OS light → dark
    - stored `light`, OS dark → light
    - stored invalid value, OS dark → dark (fixed during verification: the
      first version fell back to `light` instead of the OS preference)
  - Screenshots in both themes at 375/768/1024/1440 for `/en/` and `/it/`:
    no horizontal overflow in any of the 16 combinations.
  - Lighthouse (accessibility only) in both themes: score 0.89. Remaining
    failures are `button-name` (hamburger is a `div[role=button]` with an
    aria-label), `link-name` (footer icon links have no text) and
    `heading-order`. The last two are pre-existing and are not part of this
    task's scope; they are recorded in section 9 for T2/T10.
    **Caveat:** Lighthouse/axe does not scan the observer-hidden cards, so it
    is not sufficient on its own for contrast. See the reveal-forced audit
    below.
  - Contrast audit with observer-hidden content force-revealed
    (`contrast.mjs`: ancestor background compositing, gradient stops,
    `background-clip: text`, alpha blending, large-text threshold): **0
    failures, 0 skipped of 307 elements** for `/en/` and `/it/` in both light
    and dark. Control test confirmed the method detects the original defect
    (3.34:1 on `.cert-badge`).
  - Contrast ratios checked by calculation (WCAG AA needs 4.5:1 for body):
    dark: text #e6e8ee 16.0:1, muted #a8b0c0 8.4:1, accent #818cf8 6.9:1;
    light: text #0f172a 17.2:1, muted #475569 7.4:1, accent #4f46e5 6.5:1.
    On-accent text: light white on `#4f46e5`/`#0369a1` = 6.50/5.63:1;
    dark `#0b0d12` on `#818cf8`/`#38bdf8` = 6.52/9.02:1.
  - Final build after the `_config.yml` exclude: `jekyll build` exit 0, the
    structure check returned all `True`, and `_site/plans` does **not** exist.
  - `git diff --quiet -- apps/piano`: exit 0 (untouched).
  - **Independent review follow-up (3 P3 findings, all fixed and
    re-verified):**
    - P3-1: the light `--shadow-*` tokens were declared twice inside the same
      `:root` and the legacy block won the cascade, so the designed light
      shadows never applied. Removed the legacy declarations; each shadow
      token is now declared exactly once per theme.
      Re-verified: light `--shadow-lg` = `0 24px 48px -24px rgba(15,23,42,.24)`,
      dark = `0 28px 56px -28px rgba(0,0,0,.85)`, and `.stat` reports
      different `box-shadow` per theme.
    - P3-2: `.project-link:hover` used the translucent `--color-overlay` as a
      text color. Now `--color-slate-950` (`#0f172a`, 17:1 on the white hover
      background). Verified by reading the applied CSS rule.
    - P3-3: `"Berkeley Mono"` was still first in `--font-family-mono`
      (row 2 decision). Removed; the stack is now
      `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
    - Also removed the `< 0` dead `@media (prefers-color-scheme: dark)` caret
      rule for `select.form-control` (there are no `<select>` elements, and
      the `[data-color-scheme]` rules always win now).
  - Post-fix re-verification: `jekyll build` and the 3.10 parity build both
    exit 0; screenshots in both themes at 375/1440 for EN and IT with no
    horizontal overflow; console 0 errors/warnings; Lighthouse accessibility
    0.89 with the same three pre-existing non-contrast failures.
  - Self-correction to the earlier claim: the first pass reported shadow
    tokens as "defined per theme" without checking which declaration won the
    cascade. That was wrong for light mode and is now fixed.
  - **Second review follow-up (1 P2 + 3 P3):**
    - P2 (real contrast regression): `.cert-badge`, `.contact-icon` and
      `.social-links a:hover` still used literal `color: black` on the new
      indigo gradient. Black on `#4f46e5` is 3.34:1, and the badge text is
      13px, so it failed AA in light mode. All three now use
      `--color-on-accent`. Additionally the light gradient end was deepened
      from `#0284c7` to `#0369a1` because white on `#0284c7` is only 4.10:1,
      below the 4.5 needed for the 13px badge; the new worst case is 5.63:1.
      Dark mode is unaffected (`#0b0d12` on both stops is 6.52–9.02:1).
    - Root cause of the missed finding: Lighthouse/axe skip elements that the
      `IntersectionObserver` reveal keeps at `opacity: 0`, so the
      certification and project cards were never scanned. The earlier
      "no contrast failures" claim was therefore a coverage gap, not proof.
      Replacement method: a purpose-built audit that force-reveals those
      elements and walks the whole DOM (307 elements, 0 skipped).
    - Validation of the new method: a control run against `_site` with
      `color: black` temporarily restored on `.cert-badge` reported
      `3.34:1 (required 4.5)` on `div.cert-badge`, matching the reviewer's
      independent calculation. The generated file was then restored and
      rebuilt. Result after the fix: **0 failures** for EN and IT in both
      themes.
    - P3 (implemented): added `<meta name="color-scheme" content="dark light">`
      as the plan's scope required.
    - P3 (bookkeeping): the `?v=` cache-busting item from section 9 is now
      explicitly owned by **T14** instead of floating.
    - Tooling caveat worth recording: an ancestor-based background walk cannot
      see (a) the positioned `.lang-slider` behind the active language link or
      (b) `background-clip: text` gradient headings. Both were handled
      explicitly in the audit; without that they produced false positives.
  - **Third review follow-up (3 P3, all fixed and re-verified):**
    - Dead/inconsistent accent tokens: `--accent-rgb` and `--accent-alt-rgb`
      were introduced in T1 but never consumed, and `--accent-alt-rgb` still
      held the superseded `#0284c7` gradient end. Both removed.
    - Raw hex values remained inside the two `--portfolio-gradient`
      declarations. Added `--color-sky-700: #0369a1` to the shared ramp and
      rewrote both gradients to reference ramp primitives
      (`var(--color-indigo-500)`/`var(--color-sky-700)` and
      `var(--color-indigo-400)`/`var(--color-sky-400)`), so the shipped
      gradient and the palette cannot drift apart again.
    - `themechange` event-target contract was ambiguous and could have broken
      the particle recolor in T2. **Contract (binding for T2):**
      `themechange` is dispatched on **`window`**, because that is where
      `createParticles()` registers its listener. Recorded in the T2 task.
  - Post-refactor verification: `jekyll build` exit 0; braces balanced
    (257/257); `rg 'accent-rgb|accent-alt-rgb'` returns 0 hits; reveal-forced
    contrast audit still **0 failures** for `/en/` light and dark.
  - 320px evidence (the narrowest width in overall acceptance criterion 5):
    headless screenshots at 320px for `/en/` and `/it/` in **both** themes,
    `scrollWidth <= innerWidth` in all four combinations. The nav already
    collapses to the hamburger at that width.
    **Correction (made during T2):** this T1 result was a false negative.
    `shot.mjs` used mobile emulation, and Chrome silently widens
    `innerWidth` to fit overflowing content, so the comparison could not
    fail. Re-measured with `overflow.mjs` (desktop metrics), 320px
    **did** overflow (334px, caused by the contact grid, see the T2
    regression notes). The claim is only valid as of the T2 fix.
  - `plans/plan.md` must be committed **together with** the `_config.yml`
    `exclude` (or not at all): the exclude exists purely because this file
    would otherwise be published.
- **Remaining risks / notes:**
  - ~~The theme toggle button does not exist yet (T2)~~ → **resolved in T2**.
  - ~~`theme-color` follows the OS preference, not the stored choice~~ →
    **resolved in T2** (single JS-managed meta).
  - Component-level styling in both themes is still the pre-restyle look
    applied over the new palette; T3–T11 refine it.
  - The old primitive palette (teal/cream/charcoal/`--color-bg-2..8`) is now
    unused but kept for T14 cleanup.
  - `.navbar.scrolled` adds a 1px bottom border without a transition; T3
    reworks the navbar.


### T2 – Theme toggle (light/dark) ✅ Done (2026-10-24)
- [x] **Objective:** Add a theme toggle that is accessible, saves the choice,
  and doesn't flash the wrong theme.
- **Already done in T1 (do not redo):** the pre-paint inline script in
  `_layouts/default.html`, the removal of `data-color-scheme` from `<body>`,
  the `theme-color` metas, and the `color-scheme` property per theme.
- **Files:**
  - `_includes/navigation_section.html`: `<button type="button"
    class="theme-toggle" id="theme-toggle" aria-pressed="…"
    aria-label="{{ nav.theme_toggle }}">` with a sun icon and a moon icon
  - `_data/navigation.yml`: add `theme_toggle` to `en` ("Toggle dark mode")
    and `it` ("Attiva/disattiva tema scuro")
  - `assets/js/script.js`: replace the commented `createThemeToggle()` with
    `setupThemeToggle()`, which toggles the attribute on `<html>`, saves it,
    updates `aria-pressed`, dispatches `themechange` (the particle listener
    already expects it), and updates the `theme-color` meta
  - `style.css`: `.theme-toggle` styles, `.nav-controls` spacing
  - While in this task, also fix the pre-existing `button-name` failure for
    the hamburger (add a real `aria-label`/`aria-expanded`, or turn it into a
    `<button>`) and the `link-name` failure for the footer icons, since both
    are cheap and in the nav/footer scope
- **Notes:**
  - `localStorage` access is already wrapped in `try/catch` in the head
    script; mirror that in the toggle.
  - If the user hasn't chosen a theme, follow OS changes live through a
    `matchMedia` change listener.
  - Delete the old commented-out code rather than leave both versions.
- **Acceptance:**
  - Clicking toggles the theme instantly. The choice survives reloads and the
    EN/IT switch.
  - The first visit follows the OS theme.
  - No wrong-theme flash on reload, including with "Disable cache".
  - Works with the keyboard (Tab, then Enter or Space), and the focus ring is
    visible.
  - The label is in the correct language.
  - With `localStorage` blocked, the page still works and follows the OS
    theme.
- **Verify:**
  - Manual check.
  - DevTools → Rendering → Emulate `prefers-color-scheme`.
  - DevTools Console: `localStorage.removeItem('theme')`, then reload.
  - Restart `jekyll serve` (because of the `_data/` change).

#### T2 completion log

**Files changed**

- `_includes/navigation_section.html`: real `<button type="button"
  id="theme-toggle" aria-pressed="false" aria-label/title="{{ nav.theme_toggle }}">`
  with `fa-moon` + `fa-sun` icons (`aria-hidden="true"`), placed first in
  `.nav-controls`.
- `_data/navigation.yml`: `theme_toggle` (EN/IT) **and** `scroll_top`
  (EN/IT) — the second key was needed for the scroll-to-top `button-name`
  fix listed below.
- `_data/footer.yml`: new `email` label (EN/IT) for the footer mail icon.
- `_layouts/default.html`: `<html … data-scroll-top-label="…">`; the two
  media-scoped `theme-color` metas replaced by a single
  `<meta name="theme-color" id="theme-color">` whose `content` the pre-paint
  script (and `applyTheme()`) set from the *resolved* scheme.
- `assets/js/script.js`: `THEME_COLORS`/`getTheme()`/`getStoredTheme()`/
  `applyTheme()`/`setupThemeToggle()`; the dead commented
  `createThemeToggle()` block deleted; `setupThemeToggle()` first in `init()`;
  scroll-to-top button gets `aria-label` from `data-scroll-top-label` and an
  `aria-hidden` icon.
- `assets/css/style.css`: `.theme-toggle` (36×36, pill, focus ring,
  icon swap), `.nav-controls` gap, `.nav-logo` truncation guard, contact-grid
  regression fix (see below), `≤480px` and `≤360px` nav adjustments.
- `_includes/footer_section.html`: `aria-label` on all five social links,
  `aria-hidden` on their icons.

**Behaviour implemented**

- Active scheme lives on `<html data-color-scheme>`; `light` is the `:root`
  default, `dark` is `[data-color-scheme="dark"]`.
- Click → `applyTheme()` sets the attribute, `aria-pressed`, the
  `theme-color` meta and stores `theme` in `localStorage` (inside
  `try/catch`).
- No stored choice → the page follows the OS live through a `matchMedia`
  change listener; a stored choice stops that following.
- `themechange` is dispatched on **`window`** with
  `detail: { scheme }`, matching `createParticles()`'s listener (the binding
  contract recorded in T1). Exactly one event per click was asserted.

**Deviations from the plan text above**

- The hamburger already had `aria-label="Menu"`, `role="button"` and
  `tabindex="0"`, so it never failed `button-name`; the only `button-name`
  failure in Lighthouse was `body > button.scroll-to-top`, fixed via
  `data-scroll-top-label`. The hamburger's real gap is keyboard
  *activation* (no keydown handler) and inline `style.transform` bars, which
  belong to T3 — see the T3 note added below.
- `theme-color` was changed from two media-scoped metas to one JS-managed
  meta: CSS/HTML metas cannot read `localStorage`, so the two-meta approach
  made the browser UI color disagree with an explicitly chosen theme.

**Verification (all executed, 2026-10-24)**

- `togglecheck.mjs` (CDP, real key events): **25/25 checks pass** (25 at that
  point; 3 more were added in review round 2, which is why later runs report
  28/28) —
  first visit follows the OS in both directions, stored choice beats the OS
  and is applied *before `<body>` exists* (`window.__schemeAtBody`), click
  flips + persists + updates `aria-pressed`/`theme-color`/computed
  background, one `themechange` on `window` with the new scheme, survives
  reload and the EN→IT switch, Italian label, real `<button type="button">`
  focusable with a visible focus ring, Space toggles, live OS following
  while no choice is stored and stopped once one is, and storage-blocked
  mode still follows the OS and toggles in-session.
- `overflow.mjs` (strict, `mobile: false`): `docW == innerW` at
  **320/375/768/1024/1440 for EN and IT in both themes** (20 combinations).
- `contrast.mjs` (reveal-forced): **0 failures / 310 elements** for
  EN+IT × light+dark.
- Lighthouse accessibility: **0.95** on `/en/` and `/it/` (was 0.89). Only
  `heading-order` (contact `h4`, owned by T5) and `link-name` on
  `.project-link` (owned by T9) remain; `button-name` is gone.
- `jekyll build` and `jekyll _3.10.0_ build -d <temp>` both succeed; both
  outputs contain the toggle, `data-scroll-top-label`, exactly one
  `theme-color` meta, and no `/plans` link. `_site/plans` absent;
  `git diff --quiet -- apps/piano` exits 0.

#### Regressions found and fixed while verifying T2

- **Contact grid (320px).** The new 16px base font made
  `.contact-content`'s `1fr 1fr` tracks refuse to shrink below min-content,
  so the document was 334px wide at a 320px viewport. Fixed with
  `minmax(0, 1fr)` (base **and** `≤768px` rules), `min-width: 0` on
  `.contact-info`/`.contact-form`/`.contact-details`, and
  `overflow-wrap: anywhere` on `.contact-details` for the long email.
- **Navbar at 320px.** Logo + toggle + language switch + hamburger left the
  logo with 147px, while "> Simone Del Grosso" needs 161px, so it wrapped
  onto two lines. `.nav-logo` now never wraps (`nowrap` + `hidden` +
  `ellipsis` + `min-width: 0`) as a safety net, `.nav-controls` gap drops to
  `--space-8` and the logo to 16px at `≤480px`, and at `≤360px` the purely
  decorative `"> "` prefix is dropped and the logo drops to 15px. Result at
  320px: the **full name fits (137px of 147px)** in EN and IT, both themes,
  with the ellipsis still there for anything narrower.
- **Tooling false negative (corrects T1).** The T1 claim that the layout
  had no horizontal overflow at 320px was produced with `shot.mjs`, which
  uses mobile emulation; Chrome silently widens `innerWidth` to fit
  overflowing content, so `scrollWidth <= innerWidth` was vacuously true.
  `overflow.mjs` (desktop metrics, no auto-fit) is now the tool of record
  for width checks, and it is what caught the contact-grid regression.

#### Post-review fix, round 1 (independent review of T1+T2, 1 P3)

- **Finding:** `--font-weight-bold` is 700, but Inter is requested at
  400/500/600 only, so three rules that resolve 700 against the *body* font
  silently rendered at 600 — `.nav-logo`, `.lang-link.active`,
  `.stat-number`. No visual regression (they rendered at 600 before the
  restyle too), but the token promised something the font stack could not
  deliver, and any future body-text consumer of the token would inherit the
  same silent fallback.
- **Fix (chosen to keep the 6-weight budget and the approved look):** the
  three rules now say `--font-weight-semibold`, `.lang-link.active`'s
  no-op `font-weight` was removed (the active state is conveyed by the
  accent pill and text color), and the token block plus the risks section
  document that 700 is display-family only. Adding `;700` to the Inter
  request was rejected: it costs two more font files for no design need.
- **Verified after the fix:** computed styles are `600 / Inter` for
  `.nav-logo`, `.lang-link.active` and `.stat-number`, and `700 / Plus
  Jakarta Sans` for `.hero-title`, `.section-title` and `h3` — i.e. the
  change is a no-op visually and the remaining three
  `var(--font-weight-bold)` consumers are all display-font headings.
  Re-ran `overflow.mjs` (320/375 × EN/IT × light/dark: clean),
  `contrast.mjs` (0 failures / 310 × 4 combinations), and both Jekyll
  builds (structure all `True`, `_site/plans` absent, `apps/piano` clean).

#### Post-review fix, round 2 (independent review of T1+T2, 2 P3 + 2 minor)

- **P3 — filter badge glowed green under the indigo accent.** `.filter-badge.active`
  used `rgba(var(--color-success-rgb), 0.25)` for its shadow, so the activated
  project-filter pill had an emerald glow while every other active state uses
  the indigo accent. The rule itself predates this work, but the T1 accent
  change is what made it visibly inconsistent. Fixed to
  `color-mix(in srgb, var(--portfolio-primary) 35%, transparent)`, matching the
  pattern `.lang-slider` already uses. Verified by clicking a filter in both
  themes: dark `bg rgb(129,140,248)` + shadow
  `color(srgb 0.506 0.549 0.973 / 0.35)`, light `bg rgb(79,70,229)` + shadow
  `color(srgb 0.310 0.275 0.898 / 0.35)`, i.e. the accent and nothing else.
  *Measurement caveat:* `.filter-badge` has `transition: all 0.25s`, so reading
  `getComputedStyle` immediately after the class change returns the
  pre-transition color (a transparent shadow). The first reading looked like a
  bug; re-measuring after the transition showed the fix.
- **P3 — toggle announced the wrong state between parse and
  `DOMContentLoaded`.** The button shipped `aria-pressed="false"` and only
  `setupThemeToggle()` corrected it. A short inline script at the end of
  `navigation_section.html` now syncs `aria-pressed` from the already-resolved
  `<html data-color-scheme>` as soon as the button is parsed. Covered by two
  new `togglecheck.mjs` assertions that sample the value at the moment the
  *next* section is parsed (dark reload → `true`, light reload → `false`).
- **Minor — `themechange` fired during the initial sync** even though nothing
  changed. `applyTheme()` now takes `notify` and `setupThemeToggle()` passes
  `false`; every real change (click, live OS change) still dispatches exactly
  one event on `window`. Covered by a new assertion
  (`window.__initThemeEvents === 0`).
- **Minor — missing trailing newlines** in `style.css`, `navigation.yml`,
  `_config.yml`, `footer_section.html` and `navigation_section.html`. All five
  now end with a newline; the only diff artefact is the removed
  `\ No newline at end of file` marker on the old side.
- **Self-inflicted regression, caught before finishing — do not repeat it.**
  The first version of the inline `aria-pressed` script sat directly after
  `</nav>`, i.e. as a `<body>` child. That shifted every section's index and
  **flipped `section:nth-child(odd)`**, so the alternating section backgrounds
  moved from `hero/education/experience/projects` to
  `about/certifications/skills/contact`. The script is now the last child of
  `<nav>`, where `display: none` keeps it out of layout and out of the
  `nth-child` count. Verified structurally: `body > script` is again exactly
  one element (`/assets/js/script.js`), `nav script` is the new inline block,
  and the first `section` is child 3 of `<body>` in the static HTML (child 4 at
  runtime once `#preloader` is prepended) — identical to the pre-change
  structure. **Any future `<body>`-level element must be checked against
  `section:nth-child(odd)`.**

**Verification after round 2 (executed):** `togglecheck.mjs` **28/28**;
`overflow.mjs` clean at 320/375/768/1024/1440 × EN/IT × light/dark;
`contrast.mjs` **0 failures / 311 elements** × 4 combinations;
`jekyll build` and `jekyll _3.10.0_ build` both exit 0, structure all `True`,
`_site/plans` absent, `apps/piano` clean; built CSS has the accent glow and no
`success-rgb` inside `.filter-badge.active`.

**Lighthouse flake, recorded honestly:** one `/en/` run out of six reported
`landmark-one-main` ("Document does not have a main landmark", a11y 93); the
other five runs (both languages, twice each) reported only `heading-order` and
`link-name` at a11y **95**. The finding is real but **pre-existing and
structural**: `_layouts/default.html` has no `<main>`, so both languages lack
the landmark — see the new T5 note. It is not caused by this change set, and
the audit fires only intermittently, which is why it never appeared during T1
or the first T2 round. Lighthouse alone cannot be trusted for this one; the
deterministic check is `document.querySelector('main') === null`.

### T3 – Navigation bar and language switcher
- [ ] **Objective:** Make the navbar translucent and blurred, with a hairline
  border on `.scrolled`, refined hover/active underlines, a polished pill
  language switch, and a cleaner mobile menu. The theme toggle must fit next
  to it.
- **Files:**
  - `style.css` navbar section at around lines 816–983, plus the mobile
    blocks
  - `script.js` hamburger inline transforms at around lines 41–66: move them
    into a CSS `.hamburger.active .bar` rule
- **Handoff from T2 (already in the tree, do not re-solve):**
  - `.theme-toggle` exists (36×36, pill, focus ring, icon swap). The icon
    rules need the doubled `.theme-toggle .theme-toggle__icon--*` selector
    because Font Awesome's `.fas { display: … }` loads after `style.css`.
  - 320px budget is tight: the 288px inner width is split into `.nav-controls`
    141px (toggle 36 + language switch 64 + hamburger 25 + two 8px gaps) and
    a logo that has 147px available but uses 137px after the `≤360px` rule.
    Only ~10px of slack, so any new control, padding or gap has to be paid
    for. `≤480px` sets the gap to `--space-8` and the logo to 16px; `≤360px`
    drops the decorative `.nav-logo::before` `"> "` and uses 15px so the
    full name fits. Keep `.nav-logo`'s `nowrap`/`ellipsis`/`min-width: 0` as
    the safety net.
  - The hamburger is `div role="button" tabindex="0" aria-label="Menu"`
    with **no keydown handler and no `aria-expanded`**: Enter/Space do
    nothing. Prefer converting it to a real `<button type="button">` with
    `aria-expanded`/`aria-controls="nav-menu"` over patching the div.
  - The scroll-to-top button and footer links already have accessible names;
    don't re-add them.
  - `navigation_section.html` now ends with a small inline script (inside
    `<nav>`) that syncs `aria-pressed` before the rest of the page is parsed.
    **Keep it inside `<nav>`**: as a `<body>` child it shifts
    `section:nth-child(odd)` and flips the alternating section backgrounds
    (this actually happened during T2 and had to be fixed).
  - Typography handoff: `.nav-logo` renders in Inter at 600 (body font), and
    `.lang-link.active` no longer bumps its weight — the active state is the
    accent pill + `--color-on-accent` text. If T3 wants a heavier wordmark,
    the correct move is `font-family: var(--font-family-display)` (which has
    a real 700 face), **not** `--font-weight-bold` on Inter, which would
    silently fall back to 600.
  - `themechange` is dispatched on `window`; the particles listener lives
    there. Don't move it.
- **Notes:**
  - Keep the `.lang-slider` positioning tied to `.en-active` and
    `.it-active`.
  - `#scroll-progress` stays above the navbar and uses the accent gradient.
  - Tap targets are at least 44px.
  - `.navbar.scrolled` currently adds a 1px border with no transition; make
    it animate with the rest of the scrolled state.
- **Acceptance:**
  - The active link updates while scrolling.
  - The hamburger opens and closes, and a link click closes it — **by mouse
    and by keyboard**, with `aria-expanded` reflecting the state.
  - EN/IT switching works.
  - The controls don't overflow at 320px in Italian.
  - The navbar is readable in both themes.
- **Verify:** manual check at 320, 375 and 1440 for both languages and both
  themes, plus `overflow.mjs` (320/375) and `navshot.mjs` for the 320px
  control budget.

### T4 – Hero section
- [ ] **Objective:** Refresh the hero:
  - fluid headline with gradient accent text
  - refined typing line and cursor
  - profile image with a soft gradient ring
  - stats as subtle cards
  - restyled buttons
  - theme-aware, quieter particles
- **Files:**
  - `style.css` hero at around lines 984–1162
  - `script.js` `createParticles()` at around lines 467–620: read
    `--particle-rgb` and `--particle-line-rgb` through `getComputedStyle`,
    re-read them on `themechange`, and lower the density a little
- **Notes:**
  - Keep `#typing-text`, `.cursor`, `.stat-number[data-target]`, `#contact-me`
    and the `../assets/imgs/photo.jpg` path.
  - The canvas stays `pointer-events:none` and behind the content.
- **Acceptance:**
  - Counters animate and typing runs.
  - Particles are visible but subtle in both themes and change color when the
    theme switches, without a reload.
  - The layout stacks cleanly at 768px and below.
  - The hero fits within 1440×900.
- **Verify:** manual check; Lighthouse for CLS, optional.

### T5 - Section shell (headers, spacing, alternating backgrounds)
- [ ] **Objective:** Give all sections the same header style (refined title,
  short accent gradient underline, muted subtitle), the same vertical rhythm,
  and subtly alternating surfaces.
- **Files:** `style.css` section styles at around lines 1163-1202 and
  `.container`, plus `_layouts/default.html` for the `<main>` landmark.
- **Also owns (assigned after the T1+T2 review):** the page has **no `<main>`
  landmark** — sections are direct children of `<body>` — which axe reports as
  `landmark-one-main` (flakily; 1 of 6 Lighthouse runs). Wrap the eight
  content sections (`hero` … `contact`, i.e. the includes between
  `navigation_section` and `footer_section`) in `<main id="main">` and, if it
  helps, a skip link. **Caution:** the alternating-background rules use
  `section:nth-child(odd)`, which counts `<body>`'s children, so wrapping
  changes every section's index. Either fix the parity as part of the wrap or
  replace `nth-child` with explicit per-section classes — do not wrap and
  leave `nth-child` in place. Note that the parity is already unstable at
  runtime: `createPreloader()` **prepends** `#preloader` to `<body>` and later
  removes it, so the pattern flips when it appears and flips back when it is
  removed. Moving to explicit classes is the more robust fix.
- **Acceptance:** Consistent across all sections in both languages and both
  themes. Long Italian titles wrap well at 375px. The alternating backgrounds
  still alternate after the `<main>` wrap, and
  `document.querySelector('main')` is non-null on both pages.
- **Verify:** manual scroll-through, plus
  `document.querySelectorAll('main').length === 1` on `/en/` and `/it/`.

### T6 – About and Education (timeline)
- [ ] **Objective:**
  - About highlights shown as icon chips.
  - Timeline with a thin gradient line, ringed dots, and raised cards.
- **Files:** `style.css` around lines 1203–1319.
- **Notes:** Keep the `.timeline-item` reveal driven by the observer. `.age`
  is filled by JS.
- **Acceptance:**
  - Items reveal on scroll.
  - The timeline becomes a single left-aligned column on mobile.
  - The grade line shows only when it exists.
- **Verify:** manual check.

### T7 – Certifications and Experience
- [ ] **Objective:**
  - Certification cards: equal height, icon in a tinted circle, pill badge.
  - Experience cards: clear company, period, role and location hierarchy,
    with an accent-bulleted achievements list.
- **Files:** `style.css` around lines 1320–1445.
- **Acceptance:**
  - Grids line up at 1024 and 1440 and stack at 375.
  - The hover lift is subtle with no scaling.
  - The hero certification count is still correct.
- **Verify:** manual check.

### T8 – Skills as simple tags
- [ ] **Objective:** Replace progress bars with pill tags grouped in category
  cards.
- **Files:**
  - `_includes/skills_section.html`: replace `.skill-item`, `.skill-bar` and
    `.skill-progress` with `<ul class="skill-tags" role="list"><li
    class="skill-tag">{{ subitem.name }}</li></ul>`, keeping the
    `.skills-grid`, `.skill-category` and `h3` wrappers
  - `assets/js/script.js`:
    - remove the `skillBars` constant (around line 16)
    - remove `animateSkillBar()` (around line 162)
    - remove the `.skill-progress` branch in the observer (around lines
      193–197) and from the selector (around line 212)
  - `style.css`:
    - remove `.skill-item`, `.skill-name`, `.skill-bar` and `.skill-progress`
      (around lines 1468–1491)
    - add `.skill-tags` (flex-wrap, gap) and `.skill-tag` (pill, hairline
      border, tinted accent background, hover accent border)
    - fix `.skills-grid`: `minmax(350px,1fr)` overflows at 320px, so use
      `minmax(min(100%, 280px), 1fr)`
- **Notes:**
  - `_data/skills.yml` is **not changed**. `value` is simply no longer
    rendered, so the content stays backward compatible and the bars could be
    restored.
  - Search for leftover references:
    `rg "skill-progress|skill-bar|data-skill|animateSkillBar" _includes assets _layouts`
    should return nothing.
- **Acceptance:**
  - All 11 skills appear as tags under the right translated category titles
    in EN and IT.
  - No JS console errors.
  - No overflow at 320px.
  - Tags are readable in both themes.
- **Verify:** `jekyll build`, the `rg` command above, then a manual check.

### T9 – Projects
- [ ] **Objective:** Refine project cards (gradient icon panel, overlay link,
  category, title, description, tech pills) and the filter pill group.
- **Files:**
  - `style.css` around lines 1492–1633
  - `script.js`: remove the inline hover transform at around lines 816–826
    and move hover into CSS. Check that the filter logic at around lines
    750–772 and the observer reveal (inline opacity/transform) still work
    with the CSS transforms.
  - `_includes/projects_section.html`: add `rel="noopener noreferrer"` and
    `aria-label` to the GitHub link
- **Acceptance:**
  - The All, Mobile and Web filters work.
  - `aria-pressed` toggles.
  - Hover is smooth.
  - The overlay link can be reached with the keyboard, and focus is visible.
- **Note from T2 review:** the `.filter-badge.active` glow was changed from a
  success-tinted shadow to
  `color-mix(in srgb, var(--portfolio-primary) 35%, transparent)` because the
  green glow clashed with the indigo accent. If T9 introduces a real glow
  token, move this value into it. Remember `.filter-badge` has
  `transition: all 0.25s`, so computed-style checks must wait for the
  transition before reading the result.
- **Verify:** manual check, including Tab navigation.

### T10 – Contact and Footer
- [ ] **Objective:** Contact rows as elegant cards; a refined form (larger
  inputs, soft borders, accent focus ring); a minimal footer with refined
  social icons.
- **Files:**
  - `style.css` around lines 505–575 and 1634–1743
  - `_includes/footer_section.html`: add `aria-label`s and
    `rel="noopener noreferrer"`
- **Notes:** Keep the `mailto:` submit behaviour.
- **Acceptance:**
  - Required-field validation works.
  - Submitting opens the mail client.
  - Focus states are visible in both themes.
- **Verify:** manual check.

### T11 – JS-generated UI and reduced motion
- [ ] **Objective:**
  - Restyle the preloader, the scroll-to-top button and the scroll progress
    bar with tokens, moving the preloader's inline CSS into classes.
  - Add `prefers-reduced-motion` support in CSS and JS: no particles, typing
    shows the full text at once, counters jump to their final value, and
    smooth scroll is off.
- **Files:**
  - `style.css`: add an `@media (prefers-reduced-motion: reduce)` block
  - `script.js`: `createPreloader` (around line 356),
    `createScrollToTopButton` (around line 336), `createParticles`,
    `typeEffect`, `animateCounter`
- **Acceptance:**
  - With reduced motion emulated, nothing animates that isn't essential.
  - The preloader matches the active theme, with no dark flash in light mode.
  - The preloader is gone within about 1 s after `load`.
- **Verify:** DevTools → Rendering → Emulate `prefers-reduced-motion`.

### T12 – Responsive and cross-browser QA
- [ ] **Objective:** Final polish across breakpoints. Add a 1024px breakpoint
  if needed.
- **Files:** `style.css` responsive blocks at around lines 1813–1931.
- **Acceptance:**
  - No horizontal scroll at 320, 375, 768, 1024 or 1440 in both themes and
    both languages.
  - Chromium and Firefox are consistent. Check Safari/iOS if available.
- **Verify:** manual comparison with the T0 screenshots; Lighthouse
  Accessibility ≥ 95 is optional.

### T13 – Update AGENTS.md
- [ ] **Objective:** Make the repository instructions match reality and the
  new features.
- **Files:** `AGENTS.md` only.
- **Changes:**
  - Key Commands: `jekyll serve --livereload` and `jekyll build`, with a note
    that there is no Gemfile, so `bundle exec` doesn't apply. Mention
    `jekyll _3.10.0_ build` as a GitHub Pages parity check, and that
    `htmlproofer` needs `gem install html-proofer`.
  - Testing Checklist: use the same commands.
  - Add short notes:
    - the theme toggle (`data-color-scheme` on `<html>`, `localStorage` key
      `theme`, light and dark token blocks in `style.css`)
    - skills render as tags; `value` is unused
    - prefer semantic tokens over hard-coded colors
    - **where the verification tooling lives** (raised in the T2 review): the
      headless-Chrome probes (`togglecheck.mjs`, `overflow.mjs`,
      `contrast.mjs`, `navshot.mjs`) are **not** in the repo — they live in
      `%LOCALAPPDATA%\Temp\opencode\` and will not exist for future
      contributors. Document what each one checks and that width checks must
      use desktop metrics, not mobile emulation. Decide with the user whether
      to commit them (e.g. under `tools/`, excluded from the Jekyll build) or
      keep them out and just document their role.
- **Acceptance:**
  - Every command in AGENTS.md runs successfully in this repo as documented.
  - The rest of the content is preserved.
- **Verify:** run `jekyll build` exactly as written in AGENTS.md; review with
  `git diff AGENTS.md`.

### T14 – Final build verification and cleanup
- [ ] **Objective:** Confirm the production build and the scope of the diff.
- **Notes:** Remove dead CSS only after confirming with `rg` that nothing in
  `_includes/` or `script.js` uses it.
- **Also owns (assigned after review):** cache-busting the CSS/JS links in
  `_layouts/default.html` with a `?v=` query (for example
  `?v={{ site.time | date: '%s' }}`) so a cached old `style.css` or
  `script.js` can't be paired with new HTML after a deploy.
- **Also owns (assigned after the T1+T2 review):** the page-background hexes
  `#f8f9fb` / `#0b0d12` currently live in three places — the CSS tokens, the
  `COLORS` map in the head pre-paint script, and `THEME_COLORS` in
  `script.js`. Nothing enforces sync. The head script must keep literals (it
  runs before the stylesheet is guaranteed to be available), but
  `applyTheme()` can read `--color-background` via `getComputedStyle` and
  drop `THEME_COLORS`, leaving two sources instead of three. Re-run
  `togglecheck.mjs` afterwards.
- **Acceptance:**
  - `jekyll build` exits 0. The parity build with `jekyll _3.10.0_` also
    exits 0.
  - The structure check returns all `True`.
  - The only data change is the two new `theme_toggle` keys.
  - `apps/piano/` is unchanged.
- **Verify:**
  ```powershell
  jekyll build
  jekyll _3.10.0_ build -d "$env:LOCALAPPDATA\Temp\opencode\site-gh"
  Test-Path _site/en/index.html, _site/it/index.html, _site/assets/css/style.css, _site/sitemap.xml, _site/feed.xml, _site/apps/piano/index.html
  git diff --stat
  git diff --quiet -- apps/piano; $LASTEXITCODE        # expect 0
  git diff -- _data                                     # expect only theme_toggle additions
  ```

## 9. Risks, edge cases and failure modes

- **JS/CSS coupling:** renaming hooks breaks features. The hook list in
  section 4 is frozen. The only intended removal is the skill-bar hooks in T8.
- **Theme regressions:**
  - hard-coded colors, JS inline colors (particles, preloader, console) or
    `--portfolio-dark` used as a background can leave dark blocks in light
    mode
  - if the body attribute is left in place, it overrides the `<html>`
    attribute
  - Mitigation: T1 token sweep, T2 attribute move, and checking every task
    in both themes.
- **Wrong-theme flash:** the theme must be set by an inline script before the
  CSS loads. Without JS (`noscript`), the page falls back to the `:root`
  tokens, so make sure `:root` defaults are a complete, readable theme.
- **`localStorage` unavailable:** must not throw (`try/catch`).
- **Jekyll versions differ:** local is 4.4.1, GitHub Pages is 3.10. Keep
  Liquid simple; run the parity build in T14.
- **Italian strings are longer** and can overflow in the nav controls, which
  now have three controls, and in badges. Test `/it/` at 320px.
- **Fonts:** FOUT or layout shift. Limit to 2 families and 6 weights, use
  `display=swap`, and keep good fallbacks. Because the budget stops Inter at
  600, `--font-weight-bold` (700) is **only** valid on the display family:
  body-font elements must use up to `--font-weight-semibold`, otherwise the
  browser silently substitutes the 600 face (a latent trap, not a visual
  bug — this was the one finding of the T1+T2 review).
- **Performance:** limit blur to the navbar and lower the particle density.
  Particles are off under reduced motion.
- **Caching:** an old `style.css` or `script.js` cached by the CDN can pair
  with new HTML, for example the toggle button without its JS. **Owned by
  T14:** add a `?v=` query to the CSS and JS links in `default.html`.
- **Backward compatibility:**
  - URLs, anchors, `hreflang` and the redirect are unchanged
  - `skills.yml` is unchanged
  - the only data change is new `navigation.yml` keys
  - visitors whose OS is set to light now see light mode by default (A5)

## 10. Security and privacy notes

- No new third-party origins; the fonts change stays in the existing Google
  Fonts request. Self-hosting fonts is a possible follow-up for the Google
  Fonts privacy (GDPR) concern.
- Keep the Font Awesome SRI.
- Add `rel="noopener noreferrer"` to `target="_blank"` links (T9, T10).
- `localStorage` stores only `theme=light|dark`. No personal data and no
  consent banner needed.
- The inline head script is static, with no user input and no `innerHTML`.
  If a CSP is ever added, it will need a hash for this script.
- **Noticed, out of scope:**
  - the static `sitemap.xml` may override `jekyll-sitemap`
  - `AGENTS.md` and the READMEs are published to `_site`
  - possible follow-up: add a Gemfile with `github-pages`
  - `plans/` is now excluded from the build (done in T1) because the plan
    would otherwise be published

### Pre-existing issues found during T0/T1 verification (for later tasks)
- Lighthouse `button-name`: **fixed in T2** for the scroll-to-top button
  (`data-scroll-top-label`). `#hamburger` never failed it (it already had
  `aria-label="Menu"`, `role="button"`, `tabindex="0"`); its remaining gap
  is keyboard *activation* and `aria-expanded`, owned by T3.
- Lighthouse `link-name`: **fixed in T2** for the five footer social links
  (`aria-label` + `aria-hidden` icons). The remaining `link-name` failure is
  `.project-link` (T9).
- Lighthouse `heading-order`: a heading level is skipped somewhere in the
  page (T5). Confirmed by Lighthouse: the contact items use `<h4>`.
- **No `<main>` landmark** (found in the second review round): sections are
  direct children of `<body>`, so axe's `landmark-one-main` fails. Lighthouse
  reports it only intermittently (1 of 6 runs), so it slipped past T1/T2.
  Assigned to **T5**, together with the `section:nth-child(odd)` caution.
- `100vh` on `.hero` produces a large blank band under the fixed navbar on
  short/mobile viewports (T4).
- `.skills-grid` uses `minmax(350px, 1fr)`, which overflows below 350px
  (T8).

## 11. Overall acceptance criteria

1. A modern, elegant look in **both** light and dark themes, with a coherent
   indigo accent, the new fonts, and consistent cards and spacing. The user
   approves it against the T0 baseline.
2. Section order, nav items, content, URLs and language switching are
   unchanged.
3. Every interaction works: mobile nav, active link, typing, counters,
   project filters, contact mailto, scroll-to-top, scroll progress, EN/IT
   switch, and the theme toggle with persistence.
4. Skills show as tags in EN and IT, with no leftover bar code.
5. No overflow from 320 to 1440px. WCAG AA contrast in both themes. Reduced
   motion is respected.
6. `jekyll build` succeeds, and so does the 3.10 parity build. AGENTS.md
   commands are accurate.

## 12. Summary

- **Scope:** a CSS-led restyle with an indigo accent and Plus Jakarta Sans
  plus Inter fonts, a real light/dark toggle, skills as tags, small JS
  cleanups, and corrected AGENTS.md commands. Structure, content and URLs are
  unchanged.
- **Main risks:** colors that don't adapt to light mode, a wrong-theme flash
  on load, broken JS hooks, Italian text overflow in the nav, and no
  automated tests (verification is a build plus manual checks).
- **First recommended task:** T0 (baseline screenshots), then T1 (design
  tokens for both themes). T1 is what makes T2 and every later section task
  work in both themes.
- **Current state (2026-10-24):** T0, T1 and T2 are complete and verified.
  The page now has the indigo palette, Plus Jakarta Sans headings, both theme
  token sets, the theme resolved before paint on `<html>`, and a working
  accessible theme toggle in the navbar. Section-level restyling starts at T3.
