# Plan: Modern & elegant restyle of the portfolio

Status: **In progress.** Created 2026-10-24. Revised 2026-10-24
after the user answered the open questions.
Completed: **T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13**. Next: **T14**.
Previous plan: none (`plans/` did not exist before this file).

## 0. Progress log

| Task | Status | Verified by |
|---|---|---|
| T0 – Baseline capture | **Done** | `jekyll build` + headless screenshots at 375/768/1024/1440 for EN/IT (light and dark); console showed only the 3 expected `console.log` greetings, no errors. |
| T1 – Design tokens, fonts, theme token sets | **Done** | Builds (Jekyll 4.4.1 + 3.10.0), screenshots in both themes at 320/375/768/1024/1440 for EN/IT, computed-style checks, theme-resolution matrix, reveal-forced contrast audit (0 failures, 4 combinations), Lighthouse a11y 0.89. |
| T2 – Theme toggle | **Done** | `togglecheck.mjs` **28/28** (OS following, persistence, no-flash, ARIA correct before parsing, no init event, live OS follow, storage blocked, Space key, IT label); strict overflow audit clean at 320/375/768/1024/1440 for EN+IT in both themes; contrast 0 failures; Lighthouse a11y **95** EN+IT; both Jekyll builds clean. Two independent review rounds: 2 P3 + 2 minor in round 2, all fixed and re-verified. See the T2 completion log. |
| T3 – Navbar and language switcher | **Done** | `navprobe.mjs` at 320/375/1440 × EN/IT (menu offset == navbar height, `aria-expanded` round-trip, scroll lock, Escape + focus return, closed menu out of the tab order); `navcheck.mjs` (Enter/Space/Escape with real key events, 44px hit-area hit tests, scrolled glass + hairline, per-theme computed styles); `navflow.mjs` (real mouse clicks: open → link click → closed + scrolled + focus returned; open → resize past the breakpoint → unlocked); `overflow.mjs` clean at 320/375 × EN/IT × light/dark; `contrast.mjs` 0 failures / 311 elements × 4 combinations; Lighthouse a11y **93** EN+IT with no new failures (the three remaining are the pre-existing `heading-order`, `landmark-one-main`, `.project-link` `link-name`; `label-content-name-mismatch` was **removed**); both Jekyll builds clean. See the T3 completion log. Six P3s from independent reviews (dead reduced-motion override; focus lost to `<body>` when the drawer closed by widening; no focus containment while the drawer is open; stale focus tracking; over-broad `inert` cleanup; anchor measured while the drawer's scroll lock was still applied, plus the navbar's scrollbar compensation snapping) fixed and re-verified. |
| T4 – Hero section | **Done** | `heroprobe.mjs` 16 runs (1440×900 / 768×900 / 375×800 / 320×700 × EN/IT × light/dark): hero 880 at 1440/768, indicator hidden ≤768 and never overlapping the stats, ring `8px` + image 284/240/216, typing advances, counters reach 3/1/3 (after a scroll at 375/320, where the last cards start below the fold), particles 1516–3594 px and recolour on toggle in every run, 0 console/page errors; `overflow.mjs` clean at 320/375 × EN/IT; `contrast.mjs` 311 scanned / 0 failures × 4; `navprobe.mjs` + `navcheck.mjs` unchanged after moving the navbar's `backdrop-filter` to the scrolled/drawer states (documented deviation); Lighthouse `/en/` a11y **93**, CLS **0.002**. See the T4 completion log. |
| T5 - Section shell | **Done** | `shellprobe.mjs` 16 runs (1440/768/375/320 × EN/IT × light/dark): exactly one `<main>` (child of `<body>`), **0** heading-order skips, the section backgrounds equal the intended base/alt pair **both while `#preloader` is present and after it is removed**, no `.section-title` overflow (all seven fit on one line at 375/320 in both languages), contact `h3` at 19px, 0 console/page errors; real-key-event skip-link flow (one Tab → visible at 8/8, Enter → `#main` focused, `scrollY` 0); `shellnav.mjs` section `offsetTop == rectTop` with `offsetParent = BODY` and the active nav link correct after the wrap; `overflow.mjs` clean at 320/375 × EN/IT × light/dark; `contrast.mjs` 312/313 scanned / **0 failures** × 4; `navprobe.mjs` + `navcheck.mjs` unchanged (focus return, 44px hit areas, scrolled glass) with the skip link now the first tab stop; Lighthouse a11y **0.96** EN+IT - `landmark-one-main`, `heading-order` and `skip-link` now pass, only the pre-existing `.project-link` `link-name` (T9) remains; Jekyll 4.4.1 and 3.10.0 builds clean. See the T5 completion log. |
| T6 - About and Education | **Done** | `t6probe.mjs` **16/16** runs (1440/768/375/320 × EN/IT × light/dark): items hidden before (`is-pending`, opacity 0) and revealed on scroll (opacity 1, `transform: none`, mid-transition 0.72-0.87 at 150ms), no-JS shows both items at opacity 1, reduced motion keeps `transition: none` but still reveals; 3 chips at a uniform 40px with `9999px` radius and 26×26 icon dots; desktop cards staggered, ≤768 a single left-aligned column (66-344 at 375, 66-289 at 320); dot 12px with two rings, 2px centred spine, card `box-shadow` present, 2 grade lines per page, 0 console/page errors; `t6head.mjs` odd-card header/pill inside the card at 375-1280 (EN/IT); `t6noio.mjs` (IntersectionObserver deleted) leaves both items visible; `t6bg.mjs` confirms the card sits one step above the alt section in both schemes; grade guard proven on a throwaway copy (EN 1 / IT 2 with one `grade:` removed); `overflow.mjs` clean at 320/375 × EN/IT × light/dark; `contrast.mjs` 312/313 scanned / **0 failures** × 4; Jekyll 4.4.1 build clean. Lighthouse not re-run (not installed in this session); contrast covered the changed surfaces. See the T6 completion log. |
| T7 - Certifications and Experience | **Done** | `t7probe.mjs` **16/16** runs (1440/1024/768/375 × EN/IT × light/dark): 3 columns at 1440/1024 (400px / 309.66px each), 2 at 768, 1 at 375; every row has equal card heights and **identical badge tops**; icon 56×56 at `border-radius: 50%` on the accent tint in both schemes; badge is a 9999px pill (133×28, 600) narrower than the card; cards hidden before (`is-pending`, opacity 0) and revealed on scroll with **no inline styles**; 0 console/page errors; `t7shared.mjs` real mouse hover lifts a card exactly **2px with `scale: none`** and returns, project cards still reveal through the same path, and with `IntersectionObserver` deleted all certification and project cards stay visible; `t7wrap.mjs` on a throwaway copy with one deliberately long title: 2 lines at 1440 / 3 lines at 1024, heights still equal and badges still aligned; `t7count.mjs` hero counters read 3/1/3 (EN) and 3/1/3 (IT); reduced motion `transition: 0s` yet still reveals; `overflow.mjs` clean at 320/375 × EN/IT × light/dark; `contrast.mjs` 312/313 scanned / **0 failures** × 4; `t6probe.mjs` 16/16 unchanged (timeline untouched); **`t7classic.mjs` resolved the long-open 320px/316 classic-scrollbar overflow** (`.certifications-grid` `minmax(300px,1fr)` → `minmax(min(100%,300px),1fr)`; `docW` 316 → 305 == `clientWidth`); Jekyll 4.4.1 and 3.10.0 builds clean, `_site/plans` absent. See the T7 completion log. |
| T8 - Skills as simple tags | **Done** | `t8probe.mjs` **16/16** runs (1440/1024/768/375 × EN/IT × light/dark): **11 tags in 3 categories** on every run with the expected translated titles (EN "Programming Languages / Frameworks & Libraries / Markup & Styling", IT "Linguaggi di Programmazione / Frameworks & Librerie / Markup & Styling"), all `<ul class="skill-tags" role="list">` with `list-style: none`, tags 92×35 pills at `9999px` with a non-transparent tint, 13px/500, none crossing its category card; 3 columns at 1440/1024, 1 at 375 (and 1 at 768, unchanged by the pre-existing override); **0 leftover `.skill-bar`/`.skill-progress`/`.skill-item`/`.skill-name`/`data-skill` references** in the built HTML; hover changes only border+colour (`rgba(15,23,42,.08)` → `#4f46e5`, geometry 92×35 unchanged); 320px with a classic scrollbar: `docW 305 == clientW`, no overflow, widest tag 264 < card 289; no-JS renders all 11 tags; 0 console/page errors; `overflow.mjs` clean at 320/375 × EN/IT × light/dark; `contrast.mjs` **0 failures** over 279/280 elements × 4 (down from 312/313 — the 33 bar/name/progress elements no longer exist); `t6probe.mjs` and `t7probe.mjs` still **16/16** after the observer selector change; Jekyll 4.4.1 and 3.10.0 builds clean, no bar markup in parity output, `_site/plans` absent. See the T8 completion log. |
| T9 - Projects | **Done** | `t9probe.mjs` **16/16** runs (1440/1024/768/375 × EN/IT × light/dark): one card, 420×410 (328×434 at 375), centred in the grid at every width (offset 0–0.5px), raised surface + shadow, 200px gradient image panel, 92px `50%` mark disc, overlay hidden at rest, link `aria-label="GitHub: …"` + `rel="noopener noreferrer"` + `target="_blank"` + 56×56 hit area, 4 tech pills at `9999px`/12px, 3 filter pills (`9999px`, ≥38px high, 13px), hierarchy 12/22/15px, hero projects target `1`, 0 console/page errors; **real-click filters** All→Mobile→Web→All toggle `aria-pressed` correctly (Mobile hides the single web card: display `none`), and **real Enter** on a focused filter does the same (`focusedBeforeEnter: mobile`); **real mouse hover** lifts `matrix(1,0,0,1,0,-4)` with `scale` untouched and raises the overlay 0→1, returning on leave; **real Tab walk** reaches `.project-link` with `:focus-visible` true, a `rgb(255,255,255) solid 2px` outline, overlay opacity 1 and the mark faded to 0; throwaway 4-project copy: 3-across at 1440 (equal 434px heights, tech pills on one line) / 2×2 at 1024 / 1 column at 768+375, filters Mobile=3, Web=1, All=4 with correct `aria-pressed`; 320px classic scrollbar `docW 305 == clientW` (card 273, 16–289); no-JS renders the card and the static `aria-pressed`; reduced motion `card 0s`; `overflow.mjs` clean ×8; `contrast.mjs` **0 failures** over 279/280 × 4; `t6probe`/`t7probe`/`t8probe` still **0 failures**; `t9focus2.mjs` cold-state focus (forced `.is-pending`) reveals the card at `opacity 1`/`translate none` with the scrim at `0s` **in the first frame**, and blurring no longer fades it out; `t9rm.mjs` proves reduced motion still zeroes the card transition in the focused **and** focused+hover states (`0s` / `property: none`, lift applied instantly) while normal hover still animates; Jekyll 4.4.1 and 3.10.0 builds clean, `_site/plans` absent. See the T9 completion log. |
| T10 - Contact and Footer | **Done** | `t10probe.mjs` **16/16** runs (1440/1024/768/375 × EN/IT × light/dark): 5 contact cards with 44×44 soft accent discs, 12px radius and shadows; the form has 4 controls at **45px** high with a **10px** radius, labels 13px, and a 44px submit; the footer renders 5 social discs (40px, `50%`, hairline), each with a label, `aria-hidden` glyph and `rel="noopener noreferrer"` on the four `target="_blank"` links (5 rels per page including the project link); contact grid 2 columns at ≥769, 1 at ≤768; `docW == clientW` everywhere; 0 console/page errors. **Focus** (real `:focus` on all four controls, both themes): accent border + `rgba(79,70,229,.35)`/`rgba(129,140,248,.45)` ring, `h 45`; focusing a contact link accents the card border and shows `:focus-within`. **Validation**: an empty submit is blocked natively (`valid false`, handler never runs, focus moves to `#name`); a filled submit runs the handler once, resets the form, stays in the same document and produces `Page.frameScheduledNavigation` → `mailto:simonedelgrosso@outlook.it?subject=Hello%20there&body=A%20message%20body.%0A%0A--%0ATest%20User%0A%3Ctest%40example.com%3E`. 320px classic: `docW 305 == clientW`; no-JS renders 5 cards, 4 inputs, 5 social links; Jekyll 4.4.1 + 3.10.0 clean, `_site/plans` absent. See the T10 completion log. |
| T11 - JS-generated UI and reduced motion | **Done** | `t11probe.mjs` / `t11extra.mjs` / `t11nav.mjs`, 0 failures. **Normal motion**: preloader observed with **no inline style**, `rgb(248,249,251)` in light and `rgb(11,13,18)` in dark (equal to the theme's page colour), removed **700 ms after `load`**; particle canvas present; typing runs (`cursorAnim: blink`); counters animate; smooth scroll is 1398 at 60 ms after clicking the button, then 0; the button is `visibility: hidden` at the top with no inline style and gains `.is-visible` after scrolling; progress bar advances (395.8px). **Reduced motion** (`prefers-reduced-motion: reduce`): preloader removed **305 ms after load**, **no canvas**, typing shows `Full-Stack Developer` immediately, `cursorAnim: none`, counters already at their targets (3/1/3), scroll is **instant** (0 at 60 ms), and every audited surface computes `1e-05s` for `transition-duration`/`animation-duration` (scroll-to-top, progress bar, skill tag, social link, stat, button) versus real values (0.25/0.05/0.15 s) without the preference. Drawer still opens/closes with `aria-expanded`, `nav-open` and focus return in both modes. Footer clearance: no overlap at 375 or 320 (`docW 305 == clientW`), and `t11clear.mjs` found none anywhere in 320–768. `contrast.mjs` 0 failures ×4; `overflow.mjs` clean ×8; `t6`/`t7`/`t8`/`t9`/`t10` probes all still 0 failures; Jekyll 4.4.1 + 3.10.0 clean. See the T11 completion log. |
| T12 - Responsive and cross-browser QA | **Done** | **Fixed two pre-existing responsive defects.** (1) Desktop-nav dead zone: the drawer only existed ≤768px, so at 769–899 (EN) / 769–999 (IT) the wordmark measured **0px** and `.nav-controls` sat **off-screen** (right 883–941 vs a 754–885 viewport). The drawer now covers ≤1024px (CSS split out of the layout block, `matchMedia` updated) with a 1025–1199px band at `gap: 8px`/15px. (2) The 320px wordmark clipped by 3px (132 vs 135); the ≤360px gutter is now 12px → **135/135**. Verified: `t12probe.mjs` swept 22 widths × 2 languages — **no document overflow, no truncation, no off-screen controls**, and the `accept` matrix (320/375/768/1024/1440 × EN/IT × light/dark) is **20/20**. `t12nav.mjs`: drawer opens/closes at 900 and 1024 with `aria-expanded` + focus return; inline nav at 1025/1100/1200; resizing 900→1100 while open closes it, clears `nav-open` and moves focus to a nav link. **Firefox 159 (WebDriver BiDi) 20/20** in both themes (via the `theme` storage key, since BiDi has no media emulation) with identical measurements; the drawer's geometry, `inert` on `main`/`footer`, scroll lock and Escape/focus return match Chromium (T3's open questions). Screenshots compared side by side at 1440/1024/375. `contrast.mjs` 0 failures ×4; `overflow.mjs` clean ×8; `t7classic` `docW 305`; `t6`–`t11` probes all still 0 failures; Jekyll 4.4.1 + 3.10.0 clean. Safari/iOS not checked (no device or engine available). See the T12 completion log. |
| T13 - Update AGENTS.md | **Done** | `AGENTS.md` rewritten: real commands (`jekyll build`, `jekyll serve --livereload`, `jekyll _3.10.0_ build --destination _site-3.10`), the no-Gemfile/`bundle exec` note (verified to fail), an `htmlproofer` install note, new **Theming** and **Layout notes** sections, a **Verification Tooling** table, and a pre-push checklist. **Every documented command was executed**: `jekyll build` 0, parity build 0, `static.mjs` 200, `overflow.mjs` 10/10 widths clean, `t12probe` 44 runs 0 problems, `contrast.mjs` 279 scanned 0 failures, and the `t6probe`→`t6-analyze` flow 0 failures. **Probes committed** (user-approved deviation from "AGENTS.md only"): 21 scripts in `tools/probes/`, all `node --check` clean, Chrome path overridable via `CHROME_PATH`. `_config.yml` now excludes `tools` and `AGENTS.md` — with the old list **`AGENTS.md` was being published** at `/AGENTS.md` (verified by an old-config build), now absent from both builds, as are `plans/` and `tools/`. `.gitignore` gains `_site-3.10/`. Review round fixed six P3s (static.mjs traversal, Node version, script-kind wording, PowerShell temp path, stale headers, t7classic scrollbar guard). See the T13 completion log. |

Verification tooling. As of T13 the reusable suite lives in **`tools/probes/`**
(committed, excluded from the Jekyll build, documented in `AGENTS.md`);
`overflow.mjs`, `contrast.mjs`, `static.mjs`, the T6–T11 `*probe`/`*-analyze`
pairs, `t12probe.mjs`, `t12edges.mjs`, `t12nav.mjs`, `t7classic.mjs` and the two
optional Firefox BiDi scripts are all there. The list below records the full set
as it was used during the restyle (temporary, in
`%LOCALAPPDATA%\Temp\opencode\`); entries not in `tools/probes/` were
screenshot or one-off evidence helpers that were deliberately not committed.
The list: `contrast.mjs` (reveal-forced contrast audit that does not rely on
Lighthouse), `overflow.mjs` (**strict** overflow audit, `mobile: false`,
the tool of record for width checks), `togglecheck.mjs` (theme-toggle
acceptance checks with real key events), `navshot.mjs` (clipped navbar
screenshots + nav metrics), `navprobe.mjs` (navbar geometry + mobile menu
state machine), `navcheck.mjs` (computed nav styles, hit-area hit tests,
keyboard activation, tab order), `navflow.mjs` (real mouse click flow and
breakpoint reset), `navstates.mjs` (scrolled / menu-open screenshots), and
the throwaway `bisect.mjs`/`chain.mjs`/`logofit.mjs` probes used to isolate
the 320px regressions.
T4 added: `heroprobe.mjs` (hero geometry, counters, typing, ring, stat cards and
canvas pixel sampling, plus a theme-toggle recolour check), `heromatrix.mjs`
(16-run viewport × language × scheme sweep), `shot.mjs` (viewport/full-page
screenshots with animations frozen), `bleedprofile.mjs` + `navbarbleed.mjs`
(vertical colour profile across the navbar edge with/without
`backdrop-filter`), `navblur.mjs` (computed `backdrop-filter` in the top,
scrolled and drawer-open states), `barcheck.mjs` + `overbisect.mjs` (what
overflows at 320px), and `static.mjs` (a tiny static server used to A/B the
working tree against a HEAD copy of `_site`).
T5 added: `shellprobe.mjs` (16-run landmark/heading-order/alternation sweep, with
the section backgrounds read **before and after** the preloader is removed, plus
a real-key-event skip-link flow), `shellrhythm.mjs` (header margins, title and
subtitle metrics, underline geometry, per-section padding and background),
`shellnav.mjs` (section `offsetTop`/`offsetParent` and nav-link highlighting
after the `<main>` wrap) and `shellshots.mjs` (section-header screenshots,
including the focused skip link).
T6 added: `t6probe.mjs` (16-run timeline reveal/chip/mobile sweep: opacity and
`transform` before, during and after the reveal, no-JS visibility, reduced
motion, dot geometry, card elevation), `t6-analyze.mjs` (reads the probe's
UTF-16 output), `t6shots.mjs` (About/Education clips at 1440/375 × light/dark),
`t6bg.mjs` (section vs card background per scheme), `t6head.mjs` (odd-card
header/pill containment at 769–1280) and `t6noio.mjs` (deletes
`IntersectionObserver` before the page scripts run).
T7 added: `t7probe.mjs` (16-run certification-grid/card sweep + experience
hierarchy, with no-JS and reduced-motion passes), `t7-analyze.mjs` (UTF-16
output reader and assertions), `t7hover.mjs` (forces `:hover` through CDP and
measures the lift), `t7shared.mjs` (real mouse hover on a card, the project
cards' shared reveal, and the no-`IntersectionObserver` path), `t7count.mjs`
(hero counter values), `t7shots.mjs`/`t7shots2.mjs` (certification and
experience clips at 1440/1024/375 × light/dark), `t7wrap.mjs` (badge
alignment when a title wraps, run against the throwaway `t7-longtitle` copy) and
`t7classic.mjs` (classic-scrollbar width audit that reads
`documentElement.clientWidth` instead of `innerWidth`, which is what finally
located the 320px/316 overflow).
T8 added: `t8probe.mjs` (16-run skills-tag sweep: category titles per language,
tag/category counts, pill geometry, list semantics, per-card containment,
columns, plus 320px classic-scrollbar, hover, no-JS and reduced-motion passes),
`t8-analyze.mjs` (UTF-16 reader and assertions; filters the zero-width tracks
`auto-fit` reports), `t8shots.mjs` (section clips at 1440/1024/375 ×
light/dark), `t8view.mjs` (plain viewport captures after `scrollIntoView`,
which avoids the clip-offset artefact `t8shots.mjs` hit at 375) and
`t8grid.mjs` (column map across every container breakpoint:
360/600/768/769/900/1023/1024/1279/1280/1440).
T9 added: `t9probe.mjs` (16-run card/filter sweep plus real-click filters,
real Enter on a focused filter, real mouse hover, a real **Tab walk** to the
overlay link, 320px classic-scrollbar, no-JS and reduced-motion passes),
`t9-analyze.mjs` (UTF-16 reader and assertions), `t9base.mjs` (before/after
section captures), `t9shots.mjs` (section clips at 1440/1024/375 × light/dark
plus hover), `t9focus.mjs` (keyboard-focused link in both themes),
`t9focus2.mjs` (cold-state focus: forces `.is-pending`, Tabs to the link and
measures the first frame), `t9rm.mjs` (reduced-motion × focus × hover matrix on
the card transition), `t9-multi.mjs` + `t9multi-probe.mjs` (throwaway
`t9-multi` copy with the three mobile projects uncommented, to prove the grid
with 4 cards and the Mobile/Web/All filters with 3+1), and `static.mjs` (tiny
static server, rebuilt after the temp cleanup removed the original).
T10 added: `t10probe.mjs` (16-run contact/footer sweep plus real focus on every
control in both themes, an empty-submit validation check, a filled submit whose
`mailto:` navigation is captured through CDP `Page.frameScheduledNavigation`,
320px classic-scrollbar, no-JS), `t10-analyze.mjs` (UTF-16 reader and
assertions), `t10base.mjs` (before captures and baseline metrics) and
`t10shots.mjs` (contact/footer at 1440/375 × light/dark plus focus and hover),
and `t10socialfocus.mjs` (the social disc's ring after the redundant override
was removed).
T11 added: `t11probe.mjs` (both motion modes: preloader sampled mid-life and
timed from the `load` event, canvas presence, typing, counters, smooth-scroll
distance 60 ms after a click, button visibility class, progress bar, footer
clearance at 375/320), `t11-analyze.mjs` (UTF-16 reader and assertions),
`t11extra.mjs` (dark-mode preloader background, computed durations in both
modes), `t11shots.mjs` (preloader, footer, button and top-of-page captures) and
`t11nav.mjs` (mobile drawer under reduced motion, since `navprobe.mjs` was
removed by the temp cleanup), plus `t11clear.mjs` (scroll-to-top vs social-row
clearance across 320–768px).
T12 added: `t12probe.mjs` (22-width × 2-language sweep of `docW`/`clientW`,
wordmark truncation, off-screen controls, computed nav gap/type, plus an
`accept` mode for the 20 acceptance combinations), `t12nav.mjs` (drawer
open/Escape at 900/1024, inline nav at 1025/1100/1200, and the resize-past-
breakpoint path), `t12navshots.mjs` (navbar strips across the old dead zone),
and `t12firefox2.mjs`/`t12firefox3.mjs`/`t12ffdrawer.mjs`/`t12ffshots.mjs`/
`t12crshots.mjs` (headless **Firefox 159 over WebDriver BiDi**: width matrix in
both themes via the `theme` storage key, drawer geometry, `inert`, and
side-by-side screenshots), plus `t12edges.mjs` (the 1023/1024/1025 and
1198/1199/1200/1201 band boundaries). A first attempt at measuring Firefox
through a same-origin iframe harness inside `_site` was discarded because
`firefox --screenshot` captures before the iframes finish loading.
Screenshots: `baseline\` (before), `t1-dark\`, `t1-light\`, `t1-final\`,
`t1-review*\`, `t1-320*`, `t2-light\`, `t2-nav\`, `navshots\`,
`navstates*\`, `hero-1440-*`, `hero2-*`, `hero3-*`, `t5shots\`, `t6shots\`,
`t7shots\`, `t7shots2\`, `t8shots\`, `t8views\`, `t9base\`, `t9shots\`,
`t9multi\`.

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
| Skills | `_data/skills.yml`: `items.{programming_languages, frameworks, markup}[]` with `name` and `value`, plus `translations.{it,en}.sections`. The bar is animated through `.skill-progress[data-skill]` → `animateSkillBar()` (around line 162) and the observer selector (around line 212). **As of T8 this is history**: the bars are replaced by `.skill-tag` pills, `animateSkillBar()` and the `.skill-progress` hook are gone, and `value` is no longer rendered (see the T8 log). |
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

### T3 – Navigation bar and language switcher ✅ Done (2026-10-27)
- [x] **Objective:** Make the navbar translucent and blurred, with a hairline
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

#### T3 completion log

**Files changed**

- `_includes/navigation_section.html`:
  - the hamburger is a real `<button type="button" aria-controls="nav-menu"
    aria-expanded="false" aria-label="{{ nav.menu }}">` (was
    `div[role=button][tabindex=0]` with a hard-coded English label and no
    keydown handler);
  - `.lang-switch` gets `aria-label="{{ nav.lang_selector }}"` (was
    hard-coded English on both languages);
  - the two `.lang-link`s get `aria-label="EN, English"` / `"IT, Italiano"`
    (see the a11y note below).
- `_data/navigation.yml`: `menu` and `lang_selector` for EN and IT.
- `assets/css/style.css`:
  - `.navbar` is transparent at the top, `backdrop-filter: blur(16px)
    saturate(180%)`, an always-present transparent 1px `border-bottom` that
    animates to `--color-border-subtle` on `.scrolled`, `padding: 12px 0`;
  - `body.nav-open` gets the glass treatment + `--scrollbar-width`
    compensation, and `overflow: hidden`;
  - `.nav-logo` switches to the display face at a real 700 with
    `letter-spacing: -0.01em`;
  - `.nav-link` is a 44px-tall `inline-flex` with a 2px gradient underline
    (`bottom: 6px`, `--radius-full`);
  - `.nav-controls` gets `min-height: 44px` so the navbar is a stable 69px at
    every breakpoint;
  - `.theme-toggle` and `.lang-switch` get 44px tap targets from an
    `inset: -4px` `::after` ring (they fit inside the 8px gaps and do not
    steal each other's clicks);
  - `.hamburger` is a reset `<button>` (25px wide, `min-height: 44px`,
    centred bars, visible `:focus-visible` ring); `.bar` is 2px tall with
    `currentColor`, and `.hamburger.active .bar:nth-child(n)` does the X
    (the inline transforms in `script.js` are gone);
  - `@media (max-width: 768px)`: the menu is anchored with `top:
    var(--navbar-height, 69px)`, slides with `transform: translateX()` instead
    of `right`, is `visibility: hidden` when closed (out of the tab order and
    the accessibility tree), has full-width 48px rows with a 4px gap, a
    `--color-secondary` active row, `overflow-y: auto` and
    `overscroll-behavior: contain`, plus `100vh`/`100dvh` fallbacks;
  - a navbar-scoped `prefers-reduced-motion` block for the bars, underlines and
    slider, plus a separate one at the end of the file for the mobile drawer
    (it has to come after the `max-width: 768px` block to win the cascade —
    see the post-review fix below). T11 will consolidate both.
- `assets/js/script.js`:
  - `setMobileNav(open, { returnFocus })` is the single state transition; it
    sets `aria-expanded`, the `.active` classes, `body.nav-open`,
    `--scrollbar-width`, and optionally returns focus;
  - `syncNavbarHeight()` measures `.navbar` into `--navbar-height`
    (`ResizeObserver`, `resize` fallback) instead of the hard-coded `59px`;
  - Escape closes and returns focus; a `matchMedia('(max-width: 768px)')`
    listener closes the menu and releases the scroll lock when the viewport
    grows, handing focus to the first nav link if it was on the hamburger
    (see the round-2 post-review fix); `closeMobileNav()` now also returns
    focus to the hamburger;
  - `setPageInert()` marks every `<body>` child except the navbar `inert`
    while the drawer is open, and a `Tab` handler wraps focus inside the
    navbar (round-3 post-review fix).

**Deviations from the plan text above**

- **The hamburger's tap target is 25×44, not 44×44.** At 320px the row has
  288px of inner width; the wordmark needs 135px, leaving 153px for
  `.nav-controls`, which already need 36 + 8 + 64 + 8 + 25 = 141px. Growing
  the hamburger to 44px would make the row 160px and truncate the name. The
  toggle and the language switch do reach 44×44 and 72×44 through their
  `::after` rings, and the hamburger is 44px tall; its 25px width still
  clears the 24px WCAG 2.2 AA target-size minimum. The arithmetic is recorded
  in a CSS comment next to `.hamburger` and in the mobile media query.
- **The navbar is 69px tall, not the 68px the plan assumed** (12px + 44px +
  the 1px hairline). `--navbar-height` is measured, so the menu still aligns
  exactly; the CSS fallback and the comments say 69px.
- **`.lang-link` labels changed** (`aria-label="EN, English"`). This was not
  in the plan: Lighthouse/axe `label-content-name-mismatch` (WCAG 2.5.3,
  Label in Name) was already failing at HEAD for both language links. axe
  compares **word tokens** and strips parentheticals, so `"English (EN)"`
  still fails; `"EN, English"` passes. This removes one pre-existing
  Lighthouse failure from the navbar instead of leaving it there.
- **Focus after a link click** is returned to the hamburger rather than lost
  to `<body>`, because the menu is `visibility: hidden` immediately after and
  a hidden element must not keep focus. Moving focus to the target section
  would need `tabindex="-1"` on the sections, which belongs to T5 (`<main>`).

**Verification executed (all after the final build)**

- `jekyll build` → exit 0; `jekyll _3.10.0_ build -d <temp>` → exit 0;
  `_site/en/index.html` and `_site/it/index.html` present, `_site/plans`
  absent, `git diff -- apps/piano` empty.
- `navprobe.mjs` (320/375/1440 × EN/IT, light): navbar 69px everywhere;
  `#nav-menu` top == navbar bottom (69) in both languages; closed menu
  `visibility: hidden`, open `visible`; `aria-expanded` `false → true →
  false`; `body.nav-open` + `overflow: hidden` only while open; Escape closes
  and focus lands on `#hamburger`; `scrollWidth == innerWidth` at every size;
  wordmark 135px at 320 (no truncation).
- `navcheck.mjs` (375 dark): `.scrolled` → `rgba(11,13,18,0.72)` +
  `rgba(255,255,255,0.08)` hairline + shadow, with
  `transition-property: background-color, border-color, box-shadow, padding`
  (`padding` was added in the round-5 fix so the drawer's scrollbar
  compensation animates instead of snapping);
  logo `"Plus Jakarta Sans"` at `700`; `--color-on-accent` `#0b0d12` on the
  `rgb(129,140,248)` slider; hit tests at ±3px around the toggle, the
  language switch and the hamburger all resolve to the intended control
  (no dead zones, no stolen clicks); Enter opens, Space closes, Escape
  closes; tab order from a fresh load is
  `theme-toggle → EN → IT → hamburger → contact-me`, i.e. the eight
  off-canvas links are correctly skipped.
- `navflow.mjs` (375, real mouse events): open → click "Skills" → menu
  closed, scroll lock released, `scrollY` 5072, focus back on the hamburger;
  re-open → resize to 1200px → closed and unlocked; **no console errors and
  no uncaught exceptions**.
- `overflow.mjs` (320/375 × EN/IT × light/dark): `docWidth == innerWidth`,
  no overflow; `.nav-controls` 163..304 at 320px (inside the 304px content
  edge) and the wordmark 135px.
- `contrast.mjs` (EN/IT × light/dark): **0 failures / 311 elements** each.
- Lighthouse accessibility: **93** on both `/en/` and `/it/` with exactly
  `heading-order`, `landmark-one-main` and `.project-link` `link-name`
  remaining — all three pre-existing and assigned to T5/T9. An A/B run at
  `HEAD` produced the **same four** audits *plus*
  `label-content-name-mismatch`, so T3 introduces no new Lighthouse failure
  and removes one. (The score wobbles between 93 and 95 because
  `landmark-one-main` fires intermittently; compare the failing audit list,
  not the number.)

#### Post-review fixes (two independent reviews of T3)

**Round 1 — 1 P3: the reduced-motion override for the mobile drawer was dead code.**
The navbar-scoped `prefers-reduced-motion` block sat *before* the
`@media (max-width: 768px)` block, so the drawer's later
`transition: transform …, visibility 0s linear …` shorthand reset
`transition-duration` back to 250ms (same specificity, later source order),
and `.nav-menu.active` out-specified the override outright. Net effect: with
"reduce motion" enabled the full-viewport menu still slid for 250ms, and the
closed state kept its links visible for another 250ms — contradicting the
T3 acceptance criterion "reduced motion is respected".
Fixed by removing `.nav-menu` from the early block (it only ever applied
there by accident) and adding a dedicated block at the **end of the file**
targeting both `.nav-menu` and `.nav-menu.active` with
`transition-duration: 0.01ms; transition-delay: 0s`, plus a comment saying
why the position matters. Verified with `rmprobe.mjs` (CDP
`Emulation.setEmulatedMedia` + `prefers-reduced-motion`), 375px EN:
- `reduce`: closed and open both report
  `transform, visibility | dur=1e-05s | delay=0s`; visibility flips on the
  next frame (~64ms measured, i.e. the CDP/rAF overhead, not 250ms).
- `no-preference`: unchanged `dur=0.25s, 0s | delay=0s, 0.25s` closed,
  `delay=0s, 0s` open; menu still opens/closes and `aria-expanded`
  round-trips.
- Desktop is unaffected: `.nav-menu` has no transition above 768px, so the
  new rule is inert there.

**Round 2 — 1 P3: focus dropped to `<body>` when the drawer closed by
widening past 768px.** `handleMobileNavBreakpoint` called
`setMobileNav(false)` with no focus handling, so a keyboard or screen-reader
user who had focus on the hamburger lost all context (measured: `BODY`).
Two things had to be established before fixing it, because the obvious patch
does not work:
1. **Focus on a menu link survives on its own.** Above the breakpoint the
   same `<a>` elements are laid out inline in the navbar and
   `visibility: hidden` no longer applies, so the element stays focusable
   (measured: `A#home` before *and* after the resize). Only the **hamburger**
   loses focus, because it becomes `display: none`.
2. **The handler cannot see the hamburger as focused.** At `change` time the
   browser has already blurred it: `document.activeElement` is `BODY` and
   `getComputedStyle(hamburger).display` is already `none` (measured with an
   in-page listener). So `setMobileNav(false, { returnFocus:
   navMenu.contains(document.activeElement) })` — the suggested fix — would
   never fire, and `hamburger.focus()` would be a no-op anyway.

Implemented instead: a `focusin` listener on the navbar records
`lastNavFocus` (the browser blurs before we are notified, so the state has to
be remembered); the breakpoint handler captures
`lastNavFocus === hamburger`, closes the drawer, and moves focus to the
drawer's first `.nav-link` with `focus({ preventScroll: true })` — the same
element the drawer listed first, visible inline on desktop, and the fixed
navbar means there is nothing to scroll to. Verified with `bpflow.mjs`
(375 → 1200) and `bpnosteal.mjs`:
- focus on the hamburger → after resize focus is `A#home` (was `BODY`);
- focus on a menu link → unchanged, still `A#home`;
- focus on the theme toggle → unchanged, still `#theme-toggle` (not stolen);
- **nobody ever touched the navbar** → focus stays `BODY`, i.e. the handler
  does not steal focus on a plain window resize;
- Escape (control) → still returns focus to the hamburger;
- `scrollY` 900 before and after in both the scrolled and unscrolled cases,
  so `preventScroll` does its job (no jump).
`navflow.mjs` now reports `afterResize.focused = "nav-link"` where it used to
report `""`, with **0 console and 0 page errors**; `navprobe.mjs`
(320/375/1440 × EN/IT) and `overflow.mjs` (320/375 × EN/IT) are unchanged and
clean.
*Known limit (superseded by the round-4 fix):* `lastNavFocus` was only cleared
by the handler, so a user who had focused the hamburger and then moved focus
outside the navbar could still get focus handed to the first link on a later
resize. Round 4 below fixes it.

**Round 2 — verification gap (acknowledged, not fixed here).** The 320px
control budget is evidenced only by probes living outside the repo, so a
later CSS change could regress it without any guard. `plans/plan.md` already
assigns "commit the verification tooling" to T13/T14; until then the numbers
in this log are reproducible only from `%LOCALAPPDATA%\Temp\opencode\`.

**Round 3 — 1 P3: the open drawer did not contain keyboard focus.** The
drawer is fullscreen, opaque and scroll-locked, i.e. it behaves modally, but
nothing kept focus inside it: `#nav-menu` precedes `.nav-controls` in the DOM,
so the hamburger is the last focusable in the navbar. The pre-existing
`navcheck.mjs` run (closed state) already showed the next focusable after the
hamburger is `#contact-me`, a hero CTA — so with the drawer open, Tab from the
hamburger walked into the content hidden behind it, and Shift+Tab from the
first drawer link wrapped to the footer links behind it. Fixed in
`setMobileNav()`, so every open/close path gets it for free:
- `setPageInert(open)` sets/removes `inert` on every `<body>` child except
  `nav#navbar` (11 elements: `#scroll-progress`, the eight sections, the
  footer, the scroll-to-top button). This covers pointer input *and*
  assistive tech, and it is what makes the hidden CTAs unfocusable.
- A `Tab` handler wraps the cycle inside the navbar
  (`navFocusables()` → the eight drawer links, then the theme toggle, EN, IT
  and the hamburger). It exists for engines that ignore `inert`, and to stop
  Tab from leaving the document for the browser chrome.
Verified with `openfocus.mjs` (375px EN, real mouse open, real Tab presses):
- open → 11 inert elements, `#navbar` and `#nav-menu` **not** inert;
- Tab from the hamburger → `nav-link #home` (the drawer's first row);
- full cycle: `#about … #contact → theme-toggle → EN → IT → hamburger →
  #home`, i.e. it never leaves the navbar;
- Shift+Tab from `#home` → hamburger;
- a programmatic `focus()` on the hero's `.btn--primary` while open is
  **blocked** by `inert` (the focus attempt is ignored);
- Escape → `inert` count 0, focus back on the hamburger, `aria-expanded`
  false;
- widening to 1200px while open → `inert` count 0, unlocked, collapsed;
- closed-state tab order unchanged (`theme-toggle → EN → IT → hamburger →
  contact-me`), so the closed drawer is still skipped;
- **0 console and 0 page errors**.
Re-ran `navcheck.mjs` (375 dark: scrolled glass, ±3px hit tests, Enter/Space/
Escape, closed tab order — all unchanged), `navflow.mjs` (open → Skills →
closed/scrolled/focus returned; resize → focus handed to the first link; 0
errors), `navprobe.mjs` (320/375/1440 × EN/IT) and `overflow.mjs`
(320/375 × EN/IT) — all unchanged and clean.

**Round 4 — 2 P3s (both latent-coupling issues in the round-2/round-3 code).**

*4a — stale `lastNavFocus` moved focus on a later resize.* `focusin` was
bound on the navbar only, so once the hamburger had been focused the value
survived after focus moved elsewhere; a later widening then pulled focus into
the nav with no user context. **Reproduced** (`focusevents.mjs`: focus the
hamburger, then a footer link, then widen → `activeElement` became
`A.nav-link`, i.e. focus was stolen from the footer). Fixed by moving the
recorder to `document` and storing `null` whenever focus lands outside the
navbar. That is safe for the round-2 hand-off because the breakpoint blur
fires `focusout` on the hamburger and **no** `focusin` on `<body>` — measured:
the widening event log is `["focusout:hamburger","focusin:A.nav-link"]`, the
second entry being our own hand-off. Re-measured after the fix: the footer case
logs `[]` and `activeElement` stays on the footer link, while the hamburger
case still lands on `A.nav-link`.

*4b — `setPageInert(false)` stripped `inert` from every `<body>` child.*
Idempotent today, but it would silently clear an `inert` set by any future
feature. Fixed by tracking only the elements this function made inert
(`inertedElements`) and skipping children that already carried the attribute,
so unwinding undoes exactly its own work.

Re-verified after both fixes: `openfocus.mjs` (11 inert elements, Tab cycle
`#about … #contact → theme-toggle → EN → IT → hamburger → #home`, Shift+Tab →
hamburger, inert CTA focus blocked, Escape → 0 inert + focus on the hamburger,
widen-while-open → 0 inert + unlocked, closed tab order unchanged, 0 console /
0 page errors), `bpflow.mjs` (all six cases unchanged), `bpnosteal.mjs`
(nobody focused → `BODY` stays `BODY`), `navflow.mjs`, `navprobe.mjs`
(320/375/1440 × EN/IT) and `overflow.mjs` (320/375 × EN/IT) — all clean.
Also worth recording: the reviewer's own re-derivation retracted a suspected
drawer-width bug (`padding-right: var(--scrollbar-width)` does not shrink the
`backdrop-filter` padding box the fixed drawer is positioned against), so
nothing was changed there.

`contrast.mjs` and Lighthouse were **not** re-run after any of the four
fixes: the diffs only touch transition durations/delays, the breakpoint focus
path and the open-state `inert`/Tab handling, none of which can change
colour, layout or accessible names in the states those tools measure (both
run with the drawer closed).

**Round 5 — 2 P3s (both about the drawer's scroll lock and the scrollbar).**
Both are only observable with a *classic* (space-taking) scrollbar, which is
why no earlier probe saw them: headless Chrome's default emulation has 0px
overlay scrollbars, so `body.nav-open { overflow: hidden }` never changed the
layout. Reproduced by calling
`Emulation.setScrollbarsHidden({ hidden: false })`, which yields a real 15px
scrollbar at every width tested (`window.innerWidth - clientWidth == 15`).

*5a — the anchor was measured while the page was still locked.* The nav-link
handler called `smoothScroll(targetId)` **before** `closeMobileNav()`. The
lock hides the scrollbar, so the content is 15px wider (measured: body width
700 → 685 unlocked, 15px `--scrollbar-width`), and the offset was read from
that layout and then reflowed away in the same task. Fixed by closing first
and scrolling second, with a comment explaining why the order matters, plus
`hamburger.focus({ preventScroll: true })` so returning focus cannot perturb
the animation that starts in the same task.
Verified with `scrollorder.mjs` at 600/700/760px (all three: classic 15px
scrollbar), spying on `window.scrollTo` without altering it:
- `scrollOrder` = `[{ locked: false, args: 1, top: 4608, behavior: "smooth" }]`
  at 700px — i.e. the page is **already unlocked** when the target is
  measured, and the options form of `scrollTo` is preserved;
- `scrollY == expected` at 600 (4637/4637), 700 (4608/4608) and 760
  (4608/4608) → drift 0;
- `scrollplain.mjs` at 375px (no instrumentation at all): the animation
  progresses 0 → 197 → 4192 → 5153 and settles exactly on `expected`.
*Honest note:* the very first run of `scrollorder.mjs` reported `scrollY: 0`.
That was a **bug in my probe**, not in the site — the spy called
`orig(a, b)`, which passes two arguments, so Chromium took the
`scrollTo(x, y)` path and treated the options object as `NaN`, jumping to 0,0
instantly (a plain control smooth scroll failed the same way, which is how it
was identified). With the arity preserved the results above are what the page
actually does. The underlying drift measured **0** even before the fix,
because the section offsets do not currently reflow with the scrollbar
(measured: `#skills` `offsetTop` 4824 locked and unlocked) — the ordering was
still wrong and T4–T10 change these sections, so it was fixed rather than
argued away.

*5b — the navbar's scrollbar compensation snapped while the glass faded.*
`body.nav-open .navbar { padding-right: var(--scrollbar-width) }` was not in
the navbar's `transition` list, so `.nav-controls` jumped 15px left instantly
while the background/hairline faded over 250ms. Fixed by adding
`padding var(--duration-normal) var(--ease-standard)` to the transition.
Verified with `scrollorder.mjs` padding samples while opening (classic
scrollbar): `0px` → `12.67px` (80ms) → `14.98px` (120ms) → `15px` (200ms),
and `0px` again after closing — i.e. it interpolates rather than snapping.

Re-ran after both fixes: `navflow.mjs` (375: open → Skills → closed/unlocked/
`scrollY` 5072/focus returned; resize → focus to the first link; 0 console,
0 page errors), `navcheck.mjs` (375 dark: scrolled glass, hairline, shadow,
±3px hit tests, Enter/Space/Escape, closed tab order — unchanged; the only
difference is `transition-property` now ending in `, padding`),
`navprobe.mjs` (320/375/1440 × EN/IT), `overflow.mjs` (320/375 × EN/IT),
`openfocus.mjs` (11 inert elements, Tab cycle, blocked CTA focus, Escape →
0 inert, widen-while-open → unlocked) and `bpflow.mjs` (all six focus cases
unchanged, including Escape → hamburger through the new `preventScroll` call).
`rmprobe.mjs` was **not** re-run: the diffs touch the nav-link click order,
one `focus()` option and a `transition` list, none of which can change the
reduced-motion timings of the drawer. The two heavier checks **were** re-run
once the CSS was final:
- `contrast.mjs` (EN/IT × light/dark): `scanned` 311 in every combination,
  **0 failures**, so the earlier result still holds after all five rounds.
- Lighthouse accessibility: **93** on both `/en/` and `/it/` with exactly
  `heading-order`, `link-name` and `landmark-one-main` — the same three
  pre-existing failures already assigned to T5/T9, and still no
  `label-content-name-mismatch`. No new failure was introduced by any of the
  five rounds.


**Remaining risks / follow-ups**

- **Pre-existing, out of T3 scope: the desktop nav has no working layout
  between 769px and ~1100px.** The hamburger only appears at ≤768px, so at
  769–900px the eight inline links squeeze the wordmark to **0px** and push
  `.nav-controls` past the viewport (measured: logo width 0 at 769 and 900,
  117px at 1024, 59px for IT at 1024). This predates T3 — the same numbers
  were measured at HEAD — and the change set does not make it worse (the
  wordmark is 135px at 320px, i.e. *narrower* than the 137px it was), but it
  needs its own task: either raise the drawer breakpoint to ~1100px or shrink
  the nav gap/type below 1100px. Added to the pre-existing issues list.
- The off-canvas menu is reported as "overflowing" by `overflow.mjs` because
  its `li`/`a` children sit at `left: 320` while the parent is fixed; this is
  a tool false positive (`document.scrollWidth` is unchanged and fixed
  boxes do not create document overflow), not a layout bug.
- **No-JS trade-off (deliberate):** the closed drawer is `visibility: hidden`,
  so without JS the mobile menu is unreachable (previously the off-screen
  links were at least focusable). The navbar already depended on JS for the
  toggle, and `visibility` is what keeps the eight links out of the tab order
  when closed, which T3 requires. A `<noscript>` fallback or progressive
  enhancement belongs with T11/T12 if it is wanted.
- **`inert` support (open drawer):** the page-behind `inert` needs Chrome
  102+, Firefox 112+ or Safari 15.5+. Older engines ignore the attribute, in
  which case the `Tab` wrap still keeps keyboard focus inside the navbar but
  screen-reader browse mode could reach the covered content. The browser
  matrix is T12's; no fallback (`aria-hidden` + `display: none`) was added
  because it would fight the scroll lock and the drawer animation.
- **250ms close window:** with normal motion the links stay focusable during
  the slide-out (`visibility 0s linear 250ms`). Tabbing into one is possible
  in that window, but focus falls back to `<body>` the moment the menu hides,
  so it self-heals; under `prefers-reduced-motion` the window is gone
  (`transition-delay: 0s`).
- **Menu geometry depends on `backdrop-filter`:** because `.navbar` always
  carries `backdrop-filter`, it becomes the containing block for the
  `position: fixed` drawer. The two boxes coincide today (navbar fixed at
  top 0, full width), so the alignment is correct, but if T11/T12 remove
  `backdrop-filter` from `.navbar` the drawer will start positioning against
  the viewport instead. Verified in Chromium only; Firefox/Safari are T12.
- `aria-expanded` is only meaningful under 769px; the button is
  `display: none` above the breakpoint, so it cannot be reached by mouse or
  keyboard (the probe's "open at 1440" step is an artefact of clicking a
  hidden element through CDP and is skipped in the final run).
- **Probe fidelity is itself a risk (round 5).** Two of the five review
  findings were only visible with a *classic* scrollbar, and headless Chrome
  defaults to 0px overlay scrollbars — every earlier run silently exercised a
  layout where `body.nav-open { overflow: hidden }` changes nothing. Any probe
  that touches the scroll lock must first call
  `Emulation.setScrollbarsHidden({ hidden: false })` and assert that
  `innerWidth - clientWidth > 0` (this is how the 15px scrollbar was
  reproduced at 600/700/760px). Separately, the first `scrollorder.mjs` run
  produced a false `scrollY: 0` because its `window.scrollTo` spy forwarded
  `orig(a, b)` — two arguments, which Chromium reads as `scrollTo(x, y)` —
  instead of preserving arity; a pass-through spy must forward
  `arguments` unchanged. Both lessons belong in the T13/T14 tooling notes,
  since the probes are currently repo-external.

### T4 – Hero section ✅ Done (2026-10-27)
- [x] **Objective:** Refresh the hero:
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

**Completion log (T4)**

*What changed.* `assets/css/style.css`:
- `.hero`: `min-height: min(100vh, 880px)` + `min(100svh, 880px)` (capped, so a
  1080p screen does not get a 1080px hero), `padding: 96px 0 80px` (the old
  `32px` did not clear the 69px navbar), `isolation: isolate` so the glows stay
  behind the content.
- `.hero::before`: two soft radial glows (`--color-bg-1` top-left,
  `--portfolio-primary-soft` top-right) replacing the flat `opacity: 0.1` tint.
- `.hero-content`: `minmax(0, 1.7fr) minmax(0, 1fr)` and
  `gap: clamp(32px, 5vw, 64px)`.
- `.hero-title`: `clamp(2.25rem, 4.8vw, 3.75rem)` (60px at 1440), `line-height
  1.08`, `letter-spacing: -0.025em`, `text-wrap: balance`.
- `.typing-container`: flex row, `min-height: 1.5em`, `clamp(1.25rem, 2.1vw,
  1.75rem)`; `.typing-text { font-size: inherit }`. `.cursor` is now a 2px
  `currentColor` bar at `1.1em` (was a fixed 18px `border-left` next to 26px
  text), blinking with `steps(1, end)`.
- `.hero-subtitle`: `clamp(1rem, 1.25vw, 1.1875rem)`, `line-height: 1.65`,
  `max-width: 52ch`.
- `.hero-buttons .btn`: pill (`--radius-full`), `12px 24px` padding; the primary
  button gets a tinted drop shadow and a 1px lift on hover.
- `.hero-image`: the box is the ring — 8px padding, `--radius-full`,
  `linear-gradient(135deg, indigo-400, sky-400)`, `--shadow-lg`, float moved
  here from the image. `.profile-image` is 284px inside it (300px total, as
  before) with no own shadow.
- `.hero-stats`: `repeat(3, minmax(0, 1fr))`, `max-width: 880px`, 48px above.
  `.stat`: `--color-surface`, `20px 24px`, `--radius-xl`, `--shadow-xs`, hover
  lift. `.stat-number`: display font at 700, `clamp(2rem, 3vw, 2.5rem)`,
  `tabular-nums`.

`assets/js/script.js` (`createParticles`): density
`min(48, max(24, area / 26000))` (was `min(70, max(35, area / 18000))`), radius
`1.6–2.8` (was `2–3.5`), dot alpha `0.55` (was `0.7`), line alpha `0.16` (was
`0.22`), hovered line `0.85` (was `0.95`). The theme-token reading and the
`themechange` re-read were already in place from T2 and were not touched.

*Responsive.* `≤768px`: removed the `70px` `.hero-container` top padding (the
hero's own padding clears the navbar now), `padding-top: 80px` on `.hero`,
title `clamp(2.25rem, 6vw, 3rem)`, centered subtitle / typing line / buttons,
`.profile-image` 240px, stats stay 3 columns with `16px 12px` cards, and
`.scroll-indicator` is `display: none`. `≤480px`: `.hero-container` padding
`0 16px`, title `2rem` (keeps the nowrap name inside 320px), typing 19px,
`.profile-image` 216px, and each stat becomes a compact row
(`flex`, number left / label right) because three 96px cards cannot hold
"Certifications".

*Not touched:* `_includes/hero_section.html`. Its only change in the working
tree is the pre-existing, uncommitted `photo.jpg` → `photo.png` swap made
outside this task; it was left exactly as found, and every check above ran
against it.

*Measured* (`heroprobe.mjs`, 16 runs = 1440×900 / 768×900 / 375×800 / 320×700 ×
EN/IT × light/dark):
- hero height 880 at 1440 and 768 (fits the 900 viewport), 930 at 375/320 and
  904 for IT (content-driven, expected on mobile);
- 1440: content 216–516, stats 564–680, indicator 825–856 → no overlap; title
  60px; typing 28px with a 31px cursor (1.1em);
- 768: content 99–633, stats 681–781, indicator **hidden** (`0×0`), title
  46.08px, image 240+16;
- 375/320: content 80–634, stats 682–850 (168px for three rows instead of the
  443px the old single-column stack took), image 216+16, title 32px;
- ring: `8px` padding + 284/240/216px image, gradient applied, `box-shadow` on
  the box, `none` on the image, in every run;
- typing advances (`typingChanges: true`) and counters reach `3/1/3` at 1440 and
  768; at 375/320 the second and third cards sit below the fold, so the
  `rootMargin: -50px` observer leaves them at `0` until a scroll — after
  `scrollTo(stats - 200)` they reach `3/1/3` as well (verified, by design);
- particles: 1516–3594 non-transparent px per run (was 9333 at 1440 before),
  average colour `73,63,229` light ↔ `127,138,249` dark, and every run reports
  `particleColorChanged: true` after a theme toggle with no reload;
- 0 console errors, 0 page errors in all 16 runs;
- extra sizes 1100×900, 1920×1080, 900×800: hero 880/880/800, indicator clear of
  the stats in all three.

*Also verified:* `overflow.mjs` clean at 320/375 × EN/IT; `contrast.mjs`
`scanned: 311`, **0 failures** × EN/IT × light/dark; `navprobe.mjs`
(320/375/1440 × EN/IT) and `navcheck.mjs` (375 dark) unchanged after the navbar
edit below; Lighthouse `/en/`: a11y **93** with only `heading-order`,
`link-name`, `landmark-one-main` (all pre-existing, T5/T9), CLS **0.002**.

*Deviation (documented, small).* The navbar carried
`backdrop-filter: blur(16px) saturate(180%)` even while it was transparent. Over
the new flat-ish hero gradient that blurs nothing, but Chromium samples past the
top edge of the viewport and composites a lighter strip along it — measured in
dark mode at x=700: blue channel **43 at y=65** (just above the navbar's bottom
edge) vs **35 at y=72** (just below), and 54 vs 42 at x=60. With the filter
moved to `.navbar.scrolled` / `body.nav-open .navbar` the two profiles become
identical (`bleedprofile.mjs`), and the scrolled/drawer states keep the blur
(`navblur.mjs`: `none` at top, `blur(16px) saturate(1.8)` when scrolled or with
the drawer open, `none` again after scrolling back / closing). This is T3 code,
but the artifact only became visible with the new hero, so it is fixed here and
recorded as a T4 deviation rather than a silent change.

*Known limits (not T4 regressions).*
- The hero is capped at 880px, so on a 900px+ viewport the next section shows
  20px (at 900) up to 200px (at 1080). That is the intended "there is more"
  affordance, not a bug.
- `stat-number` values are rewritten at runtime (3/1/3 from the years-since-2023
  calculation and the collection sizes), so the literal `2/3/3` in
  `_includes/hero_section.html` is not what the page shows.
- `#scroll-progress` (fixed, 3px, top) and the scroll-to-top button are still
  T11's to restyle; the button overlaps the stats when the hero is taller than
  the viewport (visible at 375 in the screenshots).
- Reduced motion still runs the particles and the typing effect; disabling them
  is T11's scope and was deliberately not started here. T11 should sweep the
  **whole** hero, not just those two: the 7s infinite `.hero-image` `float`
  (moved from the image to the ring in T4), the `.cursor` `blink`, the
  `.scroll-indicator` `bounce`, the `.stat:hover` lift and the
  `.hero-buttons .btn--primary` hover transition all keep animating under
  `prefers-reduced-motion: reduce` (the file's only reduce blocks are the
  navbar-scoped one and the drawer one at the end of the file).
- **Commit hygiene for the photo swap (reviewer P2).** `_includes/hero_section.html`
  points at `../assets/imgs/photo.png`, which is still **untracked**, while
  `assets/imgs/photo.jpg` is deleted. Those three paths must land in the same
  commit; a `git commit -a` / `git add -u` would commit the include and the
  deletion without the PNG and deploy a 404 on both `/en/` and `/it/`.
  HEAD itself is still self-consistent (it references `photo.jpg`, which is
  committed), so nothing is broken until that partial commit is made.

### T5 - Section shell (headers, spacing, alternating backgrounds) ✅ Done (2026-10-27)
- [x] **Objective:** Give all sections the same header style (refined title,
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

**Completion log (T5)**

*What changed.* `_layouts/default.html`:
- `<a class="skip-link" href="#main">` is the first focusable element (label from
  `_data/navigation.yml`: "Skip to content" / "Vai al contenuto");
- the eight content includes are wrapped in `<main id="main" tabindex="-1">`; the
  footer stays outside it. `tabindex="-1"` gives the fragment a real focus
  target, so the Tab after the skip link continues inside the content.

`assets/css/style.css`:
- `.skip-link`: `position: fixed`, `8px/8px`, `z-index: 1200` (above the navbar's
  1000 and the progress bar's 1100), accent background + `--color-on-accent`
  text, parked with `transform: translateY(calc(-100% - 16px))` (a transform, so
  it can never widen the document) and revealed on `:focus`/`:hover`. No
  transition, so there is nothing for T11's reduced-motion sweep to disable. The
  global focus ring is accent-on-accent here, so the link gets a
  `--color-text` ring instead. `#main:focus { outline: none }` only suppresses
  the ring on the programmatic target.
- `section`: `padding: clamp(4rem, 5vw + 1.5rem, 6rem) 0` (96px at 1440, 64px
  ≤768) and an explicit `background: var(--color-background)`.
- `section:nth-child(odd)` → `.section--alt` (`--color-surface`), applied in the
  includes to `education`, `experience` and `projects`. This is the parity the
  old rule produced, but it no longer depends on `<body>`'s child index, so the
  `<main>` wrap and the runtime `#preloader` prepend/remove cannot flip it.
- `.section-header`: `max-width: 720px`, `margin: 0 auto clamp(2.5rem, 3vw +
  1.5rem, 4rem)` (64px at 1440, 40px ≤375).
- `.section-title`: `clamp(1.75rem, 1.35rem + 1.5vw, 2.5rem)` (40px at 1440, 28px
  at 375/320 — the old fixed 32px plus the 26px ≤480 override are gone),
  `line-height: 1.15`, tight tracking, `text-wrap: balance`, 24px below.
- `.section-title::after`: 48×3px (was 80×4px) at `bottom: -12px`, still the
  `--portfolio-gradient`.
- `.section-subtitle`: 17px, `line-height: 1.6`, secondary color, `max-width:
  620px`, `text-wrap: pretty`.
- `.hero`: keeps the raised surface explicitly (`--color-surface`) instead of
  relying on the old `nth-child(odd)` override; about starts on
  `--color-background`, so the hero → about → education sequence still alternates.
- `.contact-details h4` → `h3` with `font-size: var(--font-size-xl)` (the old h4
  size), because `_includes/contact_section.html` now uses `<h3>`.

`_includes/about_section.html`: the subtitle is conditional. The English about
entry has no `subtitle` key, so the old markup rendered an empty `<p>` and the
header height differed per language.

`_includes/navigation_section.html`: the comment that justified keeping the
theme-toggle snippet inside `<nav>` ("it would shift `section:nth-child(odd)`")
is no longer true and was rewritten; the snippet stays where it is.

*Measured* (`shellprobe.mjs`, 16 runs = 1440/768/375/320 × EN/IT × light/dark):
- exactly **1** `<main>`, parent `BODY`, `tabindex="-1"`, on both pages;
- section backgrounds, read as soon as `#preloader` exists (16/16 runs) **and**
  again at 3s (removed):
  `home/education/experience/projects` = surface, `about/certifications/skills/
  contact` = background, in both themes, in all 16 runs — i.e. the alternation is
  identical before and after the preloader is prepended and removed;
- 23 headings, **0** skipped levels in every run (contact `h4` → `h3`);
- `.section-title` `scrollWidth == clientWidth` for all seven sections in both
  languages at 375 and 320 (IT "Certificazioni" included), all one line;
- contact `h3` computed 19px;
- 0 console errors, 0 page errors.

`shellrhythm.mjs` (1440 light EN/IT, 375 light/dark + 320):
- title 40px / line-height 46px / `margin-bottom` 24px at 1440, 28px / 32.2px at
  375–320; underline 48×3px at `bottom: -12px`, `border-radius: 9999px`;
- subtitle 17px / 27.2px, `#475569` light and `#a8b0c0` dark, `max-width: 620px`;
- header `margin-bottom` 64px at 1440 and 40px at 375/320;
- content sections `96px/96px` at 1440 and `64px/64px` at 375/320; the hero keeps
  `96px/80px` and `80px/80px` respectively (its own padding);
- skip link at rest: `top: -54`, `bottom: -8` (fully above the viewport),
  `z-index: 1200`.

`shellnav.mjs`: after the wrap every section reports `offsetTop == rectTop` and
`offsetParent = BODY` (so `updateActiveNavLink()`'s `offsetTop` maths is
unaffected); clicking About/Education/Experience/Contact lands the section at
80px and highlights the right nav link.

*Also verified:* `overflow.mjs` clean at 320/375 × EN/IT × light/dark
(`docW == innerW`); `contrast.mjs` **0 failures** over 312 (EN) / 313 (IT)
elements × light/dark; `navprobe.mjs` (320/375/1440 × EN/IT) still reports
`offsetMatchesNavbar`, the scroll lock, `aria-expanded` and focus return to the
hamburger; `navcheck.mjs` (375 EN light) still passes the Enter/Space/Escape
round-trips, the 44px hit tests and the scrolled glass, with `skip-link` now the
first entry in the tab order (then the toggle, the two language links, the
hamburger, `contact-me`, the filters — the closed drawer links stay out);
Lighthouse accessibility **0.96** on `/en/` and `/it/` (was 0.93):
`landmark-one-main` **1**, `heading-order` **1**, the new `skip-link` audit **1**,
and the only failing audit is the pre-existing `.project-link` `link-name` (T9);
all three inline scripts in both pages still parse; Jekyll 4.4.1 and
`jekyll _3.10.0_ build` both succeed, both outputs contain the skip link and
`<main>`, `_site/plans` is absent and `apps/piano/` is intact.

*Decisions / deviations (all inside the T5 brief).*
- **Explicit classes instead of a parity fix.** The wrap alone would have
  preserved the old parity (sections move from `<body>` child 3…10 to `<main>`
  child 1…8, an even offset), but the runtime preloader would still have flipped
  it on every load. `.section--alt` removes the coupling entirely.
- **The hero was already rendering on `--color-surface`** because
  `section:nth-child(odd)` out-specified `.hero`. Dropping `nth-child` would
  silently have moved it to `--color-background`, so `.hero` now declares the
  surface itself and the rendering is unchanged.
- **Contact `h4` → `h3`** is the fix for `heading-order`; the plan assigned it
  to T5 (line "Confirmed by Lighthouse: the contact items use `<h4>`"). The CSS
  pins the old 19px size, so only the semantics change.
- **Mobile section padding 96px → 64px** is part of the "same vertical rhythm"
  brief: the old value left ~96px of dead space on a 320px screen.
- The ≤480 `.section-title` override (26px) was removed because the new clamp
  already handles small widths; keeping both would have made the clamp dead code
  at exactly the widths where it matters.

*Known limits (not T5 regressions).*
- **The English About header has no subtitle.** `_data/about.yml` only defines
  `it.subtitle`; the empty `<p>` is now guarded, but the text itself is a content
  gap, not a shell gap. Adding the English sentence is a content decision, so it
  is left for T13 rather than invented here (T6 kept the guard and added no
  English copy).
- The 11px horizontal overflow at 320px with a **classic** scrollbar was
  unchanged by T5 (layout viewport 305, `documentElement.scrollWidth` 316, the
  same 316 as recorded in T4); `overflow.mjs` uses overlay scrollbars and stays
  clean. **Later resolved in T7** — see §10 and the T7 log.
- `.project-link` still fails `link-name` (T9), and the skip link now precedes
  the theme toggle in the tab order by design.

### T6 – About and Education (timeline) ✅ Done (2026-10-29)
- [x] **Objective:**
  - About highlights shown as icon chips.
  - Timeline with a thin gradient line, ringed dots, and raised cards.
- **Files:** `style.css` around lines 1203–1319 (the About and timeline blocks
  now live at 1437–1616); `script.js` `createObserver()`.
- **Notes:** Keep the `.timeline-item` reveal driven by the observer. `.age`
  is filled by JS.
- **Acceptance:**
  - Items reveal on scroll.
  - The timeline becomes a single left-aligned column on mobile.
  - The grade line shows only when it exists.
- **Verify:** manual check.

**Completion log (T6)**

*What changed.* `assets/css/style.css`:
- `.about-highlights`: `gap` 32px → 12px. `.highlight-item` is now a pill
  (`inline-flex`, `--space-6`/`--space-16` padding, `--radius-full`) on
  `--portfolio-primary-soft` with a `--color-border-subtle` hairline; the Font
  Awesome glyph sits in its own 26px white dot (`--color-surface`, accent
  colour, 11px). The chip's height is therefore 40px in every language and the
  three chips wrap and centre on mobile.
- `.timeline::before` is a 2px `--radius-full` spine, inset 8px top and bottom,
  with a three-stop gradient (`transparent → accent 10% → accent 70% →
  transparent`) so it fades instead of ending on a hard cut behind the dots.
- `.timeline-item`: `margin-bottom` 32px → 40px, and the reveal is now a
  0.45s opacity/`translateY(24px)` **transition** that only applies while the
  item carries `.is-pending`. The old `opacity: 0; animation: slideInUp …`
  pair is gone (the keyframes were deleted).
- `.timeline-item::before`: 16px dot with a 4px `--color-background` border
  becomes a 12px accent dot with two `box-shadow` rings (4px
  `--color-surface`, then 1px `--portfolio-primary-soft`), `top: 29px` so it
  centres on the card's first line (24px card padding + half a 23px `h3`).
- `.timeline-content`: `background` `--color-background` → **`--color-surface-raised`**,
  `--shadow-sm` → `--shadow-md`, `gap` 8px → 12px in the header.
- `.timeline-period`: accent-tinted pill (`--portfolio-primary-soft` +
  accent text, 600, tabular numerals, `nowrap`) instead of a grey chip.
- `.timeline-grade`: 15px secondary text; `.timeline-grade strong` pinned to
  600 (Inter is loaded at 400/500/600, so the data's `<strong>` would otherwise
  get a synthesized 700).
- `.timeline-item:nth-child(odd) .timeline-header { justify-content: flex-end }`
  and the same rule reset to `space-between` in the ≤768 block: the header is a
  flex row, so `text-align: right` on the left card never reached it and the
  period pill dropped to a second line at the card's *left* edge while the
  school name and body sat at the right.
- `@keyframes slideInUp` removed; a scoped
  `@media (prefers-reduced-motion: reduce) { .timeline-item { transition: none } }`
  was added at the end of the file (after the `max-width: 768px` block).

`assets/js/script.js`, `createObserver()`:
- before observing, `.timeline-item` elements get `.is-pending`;
- on intersection the class is removed instead of setting
  `style.animationDelay` / `style.animationFillMode`;
- `createObserver()` now returns early when `IntersectionObserver` is not a
  function (`typeof … !== 'function'`, matching the existing `ResizeObserver`
  guard). Without it the class would be added and never removed, so the list
  would stay invisible forever on a browser that lacks the API.

*Why JS applies the hidden state.* The old CSS animation started on load, so
both cards had finished long before anyone scrolled to them: the reveal was
dead code. Applying `.is-pending` from JS (and keeping the hidden rule scoped to
that class) means a no-JS visitor, or a visitor whose script failed, still sees
the list — verified with `Emulation.setScriptExecutionDisabled`.

*Measured (`t6probe.mjs`, 16 runs = 1440/768/375/320 × EN/IT × light/dark).*
- before the scroll: both items `is-pending`, opacity `0`;
- 150ms after scrolling the section into view: opacity 0.72–0.87 (timing-dependent);
- settled: opacity `1`, `transform: none`, `transition` `opacity, transform
  0.45s`;
- desktop (1440): cards at 313–681 and 745–1113 (staggered); ≤768: one column
  (66–344 at 375, 66–289 at 320) with `text-align: left`;
- chips: 3 per page, uniform 40px height, `9999px` radius, 26×26 icon dots;
- dot 12px with two `rgb(...)` rings; spine `2px`, centred;
- `.timeline-grade` count 2 on every run; `docW == innerW`; 0 console/page
  errors.

*No-JS / reduced motion / no-IO.* No-JS: both items opacity `1`, `is-pending`
absent. Reduced motion: `transition: none 0s` before and after, and the items
still go from hidden to visible when scrolled in (the class change is not the
animation). No `IntersectionObserver` (`t6noio.mjs` deletes it before the page
scripts run): `typeof IntersectionObserver === 'undefined'` and both items stay
at opacity `1` with `transform: none`.

*Grade conditional.* Proven on a throwaway copy of the site
(`%LOCALAPPDATA%\Temp\opencode\t6-nograde`, one English `grade:` line deleted):
built EN output has 1 `.timeline-grade`, IT still has 2, the real site has 2.
The guard (`{% if item.grade %}`) already existed and is unchanged.

*Visual review (`t6shots.mjs`, About + Education clips at 1440/375 ×
light/dark).* Two issues were found and fixed before sign-off: the card and the
alt section were the **same** colour (invisible elevation, worst in dark), which
is why `.timeline-content` moved to `--color-surface-raised` (#fff light /
#171b24 dark against the #12151c section); and the odd card's period pill was
left-aligned against a right-aligned body, hence the header alignment rule.
Re-shot after both fixes; `t6head.mjs` then confirmed the heading and pill stay
inside the card at 375/768 (where the mobile reset applies: header
`space-between`, text `left`) and at 769/800/900/1024/1280 in both languages
(odd header `flex-end`, even `space-between`).

*Also verified.* `overflow.mjs` clean at 320/375 × EN/IT × light/dark
(`docW == innerW`, re-run after the card-background change); `contrast.mjs`
**0 failures** over 312 (EN) / 313 (IT) elements × light/dark, including the new
`#171b24` card surface; `node --check assets/js/script.js` exit 0; Jekyll 4.4.1
build exit 0 and `_site/plans` still absent.

*Known limits / notes.*
- **No hover lift on the timeline cards.** They are not links or buttons, so a
  hover affordance would promise an interaction that does not exist; elevation
  is carried by the surface step, the hairline and the shadow.
- **The reveal is not gated on `preloaderActive`** (unlike the stat counters,
  which return early). It does not need to be today: `createPreloader()` always
  inserts an opaque full-viewport overlay (`--portfolio-dark`, `z-index: 9999`)
  and removes it ~1.5s after `load`, so both the initial hide and any early
  reveal happen behind it. If T11 makes the preloader translucent or skips it,
  revisit this (and note that under reduced motion the hide transition is
  already `none`, so nothing flashes).
- **Lighthouse was not re-run for T6** (the binary is not installed in this
  session and `npx` refused to fetch it). The change adds no markup, roles or
  focusable elements, and `contrast.mjs` covers the two surfaces that changed;
  T11/T14 should re-baseline the audit.
- `data-year="{{ edu.period }}"` in `_includes/education_section.html` is dead
  markup (`edu.period` is undefined and no script reads it). Left untouched —
  removing it is a markup cleanup outside this task's CSS brief.
- The English About section still has no subtitle (content gap, see T5).

*Independent review (2026-10-29): no actionable findings.* The reviewer
re-checked the diff against the code rather than the log: `node --check` exit 0;
every new token (`--portfolio-primary-soft`, `--color-surface-raised`,
`--space-10`, `--space-40`, `--radius-full`, `--shadow-md`,
`--color-border-subtle`) exists in both schemes; no `slideInUp` reference
remains; the reduced-motion block sits after the `max-width: 768px` block, so it
wins the cascade (the T3 round-1 trap is not repeated); `.timeline` has only
`.timeline-item` children, so the `nth-child(odd)` header rule and its ≤768 reset
are sound; `.timeline-period` computes to ≈5.2:1 (light) and ≈4.7:1 (dark)
against the card, above AA for 13px/600; the `IntersectionObserver` guard is
strictly better than HEAD, where a missing API threw inside `init()` and took
particles, event listeners, the footer year and the age fill down with it; the
photo asset state is consistent (no deploy 404). Residual risks it listed — the
probes living outside the repo, Lighthouse not re-run, and the preloader
coupling noted above — are already recorded here; nothing needed changing.

### T7 – Certifications and Experience ✅ Done (2026-10-29)
- [x] **Objective:**
  - Certification cards: equal height, icon in a tinted circle, pill badge.
  - Experience cards: clear company, period, role and location hierarchy,
    with an accent-bulleted achievements list.
- **Files:** `style.css` around lines 1320–1445 (the two blocks now sit at
  1618–1810); `script.js` (`createObserver()`, and the removal of
  `initializeCardsAnimation()`).
- **Acceptance:**
  - Grids line up at 1024 and 1440 and stack at 375.
  - The hover lift is subtle with no scaling.
  - The hero certification count is still correct.
- **Verify:** manual check.

**Completion log (T7)**

*What changed.* `assets/css/style.css`:
- `.certification-card`: `display: flex; flex-direction: column; align-items:
  center` with `padding: 32px 24px` and `--shadow-xs`. The grid already
  stretches a row to one height; the flex column lets `.cert-badge` take
  `margin-top: auto`, so the badges line up even when a title wraps.
- `.certification-card:hover`: `translateY(-4px)` + `--shadow-lg` →
  **`translateY(-2px)` + `--shadow-md` + `--color-border`** (no scaling).
- `.cert-icon`: the bare 3rem glyph becomes a **56×56 circle** on
  `--portfolio-primary-soft` with a 22px accent glyph.
- `.cert-code`: 13px mono, secondary colour, `2px 8px` padding (was 16px text in
  a 34px-tall box); `.cert-year` 13px.
- `.cert-badge`: the accent-gradient bar with `--color-on-accent` text (which
  read as a full-width stripe) becomes a **soft accent pill**, 12px/600,
  `nowrap`, pushed to the bottom of the card.
- `.experience-item`: `--color-background` → **`--color-surface-raised`** +
  `--shadow-sm`, the same "raised above `.section--alt`" step the timeline cards
  use.
- `.experience-header`: gains `padding-bottom: 20px` and a
  `--color-card-border-inner` hairline, so the company/period row, role and
  location are separated from the body.
- `.experience-period`: grey chip → accent-tinted pill, 600, tabular numerals,
  `nowrap`; `.experience-company` gap 8px → 12px.
- `.experience-location`: 15px, no `margin-bottom` (the header border now does
  that job); `.experience-description p` gets `text-wrap: pretty`.
- `.experience-achievements li::before`: the `▶` text glyph (which rendered at
  the full 16px text size) becomes a **6px accent dot** at `top: 0.6em`;
  `padding-left` 24px → 20px; `li:last-child` loses its trailing margin.
- `.project-card`: its `transition` also gains `translate`/`opacity` (the
  shared reveal below), and `.project-card.is-pending` is styled next to the
  certification rule.
- A second `prefers-reduced-motion` block sets `transition: none` on
  `.certification-card, .project-card`.

`assets/js/script.js`:
- `createObserver()` now arms `.timeline-item, .certification-card,
  .project-card` with `.is-pending` and reveals them by removing the class.
- `initializeCardsAnimation()` is **deleted** (and its call removed from
  `init()`). It used to write `opacity`, `transform: translateY(30px)` and a
  `transition` shorthand **inline** on every card.

*Why the JS change was required (a real bug, not a preference).* The old
`initializeCardsAnimation()` left `style="opacity: 1; transform: translateY(0px)"`
on each card after the reveal, and an inline `transform` outranks the
`.certification-card:hover` rule. Measured before the change with
`t7hover.mjs` (CDP `CSS.forcePseudoState` on `:hover`): `transform` stayed
`matrix(1, 0, 0, 1, 0, 0)`, **lift 0.00px** — only the shadow changed. The CSS
lift was dead code. Moving the reveal to the class-based `translate` property
(the same mechanism T6 introduced for the timeline) leaves `transform` free for
the hover, and removes the inline styles entirely (asserted: `inline === null`
on every card in all 16 runs).

*Measured (`t7probe.mjs`, 16 runs = 1440/1024/768/375 × EN/IT × light/dark).*
- columns: 3 at 1440 (400px each) and 1024 (309.66px each), 2 at 768, 1 at 375;
- every row: equal card heights (275px with the real data) and identical badge
  tops; the three cards keep the same left edges as the pre-change baseline
  (89/513/937 at 1440, 16/350/683 at 1024) and are 19px shorter;
- icon 56×56, `border-radius: 50%`, tinted (`rgba(79,70,229,0.12)` light /
  `rgba(129,140,248,0.14)` dark);
- badge 133×28, `9999px`, 600, always narrower than the card;
- before the scroll: `is-pending`, opacity 0; mid-transition 0.80–0.84 at 150ms
  for the cards already in view (the third is still below the fold at 375);
  settled: opacity 1, `translate: none`, `inline: null`;
- experience: company 22px/700 accent, role 19px/600, location 15px secondary,
  header hairline 1px, achievement bullet `content: ""` with a non-transparent
  background, `padding-left: 20px`, card background `rgb(23,27,36)` dark /
  `rgb(255,255,255)` light with a shadow;
- hero counters still `3/1/3`; `docW == innerW`; 0 console/page errors.

*Hover.* `t7shared.mjs` with a real `Input.dispatchMouseEvent` move onto a card:
`transform: matrix(1, 0, 0, 1, 0, -2)`, **lift 2.00px**, `scale: none`, shadow
`--shadow-md`; moving away returns to `transform: none` (0.00px). So the
acceptance "subtle lift, no scaling" is now actually observable.

*Wrapped-title proof.* On a throwaway copy (`t7-longtitle`, one title replaced
with a 60-character sentence): at 1440 the title takes 2 lines, at 1024 it takes
3; in both cases all three cards keep **equal heights (298 / 321)** and the
badges stay at **one shared top (2721 / 2601)** — the `margin-top: auto` claim
holds.

*Shared reveal / no-JS / no-IO / reduced motion.* `t7shared.mjs`: project cards
go from `is-pending` + opacity 0 to opacity 1 with `translate: none`, no inline
styles. No-JS: all three certification cards (and the project card) render at
opacity 1. `IntersectionObserver` deleted: `typeof` is `undefined` and every
card stays at opacity 1. Reduced motion: `transition-duration` computes to `0s`
and the cards still reveal.

*Also verified.* `overflow.mjs` clean at 320/375 × EN/IT × light/dark
(`docW == innerW`); `contrast.mjs` **0 failures** over 312 (EN) / 313 (IT)
elements × light/dark, including the new soft pills, the tinted icon circle and
the accent achievement dots; `t6probe.mjs` still **16/16** after the shared
reveal refactor (timeline unaffected); `node --check assets/js/script.js` exit 0;
Jekyll 4.4.1 and `jekyll _3.10.0_ build` both exit 0, the parity output contains
the new rules and no `initializeCardsAnimation`, `_site/plans` is absent.

*Visual review (`t7shots.mjs`, `t7shots2.mjs`).* Certification and experience
sections reviewed at 1440/1024/375 × light/dark in EN and IT, plus the projects
section (which shares the reveal). Icons, pill badges, hierarchy and the
hairline all read correctly in both themes; no clipping or wrap problems at
1024, the tightest 3-up width.

*Independent review (2026-10-29): one P3, fixed.* The reviewer confirmed the JS
guard ordering, the `translate`/`transform` decoupling, the cascade position of
the reduced-motion block, the token set, the badge-alignment mechanism and the
hand-recomputed contrast (≈5.26:1 light / ≈5.0:1 dark for the badge, ≈4.67:1 for
the dark period pill), and found no defect introduced by the diff. Its P3 was
that `.certifications-grid` still used `minmax(300px, 1fr)`: at a 320px viewport
the `.container` content box is 273px (305px layout viewport minus 32px), so the
300px track pushed the card's right edge to **316px**.

That is the **11px classic-scrollbar overflow the plan has carried as unresolved
since T4** — reproduced digit for digit and now fixed. `t7classic.mjs` (classic
15px scrollbar, so it measures `documentElement.clientWidth`, which
`overflow.mjs` cannot see with overlay scrollbars) before the fix:
`innerW 320, clientW 305, docW 316`, certifications card `16→316`, i.e. 27px
past the container edge and 11px past the layout viewport; projects and skills
were already fine (their 273px columns come from the ≤768 `1fr` overrides).
The rule is now
`repeat(auto-fit, minmax(min(100%, 300px), 1fr))`, and after the fix:
`docW 305 == clientW` at 320px in both languages, with the 360/375 columns
unchanged (313/328) and 768/1024/1440 identical to the pre-fix measurements
(`t7probe.mjs` re-run: still 16/16). `overflow.mjs` (overlay scrollbars) and
`contrast.mjs` (0 failures × 4) were re-run after the change, and `t6probe.mjs`
still passes 16/16.

*Known limits / notes.*
- **`--shadow-sm` on the experience card, `--shadow-xs` on certification
  cards.** The experience card is 900px wide, where `--shadow-md` reads heavy;
  in light mode it relies on the hairline border for definition, which the
  screenshots confirm is enough. Documented rather than "fixed" because the
  alternative is a visually louder card.
- **The reveal now uses the `translate` property**, which needs Chrome 104+ /
  Safari 14.1+ / Firefox 72+. On an older browser the pending state still only
  sets `opacity: 0` (no offset) and the class is still removed, so cards appear
  with a fade instead of a slide — degraded, not broken.
- **`min(100%, 300px)` inside `minmax()`** needs the same generation of
  browsers as `min()`/`clamp()` elsewhere in this stylesheet (already used by
  `--font-size` clamps and the hero height), so it adds no new constraint. In a
  browser without it the declaration is dropped and the grid falls back to a
  single auto column — still no overflow.
- **`white-space: nowrap` on the badge and both period pills is a content
  assumption.** "Microsoft Certified" is ~133px against ~225px of inner card
  width at 320px, and the period strings are shorter still, so nothing wraps or
  overflows today. A future badge string long enough to exceed the card would
  overflow it; `max-width: 100%` alone would not help (a `nowrap` box caps its
  box, not its text), so the real fix would be dropping `nowrap` or adding an
  ellipsis — deferred until there is such content rather than guessed at now.
  The same caveat applies to `.timeline-period` (T6) and `.experience-period`.
- **Project cards are touched by the same JS path.** Their `is-pending` rule and
  `transition` had to change for the reveal to work at all once
  `initializeCardsAnimation()` was removed. Their hover styling (the JS
  `mouseenter` that writes `translateY(-8px) scale(1.02)` inline) is untouched
  and remains T9's job — the plan's T9 acceptance explicitly targets that
  scaling.
- **Lighthouse was not re-run for T7** (the binary is still not installed in this
  session; `npx` will not fetch it). No markup, roles, headings or focusable
  elements changed, and `contrast.mjs` covers every changed surface. T11/T14
  should re-baseline.

*Second independent review (2026-10-29, after the grid fix): no actionable
findings.* The reviewer re-checked token definitions in both schemes, the
guard-before-arming ordering in `createObserver()`, that no later rule
redefines `transition` on the cards (so the final reduced-motion block wins),
the `translate`/`transform` decoupling, the `minmax(min(100%, 300px), 1fr)`
arithmetic (273px track at a 305px layout viewport, 313/328px at 360/375, single
`1fr` above), `nowrap` safety against the current strings, and the plan diff
itself; it recomputed the badge contrast independently (≈5.27:1 light /
≈4.9:1 dark) and got the same pass. Its only suggestion — `max-width: 100%` as
future hardening for the badge — is recorded in the note above instead of being
applied, because it does not actually constrain a `nowrap` box and would add a
false sense of safety. It also repeated the two accepted, pre-existing
project-card items (`scale(1.02)` in the JS hover and the un-transitioned
`box-shadow`), both already assigned to T9.

### T8 – Skills as simple tags ✅ Done (2026-11-06)
- [x] **Objective:** Replace progress bars with pill tags grouped in category
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

**Completion log (T8)**

*What changed.* `_includes/skills_section.html`:
- the `.skills-list` → `.skill-item` → `.skill-name`/`.skill-bar` →
  `.skill-progress` tree collapses to
  `<ul class="skill-tags" role="list"><li class="skill-tag">{{ subitem.name }}</li></ul>`;
- `.skills-grid`, `.skill-category` and the `h3` label wrappers are unchanged, so
  the section header, heading order and anchors are untouched;
- `role="list"` is explicit because `list-style: none` drops list semantics in
  Safari/VoiceOver; the `value` field is no longer read.

`assets/js/script.js`:
- the unused `skillBars` const is gone (it was declared and never referenced);
- `animateSkillBar()` is deleted;
- the `.skill-progress` branch is removed from the observer callback and from
  the observed-element selector, which is now
  `.timeline-item, .stat-number, .certification-card, .project-card`.

`assets/css/style.css`:
- `.skill-item`, `.skill-name`, `.skill-bar`, `.skill-progress` deleted;
- `.skill-tags`: `display: flex; flex-wrap: wrap; justify-content: center;
  gap: 8px`, `list-style: none`, zero margin/padding;
- `.skill-tag`: pill (`--radius-full`), `--portfolio-primary-soft` background,
  `--color-card-border` hairline, `--color-text`, 13px/500, `6px 12px` padding;
  hover moves the border and text to `--portfolio-primary` with a
  `--duration-fast` transition — emphasising without implying an action, so no
  lift/transform (the T6 rule for non-interactive surfaces);
- `.skills-grid`: `repeat(auto-fit, minmax(350px, 1fr))` →
  `repeat(auto-fit, minmax(min(100%, 280px), 1fr))`;
- `.skill-category` gains `--shadow-xs` and its `h3` margin tightens to 20px,
  matching the certification cards from T7.

*Deviation from the plan's stated reason (observed fact).* The plan says
`minmax(350px, 1fr)` "overflows at 320px". It did **not**: the pre-existing
`@media (max-width: 768px) { .skills-grid { grid-template-columns: 1fr } }`
override (still present, untouched) already prevented that, and T7's
`t7classic.mjs` measured the skills cards at 273px wide / inside the container at
320px before this change. The `minmax(min(100%, 280px), 1fr)` change is
therefore about removing the arbitrary 350px floor, and its only visible effect
is above 768px: 3 columns at 1024 (was 2) and a denser grid through ~1100px.
The ≤768 override was deliberately **not** removed, to keep the mobile layout
exactly as it was.

*Measured (`t8probe.mjs`, 16 runs = 1440/1024/768/375 × EN/IT × light/dark).*
- 11 tags in 3 categories on every run; 0 leftover `.skill-bar`,
  `.skill-progress`, `.skill-item`, `.skill-name` nodes;
- titles match the data in both languages (see the progress row);
- every category is `<ul class="skill-tags" role="list">` with
  `list-style-type: none`; tags are `radius: 9999px`, 13px/500, 92×35, tinted;
- no tag crosses its card's right edge in any run;
- columns: 3 at 1440 and 1024, 1 at 768 and 375; `docW == clientW` everywhere;
  the full breakpoint map (including 2 columns at 769–1023 and the collapsed
  4th track at ≥1280) is in the `t8grid.mjs` sweep below;
- 320px with a classic scrollbar: `clientW 305`, `docW 305`, one 273px column,
  widest tag right edge 264 < card 289;
- hover: border `rgba(15, 23, 42, 0.08)` → `rgb(79, 70, 229)`, colour
  `rgb(15, 23, 42)` → `rgb(79, 70, 229)`, geometry unchanged at 92×35;
- no-JS: 11 tags, 3 categories (static markup, nothing to reveal);
- 0 console/page errors.

*Readability.* `contrast.mjs` reports **0 failures** over 279 (EN) / 280 (IT)
elements × light/dark. The count fell from 312/313 by exactly 33 — 11 names, 11
bars and 11 progress tracks no longer exist — which confirms nothing else
dropped out of the audit. Tag text is `--color-text` on the accent tint (very
high contrast both ways); the hover accent is the same pairing used by the T7
badge, already measured at ≈5.2:1 / ≈4.7:1.

*Regression checks.* `t6probe.mjs` and `t7probe.mjs` still report **16/16** with
0 console errors after the observer selector change (timeline, certification and
project reveals share it); `overflow.mjs` clean at 320/375 × EN/IT × light/dark;
`t7classic.mjs` confirms `docW == clientW == 305` at 320px with the certifications
and projects grids unchanged at 273px; `node --check` exit 0; Jekyll 4.4.1 and
`jekyll _3.10.0_ build` exit 0, parity output has 11 tags per language and no bar
markup, `_site/plans` absent, `apps/piano/` untouched.

*Visual review (`t8shots.mjs`, `t8view.mjs`).* Reviewed at 1440/1024/375 ×
light/dark in EN and IT. Tags read as a compact, scannable list; the 5-tag
category wraps to two rows at 1024 and on phones while the 3-tag categories stay
on one. `t8shots.mjs`'s clip maths misframed the 375 capture (title clipped at
the top), so the 375 and dark-1440 review used `t8view.mjs`, which scrolls the
section into view and captures the plain viewport — the section itself was
correct in both.

*Column map (`t8grid.mjs`, 360/600/768/769/900/1023/1024/1279/1280/1440).* The
CSS comment on `.skills-grid` claimed "2 in the 769-1000 range"; the sweep showed
it runs to 1023 and that a 4th track appears at 1280+. Measured: 1 column at
≤768 (the override), 2 at 769–1023 (cards 349–356px), 3 at 1024–1279 (310–315px),
and 4 tracks at ≥1280 with the empty one collapsed, so the three cards still fill
the row (395–400px). `docW == clientWidth` at every width. The comment was
corrected to match.

*Independent review (2026-11-06): no actionable findings.* The reviewer confirmed
the `skillBars` const was genuinely unused on HEAD, that all four bar rules and
every JS reference were removed together, that every token the new rules consume
exists in both schemes, that no generic `ul`/`li` rule interferes, that the ≤768
`1fr` override really is still inside the `max-width: 768px` block, and that a
repo-wide sweep finds no `skill-progress`/`skill-bar`/`data-skill`/
`animateSkillBar`/`skillBars`/`skills-list` references outside this plan. It
independently recomputed the column arithmetic and flagged one thing worth
checking: my CSS comment's upper bound for the 2-column range (see the sweep
above, now fixed). Residual risks it listed — probes outside the repo, Lighthouse
not re-baselined, the reduced-motion colour transition, and a future
`t.sections`/`items` key mismatch rendering an empty `<ul>` — are already noted
here or are data-drift concerns rather than defects.

*Known limits / notes.*
- **`value` in `_data/skills.yml` is now unreferenced.** Left in place on
  purpose (the plan asks for it), so the bars could be restored without a data
  migration. It is not output, so it cannot leak into the page.
- **The `.skill-tag` hover keeps a 150ms colour transition under
  `prefers-reduced-motion`.** It is colour only — no movement — so it does not
  need suppressing, and the probe reports `0.15s, 0.15s` as expected. **T11
  resolved this:** the global reduced-motion block now zeroes it too (0.01ms),
  which is simpler than keeping a per-surface exception.
- **The plan's 320px-overflow premise was wrong** (see the deviation note); the
  grid change is a density improvement above 768px, not a fix for an active
  overflow. Recorded so T12/T14 do not hunt for a regression that never existed.
- **An empty `<ul>` would render if a `t.sections` key ever lost its matching
  `items` key** (`section_items` would be nil). The two files are co-versioned
  and correct today, so this is data-drift hygiene, not a defect; a
  `{% if section_items %}` guard could be added if the data ever becomes
  dynamic.
- Lighthouse was not re-run (still not installed in this session). The change
  removes 33 elements and adds list semantics (`ul[role=list]` + `li`), so the
  `list`/`listitem` axe rules change shape; T11/T14 should re-baseline.

### T9 – Projects ✅ Done (2026-11-08)
- [x] **Objective:** Refine project cards (gradient icon panel, overlay link,
  category, title, description, tech pills) and the filter pill group.
- **Files:**
  - `style.css` around lines 1492–1633 (now the projects block at 1864–2100)
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

**Completion log (T9)**

*What changed.* `_includes/projects_section.html`:
- the GitHub link gains `rel="noopener noreferrer"` and
  `aria-label="GitHub: {{ item.title }}"`, and its glyph gets
  `aria-hidden="true"`. This is the **`link-name` Lighthouse failure that has
  followed the project since T1** (an icon-only link has no accessible name);
  it now has one, with no new data keys (the label is language-neutral because
  "GitHub" is a proper noun and the project title is already translated).
- no other markup changed: the section, heading order, filter attributes and
  `data-category` values are untouched. The filter wrapper gains
  `role="group"` so its existing `aria-label` ("Filter projects" / "Filtra
  progetti") is actually exposed — on a bare `div` the label was ignored.

`assets/js/script.js`:
- the `mouseenter`/`mouseleave` pair that wrote
  `card.style.transform = 'translateY(-8px) scale(1.02)'` (and reset it on
  leave) is deleted. Hover is now CSS only, so the inline style no longer
  outranks the stylesheet and the card no longer scales.
- the filter logic, the observer reveal and `projectCards` (still used by the
  filter) are unchanged.

`assets/css/style.css`:
- `.filter-badge`: `padding` 6/12 → **8/16**, `min-height: 38px`, secondary
  text colour, `font-family: inherit`, and the `transition: all` shorthand
  replaced with the four properties that actually change
  (`background-color`, `border-color`, `color`, `box-shadow`). Hover now also
  lifts the border and text colour.
- `.filter-badge.active` is unchanged apart from inheriting the shorter
  transition; the T2-review `color-mix` glow is kept as the token-free value it
  was, since no glow token exists (as the plan anticipated).
- `.projects-filter`: `flex-wrap: wrap` and margin 24 → 32 (the gap stays 8).
- `.projects-grid`: `minmax(350px, 1fr)` → `minmax(min(100%, 320px), 1fr)`;
  gap 32 → 24.
- `.project-card`: `--color-background` → **`--color-surface-raised`**
  (the T6/T7 raised step above `.section--alt`) + `--shadow-xs`, flex column,
  `width: 100%`, **`max-width: 420px`**, `justify-self: center`, and
  `box-shadow`/`border-color` added to the transition list (the T7 review's
  "shadow snaps" note). Hover: `translateY(-8px)` → **`-4px`**, `--shadow-lg`,
  border to `--color-border`.
- `.project-image`: flat `--color-secondary` → a soft accent
  `radial-gradient` over `--color-background`, flex-centred.
- `.project-placeholder` (the project mark): a full-bleed 100% box becomes a
  **92px disc** on `--color-surface-raised` with the accent glyph at 36px,
  matching the certification icon shape; it **fades out** on hover/focus so it
  cannot show through the overlay (see the visual review below).
- `.project-overlay`: revealed on `:hover` **and `:focus-within`** — the second
  is what makes the link usable by keyboard.
- `.project-link`: `display: inline-flex` with a fixed **56×56** box and no
  padding (the glyph's line-height made the old `border-radius: 50%` pill an
  **oval**, measured in the first screenshot pass); `:focus-visible` overrides
  the ring to white because the overlay is dark in both themes.
- `.project-content`: flex column, `flex: 1`; `.project-category` 12px/600
  with 0.6px tracking; `.project-title` 19 → **22px**; `.project-description`
  15px with `text-wrap: pretty`; `.project-tech` gets `margin-top: auto` so
  pills line up across cards; `.tech-tag` becomes a `9999px` **pill** (was a
  6px-radius chip) at 12px with a hairline.

*Why the card is capped at 420px.* With one project in the data, `grid` +
`auto-fit` gave the single card a **1248px** track at 1440 (measured
`gridCols: "1248px 0px 0px"`), so the fixed 200px image read as a letterbox
banner (`t9base.mjs` captures this). `auto-fit` collapses the empty tracks, so
`justify-self: center` + `max-width` centres the lone card while multiple cards
still fill their own tracks. Measured: card `l` equals
`gridL + (gridW − 420) / 2` at every width (offset 0–0.5px), and the throwaway
4-project copy lays out 3-across at 1440 / 2×2 at 1024 with equal row heights.

*Measured (`t9probe.mjs`, 16 runs = 1440/1024/768/375 × EN/IT × light/dark).*
- one card, 420×410 (328×434 at 375), centred (0–0.5px offset), revealed
  (`is-pending` gone, opacity 1, `translate: none`), radius 12px, shadow present;
- image panel 200px with a `radial-gradient`, mark disc 92×92 at `50%`;
- overlay `opacity: 0` at rest with a non-transparent scrim;
- link: label `GitHub: Portfolio`, `rel="noopener noreferrer"`,
  `target="_blank"`, `https` href, **56×56** hit area;
- tech pills: 4, `9999px`, 12px, tinted;
- type hierarchy 12 / 22 / 15px;
- filter pills: 3, `9999px`, ≥38px high, 13px, first one
  `aria-pressed="true"` + `.active`, the other two `false`;
- hero "Personal Projects" target still **1**; `docW == clientW` in every run;
  0 console/page errors.

*Filters (real mouse clicks).* All → Mobile → Web → All:
Mobile `aria-pressed=true` and the single **web** card becomes `display: none`;
Web `true` with the card back; All `true` with the card shown. **Real Enter** on
a programmatically focused Mobile pill (`focusedBeforeEnter: "mobile"`) flips
`All=false, Mobile=true, Web=false` and hides the card, so keyboard activation
works. On the throwaway 4-project copy the same clicks show 3 / 1 / 4 cards.

*Hover (real `Input.dispatchMouseEvent`).* Before: `transform: none`,
overlay `0`. Over: `matrix(1, 0, 0, 1, 0, -4)`, overlay `1`, shadow raised —
`scale` is untouched (the old JS wrote `1.02`). After moving away:
`transform: none`, overlay `0`.

*Keyboard (real Tab presses).* Focusing the last filter pill and pressing Tab
lands on `.project-link` after **3** presses (All → Mobile → Web → link):
`:focus-visible` true, outline `rgb(255, 255, 255) solid 2px`, overlay
`opacity 1`, mark `opacity 0`, accessible name `GitHub: Portfolio`. Confirmed
in both themes by `t9focus.mjs` screenshots.

*320px / no-JS / reduced motion.* 320px with a classic scrollbar:
`clientW 305`, `docW 305`, card 273px inside 16–289 — no overflow. No-JS: the
card renders (`display: flex`, opacity 1) and the static markup carries
`All=true, Mobile=false, Web=false`. Reduced motion: `.project-card`
`transition-duration` is `0s` (T7 block) so the hover is instant; the filter
pill keeps its 150 ms colour transition (colour only).

*Visual review (`t9base.mjs`, `t9shots.mjs`, `t9focus.mjs`).* Three defects were
found and fixed before sign-off: the 1248px letterbox card (→ 420px cap), the
disc showing through the 72%-opaque overlay as a second ring (→ mark fades on
hover/focus), and the GitHub link rendering as an **oval** because the glyph's
line-height exceeds its width (→ fixed 56×56 flex box). Re-shot after each fix
at 1440/1024/375 × light/dark and on the 4-card copy.

*Independent review (2026-11-08): two P3s, both fixed.* The reviewer found no
defect in the filter logic, the hover/reveal decoupling or the tokens, but
raised two keyboard-focus gaps that the first Tab-walk did not exercise because
it started from an already-revealed card:

1. **The white ring was invisible for the first 250 ms in light mode** — the
   scrim fades in, so the ring painted white-on-near-white until it landed.
2. **A card still held at `opacity: 0` by the reveal could swallow focus** —
   if the observer had not fired when the browser scrolled the link into view,
   the whole subtree (card, overlay and focus ring) rendered invisible.

Both are now covered in CSS **and** JS:

- `.project-card:focus-within` sets `opacity: 1`, `translate: none` and drops
  `translate`/`opacity` from its transition list, so a focused card is fully
  visible in the same frame;
- `.project-card:focus-within .project-overlay { transition-duration: 0s }`
  makes the scrim instant on the keyboard path (hover keeps its 250 ms fade);
- `createObserver()` adds a `focusin` listener on each project card that
  removes `is-pending` for real, so blurring cannot fade a card the user has
  already seen back to `opacity: 0` while the observer catches up.

*Verified with `t9focus2.mjs`* (1440, light + dark). Forced cold state
(`.is-pending` re-applied, 700 ms to settle): `pending true`, `opacity 0`,
`translate 0px 24px`, overlay 0. **Immediately after a real Tab** (one CDP
round-trip, no wait): `pending false`, `opacity 1`, `translate none`, overlay
`1` with `transitionDuration 0s`, `:focus-visible true`, outline
`rgb(255, 255, 255) solid 2px`, offset 3px — both themes identical. After
blurring: `opacity 1`, `pending false` (no fade-out), overlay back to 0 with
0.25 s. Hover path unchanged: overlay 0 → 1 with `transitionDuration 0.25s`.
The immediate light-theme screenshot confirms the ring is legible over the
scrim from the first frame.

*Also verified.* `overflow.mjs` clean ×8 at 320/375 × EN/IT × light/dark;
`t7classic.mjs` still `docW 305 == clientW`; `contrast.mjs` **0 failures** over
279/280 elements × 4 (unchanged count — no text was added or removed);
`t6probe.mjs`, `t7probe.mjs` and `t8probe.mjs` all still **0 failures** after the
JS hover removal and the `focusin` listener; `t9probe.mjs` still **16/16** after
the focus fixes; `node --check` exit 0; Jekyll 4.4.1 and
`jekyll _3.10.0_ build` exit 0 with the new `rel`/`aria-label` in both language
outputs and the filter wrapper's `role="group"` carrying "Filter projects" /
"Filtra progetti"; `_site/plans` absent; `apps/piano/` untouched.

*Second independent review (2026-11-08, after the focus fixes): one P3, fixed.*
The reviewer confirmed the four changed files belong to T9, that
`:focus-within` correctly out-cascades `.project-card.is-pending` (equal
specificity, later in the file), that dropping `translate`/`opacity` from the
focus-path transition makes the reveal instant without breaking blur behaviour,
that the `focusin` listener sits after the `IntersectionObserver` guard, that
every token exists in both schemes, and that the removed JS hover left no
dangling references. Its P3: **the new `.project-card:focus-within`
`transition` (0,2,0) out-specified the reduced-motion `transition: none`
(0,1,0)**, so a card that contained focus would animate its hover lift even with
"reduce motion" enabled — a small regression against HEAD, which zeroed the
card transition in every state.

Fixed by listing the focus state in the existing end-of-file block:

```css
@media (prefers-reduced-motion: reduce) {
  .certification-card,
  .project-card,
  .project-card:focus-within {
    transition: none;
  }
}
```

*Verified with `t9rm.mjs`* (1440, light; `{reduce, normal} × {rest, focused,
focused+hover, hover}`):

- **reduce**: every state reports `transition-duration: 0s` and
  `transition-property: none`; the lift is already at
  `matrix(1, 0, 0, 1, 0, -4)` **50 ms** after the pointer enters (no animation).
- **normal**: rest `0.25s, 0.25s, 0.25s, 0.5s, 0.5s`; focused
  `0.25s, 0.25s, 0.25s` (transform/box-shadow/border only); hover at 50 ms is
  mid-transition (`-2.41px`) and settles at `-4px`, so ordinary hover still
  animates as designed.

`t9probe.mjs` is still **16/16**, `t9focus2.mjs` still shows the cold-state card
revealed at opacity 1 with the scrim at `0s` on the first frame, and the
reduced-motion pass still reports `card 0s`. The reviewer's other notes (probes
outside the repo, Lighthouse not re-run, empty "Mobile" filter, hard-coded
`#ffffff` on the link/ring with a documented rationale) were already recorded
here and required no change.

*Known limits / notes.*
- **"Mobile" shows an empty grid on the real site.** The three mobile projects
  are commented out in `_data/projects.yml` (only the web Portfolio is live), so
  the filter correctly hides everything and leaves the section blank. The
  throwaway copy proves the logic works with 3 mobile + 1 web card. An
  "empty state" message would need new EN/IT copy, which is a content decision,
  not a styling one — left to T13/content work.
- **The card cap is a layout decision, not a data one.** `max-width: 420px`
  keeps a lone card from becoming a banner; with three live projects they fill
  400px tracks at 1440 and the cap never binds. If more projects are added and a
  wider card is wanted, the cap is the single value to change.
- **`scale` is gone from the project hover.** The plan's T7 follow-up asked for
  exactly this; the lift is now 4px (was 8px + 2% scale via JS). The T7 review's
  "`box-shadow` not transitioned" note is also fixed by adding it to the
  transition list.
- **Reduced motion does not disable the overlay/mark fades** (they are opacity
  fades, like the pre-existing overlay behaviour); **T11 resolved this** with
  the site-wide `reduce` block, so they are instant now too. Note the focus path
  was already `transition-duration: 0s` regardless of preference, so a keyboard
  user never waits for the scrim, and the card's own transition is `none` in **every**
  state under reduced motion (the `:focus-within` rule is listed in that block
  for the same reason).
- **Lighthouse was not re-run** (unavailable in this session). The `link-name`
  fix uses the same `aria-label` + `aria-hidden` pattern that T2 used to clear
  the footer icons, and the probe asserts the accessible name exists; a real
  audit is still outstanding for T11/T14.

### T10 – Contact and Footer ✅ Done (2026-11-08)
- [x] **Objective:** Contact rows as elegant cards; a refined form (larger
  inputs, soft borders, accent focus ring); a minimal footer with refined
  social icons.
- **Files:**
  - `style.css` around lines 505–575 and 1634–1743 (the form controls are at
    468–530, contact/footer at 2105–2270)
  - `_includes/footer_section.html`: add `aria-label`s and
    `rel="noopener noreferrer"`
- **Notes:** Keep the `mailto:` submit behaviour.
- **Acceptance:**
  - Required-field validation works.
  - Submitting opens the mail client.
  - Focus states are visible in both themes.
- **Verify:** manual check.

**Completion log (T10)**

*What changed.* `_includes/footer_section.html`:
- the four `target="_blank"` social links gain `rel="noopener noreferrer"`.
  Their `aria-label`s and `aria-hidden` glyphs were already added in T2, so
  nothing else changed. (Five links per page now carry the attribute — four in
  the footer, one on the project card.)

`assets/css/style.css`, form controls (shared design-system block, used only by
the contact form):
- `.form-control`: `min-height: 44px` (padding + line-height already land at
  ~44.5px, so the floor only matters if the font metrics change), padding
  `10px 16px` (was `8px 12px`), `--radius-md` (10px, was `--radius-base` 8px).
  Textareas get `12px` vertical padding.
- `.form-control:focus` now sets `box-shadow: var(--focus-ring)`; it previously
  set `box-shadow: none` and relied on a border colour change alone, which was
  the weakest possible focus indicator. The global outline stays suppressed to
  avoid a double ring.
- `.contact-form .btn { min-height: 44px }` so the primary action matches the
  controls above it (the shared `.btn` is 40px; scoped here so the hero buttons
  keep their size).

Contact section:
- `.contact-item`: padding `16/20`, `--shadow-xs`, and a border/shadow
  transition; `:hover` and **`:focus-within`** move the border to the accent
  and the shadow to `--shadow-sm`. No lift — only the link is clickable, so a
  lift would misrepresent the target.
- `.contact-icon`: the accent **gradient** circle becomes a 44px soft accent
  disc (`--portfolio-primary-soft` + accent glyph), matching the certification
  and project marks.
- `.contact-form`: gains `--shadow-sm`; the `:hover { border: … }` rule is
  removed (hovering a form is not a meaningful affordance — nothing happens
  until you type) and the bare `transition: border 250ms` is replaced with an
  explicit `border-color`/`box-shadow` transition.

Footer:
- padding 32 → 40; `.footer-content p` is 15px `--color-text-secondary`.
- `.social-links` gap 16 → 8; each link is 40px with a **hairline border**
  (the surface-coloured disc was invisible on the surface-coloured footer) and
  `--color-text-secondary` glyph; hover fills with the accent and uses
  `--color-btn-primary-text`; `transition: all` replaced with four explicit
  properties. The focus ring comes from the global `:focus-visible` rule
  (accent, 2px, 2px offset) — see the review note below.

*Measured (`t10probe.mjs`, 16 runs = 1440/1024/768/375 × EN/IT × light/dark).*
- 5 contact cards, each with a 44×44 disc at `50%`, 12px card radius, shadow;
- form 484×571 at 1440 (328×539 at 375), 12px radius, shadow;
- four controls at **45px** high (44 + 1px borders), 10px radius, all
  `required`, email `type="email"`; labels 13px; submit 44px;
- footer 5 social discs at 40px / `50%` with a visible border, every one
  labelled, every glyph `aria-hidden`, and `rel="noopener noreferrer"` on all
  four `target="_blank"` links;
- contact grid 2 columns at 1024/1440 and 1 at 768/375; `docW == clientW` in
  every run; 0 console/page errors.

*Focus (both themes, real `:focus`).* Every control reports an accent border
plus `rgba(79,70,229,.35) 0 0 0 ~3px` (light) or
`rgba(129,140,248,.45) 0 0 0 ~3px` (dark) — a ring, not just a hue change, and
visible against both surfaces. Focusing a contact link accents that card's
border and reports `:focus-within` true, so the keyboard path gets the same
emphasis as hover.

*Validation and mailto (real clicks).* Empty submit: `checkValidity()` false,
the submit handler never runs (`submits: 0`, `resets: 0`) and focus moves to
`#name` — native validation, untouched. Filled submit: handler runs once, the
form resets, the document does not change, and Chrome reports
`Page.frameScheduledNavigation` / `Page.frameRequestedNavigation` with
`mailto:simonedelgrosso@outlook.it?subject=Hello%20there&body=A%20message%20body.%0A%0A--%0ATest%20User%0A%3Ctest%40example.com%3E`
— the exact encoded recipient, subject and signature block, i.e. the mail
client hand-off is real and not just a string in the code. (A `location.href`
setter on `Location.prototype` cannot spy on this: `location` is an exotic
object whose `[[Set]]` bypasses JS accessors, which is why the probe switched
to the CDP navigation event.)

*Independent review (2026-11-08): one P3, fixed.* The reviewer confirmed the
three files are T10-only, that every token used exists in both themes, that the
`.contact-form input:focus` / `.form-control:focus` accent tokens resolve to the
same value in both schemes (redundant but not divergent), the 44.5px control
arithmetic under the global `border-box`, the 320px width budget, that
`rel="noopener noreferrer"` now covers exactly the five `target="_blank"` links
(and correctly none of the `mailto:` ones), and hand-checked contrast
(≈7.4:1 footer text light, ≈5.6:1 contact glyph). Its P3: the
`.social-links a:focus-visible { outline-offset: 2px }` I added was a **no-op**,
because the global `:focus-visible` already sets `2px` — the rule could not do
what its comment claimed and would have silently pinned the discs if the global
offset were ever retuned.

Removed the rule. `t10socialfocus.mjs` then measured the focused disc in both
themes: `outlineColor` `rgb(79,70,229)` / `rgb(129,140,248)`, `solid`, `2px`,
`offset 2px`, `:focus-visible` true, `40×40` — i.e. the ring still renders
exactly as before, from the global rule.

*Also verified.* `contrast.mjs` **0 failures** over 279/280 elements × 4
including the new footer text, social glyphs and the accent-on-soft contact
discs; `overflow.mjs` clean ×8; `t7classic.mjs` still `docW 305 == clientW`;
`t6probe.mjs`, `t7probe.mjs`, `t8probe.mjs` and `t9probe.mjs` all still
**0 failures** (the shared `.form-control` change does not touch them);
`node --check` exit 0; Jekyll 4.4.1 and `jekyll _3.10.0_ build` exit 0 with
5 `rel` links per page, `_site/plans` absent, `apps/piano/` untouched.

*Visual review (`t10base.mjs`, `t10shots.mjs`).* Contact and footer reviewed at
1440/375 × light/dark in EN and IT, plus a focused input and a hovered social
icon in both themes. The form reads as a card on both surfaces, the focus ring
is unmistakable, and the social discs have a visible edge on the white footer.

*Known limits / notes.*
- **The scroll-to-top button overlaps the last social icon at 375px** — the
  button is a fixed disc inset from the bottom-right, and at that width the
  footer spans the full container, so it sat on top of the "X" icon when
  scrolled to the very bottom. **Fixed in T11**: the button is 44px at a 16px
  inset on phones and the footer reserves 72px of bottom padding, so the icons
  end 12px above it at both 375 and 320 (measured; no overlap).
- **The `.social-links a:hover` lift is 2px of motion** and was not suppressed
  under `prefers-reduced-motion`; **T11's global block** zeroes it.
- **`.form-control` is a design-system class**, so the 44px height and 10px
  radius also apply to any future form. Only the contact form uses it today
  (verified: no other include references it).
- **Lighthouse was not re-run** (still unavailable). The footer `link-name`
  audit was already fixed in T2; nothing here adds or removes accessible names.

### T11 – JS-generated UI and reduced motion ✅ Done (2026-11-08)
- [x] **Objective:**
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

**Completion log (T11)**

*What changed.* `assets/js/script.js`:
- a single `reduceMotion` flag, read once from
  `matchMedia('(prefers-reduced-motion: reduce)')` (guarded for engines without
  `matchMedia`), drives every JS effect;
- `smoothScroll()` and `scrollToTop()` use `behavior: 'auto'` when it is set;
- `animateCounter()` writes the target value and returns instead of ticking;
- `typeEffect()` is not started: `init()` sets the first phrase directly, so
  there is no deleting loop and no cursor blink;
- `createParticles()` returns before creating the canvas, so there is no loop,
  no resize listener and nothing repainting;
- `createPreloader()` no longer carries a `cssText` block and no longer injects
  its own `@keyframes`. It builds
  `<div id="preloader" aria-hidden="true"><div class="preloader__spinner">`,
  waits for `load`, holds the overlay for a 250 ms minimum (so a fast load does
  not flash), then adds `.is-hidden` and removes the node on `transitionend`
  (with a 600 ms safety timeout and a `removed` guard, because both can fire).
  Under reduced motion it removes immediately — **1.5 s → ~0.3–0.7 s after
  load**;
- `createScrollToTopButton()` toggles an `.is-visible` class instead of writing
  `style.display`, uses a passive scroll listener, and paints the initial state
  explicitly (a restored scroll position fires no scroll event, and the button
  used to be visible on every fresh load until the first scroll).

`assets/css/style.css`:
- new `#preloader` (fixed inset overlay, `background: var(--color-background)`,
  0.3s opacity transition) and `.preloader__spinner` (52px, accent top border,
  `preloader-spin 0.9s`), so the theme tokens decide both colours. The old JS
  read `--portfolio-dark`, a per-theme alias that already equals
  `--color-background` in both schemes (`#f8f9fb` / `#0b0d12`) — this switches
  to the canonical token rather than fixing a bug;
- `.scroll-to-top` is now hidden by default (`opacity: 0`, `visibility:
  hidden`, `translateY(8px)`) and shown by `.is-visible`; the nested `i { }`
  rule is un-nested (it was the only instance of plain CSS nesting in the
  file), `:hover` uses `--color-primary-hover`, and `@media (max-width: 480px)`
  makes the disc 44px at a 16px inset;
- `.footer` reserves 72px of bottom padding at ≤480px so the fixed disc cannot
  cover the last social icon (the T10 finding);
- a final site-wide block:

  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      transition-delay: 0s !important;
      scroll-behavior: auto !important;
    }
    .typing-container .cursor { animation: none !important; opacity: 1; }
  }
  ```

  The catch-all is deliberate: enumerating every surface by hand is how T6/T7/T9
  each ended up missing one. The cursor needs the explicit override because the
  blink keyframes end at `opacity: 0`, which a single 0.01 ms iteration would
  otherwise leave as an invisible caret.

*Measured (`t11probe.mjs`, both modes; timings relative to the `load` event).*

| | normal | reduced |
|---|---|---|
| preloader background | `rgb(248,249,251)` light / `rgb(11,13,18)` dark | same |
| preloader inline style | none | none |
| removed after `load` | **700 ms** | **305 ms** |
| particle canvas | present | **absent** |
| typing text | animates (`cursorAnim: blink`) | `Full-Stack Developer`, `cursorAnim: none` |
| counters | animate from 0 | final (3/1/3) immediately |
| scroll 60 ms after click | 1398 of 1400 (smooth) | **0 (instant)** |
| button at top | `visibility: hidden`, no inline style | same |
| button after scroll | `.is-visible`, `visible` | same |
| progress bar after scroll | 395.8px | 395.8px |

`t11extra.mjs` confirms the preloader's dark-mode background equals the dark
theme's `--color-background` (`#0b0d12`) and its spinner arc is the accent
(`rgb(129,140,248)`), so there is no dark flash in light mode and no light flash
in dark mode. Computed `transition-duration`/`animation-duration` under reduced
motion are `1e-05s` on every audited surface (scroll-to-top, progress bar, skill
tag, social link, stat, button); without the preference they are real
(`0.25s, 0s, 0.25s, 0.15s` / `0.05s` / `0.15s` / `0.25s`).

*Drawer check (`t11nav.mjs`).* The global block touches every element, so the
mobile drawer was re-verified in both modes: closed → `visibility: hidden`,
off-canvas at 360, links out of the flow; open → visible at 0, `aria-expanded`
true, `nav-open` set, focus on the hamburger; Escape → closed, focus returned.
Identical in both modes.

*Footer clearance.* `t11probe.mjs` at 375 and 320, scrolled to the very bottom:
no rectangle overlap between the button and `.social-links` (icons end 12px
above the button at both widths), `docW == clientW`. `t11clear.mjs` then swept
the whole mobile band — 320/360/375/400/420/480/481/500/600/700/768 — and found
**no overlap at any width**. Above 480px the button keeps its 50px/30px
geometry; there the rectangles overlap vertically (`dy ≈ −40`) but never
horizontally (`dx` ≥ 37), so nothing collides. The tightest case is 360px:
`dx = −3` (3px of horizontal overlap) is covered by the 12px vertical gap the
footer padding creates.

*Review response (2026-11-08).* An independent review found no runtime defect
and one documentation error: the comment (and this log) claimed the old
preloader "happened to match" the page background via `--portfolio-dark`, when
in fact that token is theme-defined and already equal to `--color-background`
in both schemes. Both texts now say the change switches to the canonical token
rather than fixing a mismatch. The same review asked whether the 481–768px band
could still collide; the `t11clear.mjs` sweep above answers it (no overlap),
and that probe is now part of the record for T12's breakpoint pass.

*Also verified.* `contrast.mjs` **0 failures** over 279/280 elements × 4;
`overflow.mjs` clean ×8; `t7classic.mjs` still `docW 305 == clientW`;
`t6probe`, `t7probe`, `t8probe`, `t9probe` and `t10probe` all still
**0 failures**; `node --check` exit 0; Jekyll 4.4.1 and
`jekyll _3.10.0_ build` exit 0; `_site/plans` absent; `apps/piano/` untouched.

*Visual review (`t11shots.mjs`).* Preloader captured in both themes (theme-colour
overlay, accent arc), the footer at 375/320 with the button clear of the icons,
and the top of the page with no button visible.

*Known limits / notes.*
- **The preference is read once per page load.** Changing the OS setting takes
  effect on the next navigation rather than mid-session. A live
  `matchMedia` listener could tear down the canvas/typing loop, but that adds
  state to unwind for a preference that rarely changes; recorded rather than
  hidden.
- **The catch-all `!important` block is broad by design.** It also zeroes
  colour/opacity transitions that are not motion. That is harmless (state
  changes simply apply instantly) and it means no future surface can forget the
  preference.
- **The preloader still lets the page scroll behind it** (no scroll lock) for
  its ~0.3–0.7 s lifetime. Locking would add a scroll-bar-width compensation
  dance for a very short window; not done.
- **Other inline `cssText` remains** on the particle canvas (line ~581) and the
  project filter's `style.display` (T9 code). The plan scoped T11's inline-style
  cleanup to the preloader; both are recorded for T12/T14 rather than changed
  here.
- **Lighthouse was not re-run** (still unavailable in this session).

### T12 – Responsive and cross-browser QA ✅ Done (2026-11-08)
- [x] **Objective:** Final polish across breakpoints. Add a 1024px breakpoint
  if needed.
- **Files:** `style.css` responsive blocks at around lines 1813–1931.
- **Acceptance:**
  - No horizontal scroll at 320, 375, 768, 1024 or 1440 in both themes and
    both languages.
  - Chromium and Firefox are consistent. Check Safari/iOS if available.
- **Verify:** manual comparison with the T0 screenshots; Lighthouse
  Accessibility ≥ 95 is optional.

**Completion log (T12)**

*What changed.* Two pre-existing defects were fixed; no other styling moved.

1. **Desktop navigation dead zone (769–~1100px).** At HEAD the hamburger only
   existed at ≤768px, so across that band the eight inline links squeezed the
   wordmark to **0px** and pushed `.nav-controls` **off-screen**. Measured
   before the change: EN `.nav-controls` right edge 883 against viewports of
   754/785/835/885 at 769/800/850/900, and 941 in IT up to 999; wordmark width 0
   at every width below 950 (EN) / 1000 (IT). The row needs ~1176px in Italian
   once the wordmark (186px) and controls (141px) are accounted for, so no
   amount of tightening makes 769px work.

   - `style.css`: the nav rules were **moved out of** the `max-width: 768px`
     block into a new `max-width: 1024px` block (the page layout keeps its own
     768px breakpoint), and a `min-width: 1025px and max-width: 1199px` band
     sets `.nav-menu { gap: var(--space-8) }` and `.nav-link { font-size:
     var(--font-size-md) }` so Italian still fits above the drawer.
   - `script.js`: `matchMedia('(max-width: 768px)')` → `(max-width: 1024px)`, so
     the breakpoint handler (close on widen, hand focus to a nav link) still
     agrees with the stylesheet. The two comments naming 768px were updated.

2. **Wordmark clipped at 320px.** It needed 135px and had 132px, so it rendered
   "Simone Del Gros…". The ≤360px block now uses a 12px container gutter
   (`--space-12`) instead of 16px, giving 140px of room for a 135px wordmark —
   no smaller type, no hidden prefix.

*Measured (`t12probe.mjs`).*
- 22 widths × 2 languages (320, 360, 375, 414, 480, 600, 640, 768, 769, 800,
  850, 900, 950, 1000, 1024, 1050, 1100, 1150, 1200, 1280, 1440, 1920):
  `docW == clientW` everywhere, wordmark never truncated, `.nav-controls` never
  past `clientWidth`, and the nav switches drawer→inline exactly at 1024→1025.
- Acceptance matrix (320/375/768/1024/1440 × EN/IT × light/dark): **20/20**
  pass, with the drawer at ≤1024 and the inline bar at 1440.
- Computed values confirm the band: at 1050/1100/1150 the gap is `8px` and the
  link font `15px`; at 1200+ it returns to `32px`/`16px`. At 769–1024 the menu
  reports `visibility: hidden`, `gap: 4px`, and the button is displayed.

*Drawer behaviour at the new breakpoint (`t12nav.mjs`).* At 900 and 1024:
hamburger visible, menu off-canvas at `left = width`, opens to `left: 0` with
`aria-expanded="true"` and `nav-open`, Escape closes and returns focus to the
hamburger. At 1025/1100/1200: hamburger `display: none`, menu inline and
visible. Resizing 900 → 1100 with the drawer open clears `menuActive`,
`aria-expanded` and `nav-open`, and moves focus to a `.nav-link` (the T3
handler, now firing at the new width).

*Firefox (159.0.1, headless, WebDriver BiDi).* BiDi is the only remote protocol
this Firefox exposes (no geckodriver/Playwright here), and it has no
`emulation.setEmulatedMedia`, so both themes were exercised through the site's
own `theme` storage key and the pre-paint script:
- **20/20** combinations (320/375/768/1024/1440 × EN/IT × light/dark):
  `docW == clientW`, wordmark `135/135`–`186/186`, controls on-screen,
  drawer ≤1024 / inline at 1440, and `data-color-scheme` matching the seeded
  theme in every run.
- Drawer (`t12ffdrawer.mjs`): `'inert' in HTMLElement.prototype` is **true**;
  open at 900 gives `menuRect = [0, 69, 900, 831]` against a `[0, 0, 900]`
  navbar — identical to Chromium, so `backdrop-filter` is creating the same
  containing block; `main.inert` and `footer.inert` are `true` while open and
  `false` after Escape; `body` overflow is `hidden`; Escape returns focus to the
  hamburger. Both T3 "verified in Chromium only" items are now closed.
- Layout parity: Firefox and Chromium screenshots at 1440/1024/375 (light and
  dark) match in structure and position; the visible differences are font
  rasterisation, overlay-vs-classic scrollbars, and the particle canvas
  (random). Firefox headless uses overlay scrollbars, so its 320px viewport is
  320px wide — a *less* strict case than Chromium's classic 305px.

*Also verified.* `contrast.mjs` **0 failures** over 279/280 elements × 4;
`overflow.mjs` clean ×8 at 320/375 × EN/IT × light/dark; `t7classic.mjs` still
`docW 305 == clientW`; `t6probe`, `t7probe`, `t8probe`, `t9probe`, `t10probe`
and `t11probe` all still **0 failures** after the breakpoint move;
`node --check` exit 0; Jekyll 4.4.1 and `jekyll _3.10.0_ build` exit 0;
`_site/plans` absent; `apps/piano/` untouched.

*Review response (2026-11-08).* An independent review found no runtime defect
and one documentation error: the reduced-motion comment above the drawer
override still said "this has to live after the `max-width: 768px` block", but
T12 moved that `transition` shorthand into the 1024px block, so the comment was
guarding the wrong rule. Corrected to name the 1024px block and to state that
the reduced-motion block must stay below it.

The same review noted that the 1199→1200 boundary was not in the measured set.
`t12edges.mjs` then measured 1023/1024/1025 and 1198/1199/1200/1201 in both
languages: the drawer ends at exactly 1024 (inline from 1025, `gap: 8px`/15px),
the compact band ends at exactly 1199 (`gap: 32px`/16px from 1200), and there is
no truncation, off-screen control or document overflow at any of those widths.

*Known limits / notes.*
- **Safari/iOS was not checked** — neither a device nor a WebKit engine is
  available in this environment. Everything else in the matrix is measured, and
  the CSS used here (`min()`/`clamp()`, `translate`, `inert`, `:focus-within`,
  `dvh`) is supported by Safari 16.4+ / iOS 16.4+, but that is reasoning, not a
  test.
- **The page layout breakpoint is still 768px**, deliberately: only the nav
  moved to 1024. At 769–1024 the nav is a drawer while the hero, contact and
  grids stay two-column. That is the intended split (the nav is width-hungry,
  the layout is not), but it is a visible behaviour change for tablets.
- **`--navbar-height` is set on the navbar element, not `:root`.** The earlier
  probes read it from `documentElement` and got an empty string in *both*
  browsers; the drawer inherits it from the navbar ancestor, and its measured
  `top` (69px) matches in both engines.
- **The 1025–1199px compact band is a measured compromise**, not a design
  preference: Italian needs the smaller gap and type to keep the wordmark
  whole. If the nav labels change, re-run the width sweep.
- **No-JS drawer fallback is still absent** (T3 deliberately accepted it, and
  the plan says "if it is wanted"). Not implemented here because it changes
  documented behaviour and needs a product decision.
- **Lighthouse was not run** (still unavailable). The optional a11y ≥ 95 gate is
  therefore unverified for this task.

### T13 – Update AGENTS.md ✅ Done (2026-11-08)
- [x] **Objective:** Make the repository instructions match reality and the
  new features.
- **Files:** `AGENTS.md` only — **expanded with approval**: the user opted to
  commit the verification probes, so `tools/probes/` (21 scripts),
  `_config.yml` (exclude) and `.gitignore` (parity output) are part of this
  task too. See the deviation note in the completion log.
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

**Completion log (T13)**

*What changed.* `AGENTS.md` (rewritten, all previous sections preserved and
extended):
- **Key Commands** now match the repo: `gem install jekyll`, `jekyll serve
  --livereload`, `jekyll build`, and `jekyll _3.10.0_ build --destination
  _site-3.10` for Pages parity. The `bundle install` / `bundle exec` lines are
  gone — there is no Gemfile, and `bundle exec jekyll` really does stop with
  "Could not locate Gemfile or .bundle/ directory" (verified). `htmlproofer` is
  documented as an extra install.
- **Repository Structure** gains `tools/probes/` and notes that `style.css`
  holds both token blocks and `script.js` does the toggle/drawer/reveal.
- New **Theming** section: `data-color-scheme` on `<html>` (not `body`), the
  pre-paint script, the `theme` storage key, the two token blocks, and the
  "prefer semantic tokens" rule with its documented exception (the white ring on
  the dark project overlay).
- New **Layout notes** section: the 1024px nav breakpoint (CSS and
  `matchMedia` must agree), the 1025–1199px compact band, the 768px page-layout
  breakpoint, and skills-as-tags with the unused `value`.
- New **Verification Tooling** section: how to start a server, a table of all 13
  committed checks with what each one asserts, and caveats (Chrome path /
  `CHROME_PATH`, one-at-a-time ports, UTF-16 output from PowerShell, Firefox
  BiDi, not a CI suite). `overflow.mjs` is called out as the width tool of
  record because it uses desktop metrics.
- **Testing Checklist** uses the real commands and adds the parity build and the
  `plans/ tools/ AGENTS.md` absence checks.
- **Common Gotchas** gains the CSS/`matchMedia` sync rule and a pointer to
  `plans/plan.md` as the source of truth.

`tools/probes/` (21 scripts, ~124 KB) — the curated regression suite: the three
general tools (`overflow.mjs`, `contrast.mjs`, `static.mjs`), the six
probe+analyzer pairs from T6–T11, the responsive trio (`t12probe.mjs`,
`t12edges.mjs`, `t12nav.mjs`), the classic-scrollbar width check
(`t7classic.mjs`) and the two optional Firefox BiDi scripts. The Chrome path in
each is now `process.env.CHROME_PATH || 'C:\Program Files\…\chrome.exe'`, so the
tools are not hard-wired to one machine.

`_config.yml`: `exclude` now covers `tools` and `AGENTS.md`. This fixes a real
leak — Jekyll copies root files without front matter, so with only `plans`
excluded, `AGENTS.md` **was** published at `/AGENTS.md`. Verified by building
with the old exclude list into a temp directory: `_site/AGENTS.md` = `True`,
`_site/tools` = `False`; with the new list both are `False`.

`.gitignore`: `_site-3.10/`, because the documented parity command writes there.

*Commands run exactly as documented (acceptance).*
- `jekyll build` → exit 0.
- `jekyll _3.10.0_ build --destination _site-3.10` → exit 0.
- Structure: `en/index.html`, `it/index.html`, `sitemap.xml`, `feed.xml`,
  `apps/piano/index.html` all present; `plans/`, `tools/`, `AGENTS.md` absent
  from **both** builds.
- `node tools/probes/static.mjs ./_site 4011` → serves `200`.
- `node tools/probes/overflow.mjs … 320,375,768,1024,1440 en,it light` → 10 runs,
  `docW == innerW` in every one.
- `node tools/probes/t12probe.mjs … widths` → 44 runs, 0 errors, 0 problem runs.
- `node tools/probes/contrast.mjs … en light` → 279 scanned, 0 failures.
- `node tools/probes/t6probe.mjs … > t6.json` + `t6-analyze.mjs t6.json` →
  `errors: 0 []`, `failures 0`.
- All 21 scripts pass `node --check`; none has a BOM.

*Deviation from the plan's file list (approved).* T13 said `AGENTS.md` only.
The plan itself asked to *decide with the user* whether to commit the probes;
the user chose to commit them, so `tools/probes/` plus the two config touches
are part of this task. Everything else in T13 stayed documentation-only.

*Known limits / notes.*
- **The probes are Windows/Chrome-oriented.** They assume Chrome at the default
  path (overridable with `CHROME_PATH`), use fixed CDP ports and write their
  scratch output into `%LOCALAPPDATA%\Temp\opencode`. They are documented as
  developer tools, not a CI suite.
- **21 of the 42 scripts used during the restyle were committed.** The rest are
  screenshot/one-off evidence helpers (`*shots.mjs`, `*base.mjs`, the
  reduced-motion and focus-specific probes, the superseded `t12firefox.mjs`/
  `t12firefox2.mjs`, and `t9-multi.mjs`, which needs a throwaway site copy).
  The plan still records their results; only the reusable suite is in the repo.
- **`togglecheck.mjs`, `navprobe.mjs` and `shot.mjs`** (cited by earlier logs)
  no longer exist — the temp cleanup removed them between sessions. They are
  **not** in `tools/probes/`; their results remain recorded in the T2/T3 logs
  but cannot be re-run. T14 may note this in the final summary.
- **`_site-3.10/` is ignored but still produced on disk** by the documented
  parity command; delete it after checking.

*Review response (2026-11-08): six P3s, all fixed.* An independent review
verified the build/exclusion claims (no `plans`/`tools`/`AGENTS.md` in the
output, sitemap clean, `apps/piano` untouched, `node --check` on all 21, no
BOMs, every AGENTS.md code claim matching the sources) and raised six
documentation/robustness issues:

1. **`static.mjs` allowed a path-traversal read.** A percent-encoded backslash
   (`/%5c..%5c..%5cwin.ini`) decoded to `\..\..\win.ini`, which `join()`
   resolves as separators on Windows, escaping the served root. Fixed with a
   `resolve()` + `startsWith(root + sep)` containment check (both the request
   path and the real path, so a symlinked root still works). Verified live:
   `%5c..%5c..%5cwindows%5cwin.ini` → **400**, `..%2f..%2fpackage.json` → **400**,
   `%2e%2e/%2e%2e/AGENTS.md` → **404**, while `/`, `/en/`, the CSS, `/apps/piano/`
   and `sitemap.xml` still return **200**.
2. **AGENTS.md said "Node 18+"**, but the Chrome probes use a global
   `WebSocket`, which only exists from Node 21/22; on 18 they die with
   `ReferenceError`. Corrected to **Node 22+**.
3. **The blanket "launches Chrome and prints JSON" sentence** was wrong for
   `static.mjs`, `t7classic.mjs` and the two Firefox scripts. The intro now
   describes each kind accurately.
4. **The `/tmp/t6.json` example** dead-ends on PowerShell. Both forms are now
   documented (`/tmp` for bash, `$env:TEMP` for PowerShell).
5. **Stale "(not part of the repo)" headers** in `overflow.mjs`,
   `contrast.mjs` and `static.mjs` reworded to the committed-suite wording.
6. **`t7classic.mjs` never asserted its own precondition.** It now calls
   `Emulation.setScrollbarsHidden({ hidden: false })` and prints a warning when
   `innerWidth - clientWidth === 0`, instead of silently producing a vacuous
   audit. Re-ran it: `scrollbar=15` and `docW 305` at 320px, unchanged.

Also taken from the review: `overflow.mjs` now checks `exceptionDetails`
before parsing (a page-side error used to surface as an opaque `JSON.parse`
failure), AGENTS.md notes the `%LOCALAPPDATA%` scratch-profile assumption, and
`.gitignore` gained its missing trailing newline.

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
  - The only data changes are additive `_data/navigation.yml` keys
    (`theme_toggle`, `scroll_top` from T2/T3 and `skip_to_content` from T5);
    no content data (`hero`, `about`, `projects`, …) changed.
  - `apps/piano/` is unchanged.
- **Verify:**
  ```powershell
  jekyll build
  jekyll _3.10.0_ build -d "$env:LOCALAPPDATA\Temp\opencode\site-gh"
  Test-Path _site/en/index.html, _site/it/index.html, _site/assets/css/style.css, _site/sitemap.xml, _site/feed.xml, _site/apps/piano/index.html
  git diff --stat
  git diff --quiet -- apps/piano; $LASTEXITCODE        # expect 0
  git diff -- _data                                     # expect only additive navigation.yml keys
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
  (`aria-label` + `aria-hidden` icons). The remaining `link-name` failure was
  `.project-link`, **fixed in T9** with `aria-label="GitHub: {{ item.title }}"`
  plus `aria-hidden="true"` on the glyph (not re-confirmed by Lighthouse, which
  is unavailable in these sessions, but it is the same pattern T2 used for the
  footer icons that went from failing to passing).
- Lighthouse `heading-order`: a heading level is skipped somewhere in the
  page (**fixed in T5**: the contact items were `<h4>` under an `<h2>` and are now
  `<h3>`, with the old 19px size pinned in CSS).
- **No `<main>` landmark** (found in the second review round): sections are
  direct children of `<body>`, so axe's `landmark-one-main` fails. Lighthouse
  reports it only intermittently (1 of 6 runs), so it slipped past T1/T2.
  **Fixed in T5**: the eight content sections are wrapped in
  `<main id="main" tabindex="-1">` with a localized skip link, and the
  alternating backgrounds moved from `section:nth-child(odd)` to explicit
  `.section--alt` classes so neither the wrap nor the runtime `#preloader` can
  flip them.
- `100vh` on `.hero` produces a large blank band under the fixed navbar on
  short/mobile viewports (**fixed in T4**: `min(100vh, 880px)` +
  `min(100svh, 880px)` with `padding: 96px 0 80px`).
- `.skills-grid` used `minmax(350px, 1fr)`; the plan predicted an overflow below
  350px, but the `≤768px` `1fr` override already prevented one (measured at
  273px at 320px in T7). **Resolved in T8** as a density change:
  `minmax(min(100%, 280px), 1fr)`, which yields 3 columns at 1024 instead of 2;
  mobile is unchanged because the override was kept.
- **11px horizontal overflow at 320px, only with a classic scrollbar** (found
  in T4, pre-existing and verified identical at HEAD): with a 15px scrollbar
  the layout viewport is 305px and `documentElement.scrollWidth` is 316, so a
  horizontal scrollbar appears. With overlay scrollbars (what `overflow.mjs`
  emulates) the viewport is 320 and everything fits, which is why no earlier
  run saw it. `overbisect.mjs` shows the 316 is unchanged with the navbar, the
  hero or all other sections hidden, and no element's box is wider than 305 —
  so it is not the hero. Needs its own investigation; `overflow.mjs` should
  grow a classic-scrollbar mode (the round-5 T3 lesson again).
  **Resolved in T7 (2026-10-29):** the cause was
  `.certifications-grid`'s `minmax(300px, 1fr)`. At 320px the `.container`
  content box is 273px (305 − 32), but the track floored at 300px, so the card
  ran 16→316 — exactly the 316, and 27px past the container's right edge.
  `overbisect.mjs` could not see it because it hid *sections*, and the card's
  own box is 300px (narrower than 305); it was the position that overflowed.
  Fixed with `minmax(min(100%, 300px), 1fr)`. `t7classic.mjs` (classic
  scrollbar, `clientWidth` 305) now reports `scrollWidth` 305 at 320px in both
  languages, with 360/375 columns unchanged (313/328).
- **Wordmark was ellipsized at 320px** (found in T4, pre-existing):
  `.nav-logo` was 132px wide while its text needs 135px, so it rendered
  "Simone Del Gros…" (`scrollWidth` 135 vs `clientWidth` 132). **Fixed in T12**:
  the ≤360px block now uses a 12px container gutter instead of 16px, which
  gives the wordmark 140px (measured 135/135, no truncation) without shrinking
  the type further.
- **Desktop nav dead zone between 769px and ~1100px** (found in T3,
  pre-existing): the hamburger only appeared at ≤768px, so from 769px the eight
  inline links squeezed the wordmark to **0px** and pushed `.nav-controls`
  **off-screen** (883–941px against a 754–885px viewport: 769–899 for EN and
  769–999 for IT). **Fixed in T12**: the drawer now covers everything below
  1025px (its CSS split out of the 768px layout block, `script.js` matchMedia
  updated to match), and a 1025–1199px band tightens the nav gap to 8px and the
  labels to 15px so Italian still fits. Measured after: no truncation and no
  off-screen controls at any width from 320 to 1920, in Chromium and Firefox.

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
