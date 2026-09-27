# AGENTS.md — Simone Del Grosso Portfolio

## Project Overview
Jekyll-based GitHub Pages portfolio site at https://simonedelgrosso.github.io
- Multi-language: English (`en/`) and Italian (`it/`) via YAML data files
- Auto-redirects based on browser language (`index.html` at root)
- Static deployment via GitHub Pages (push to `main` triggers build)

## Key Commands

```bash
# Local development (requires Ruby + Jekyll)
bundle install          # first time only
bundle exec jekyll serve --livereload

# Build for production
bundle exec jekyll build

# Validate HTML output (optional)
bundle exec htmlproofer ./_site --disable-external
```

## Repository Structure

```
├── _config.yml           # Jekyll config (plugins, langs, timezone)
├── _data/                # All content lives here (YAML)
│   ├── personal_info.yml # name, role
│   ├── hero.yml          # headline, tagline, CTAs
│   ├── about.yml         # bio, highlights
│   ├── experience.yml    # work history
│   ├── education.yml     # degrees
│   ├── certifications.yml
│   ├── skills.yml        # categorized skill tags
│   ├── projects.yml      # portfolio projects
│   ├── contact.yml       # links, email
│   ├── footer.yml        # social links, copyright
│   └── navigation.yml    # nav items per language
├── _includes/            # Section partials (one per page section)
├── _layouts/default.html # Single layout, includes all sections
├── en/index.md           # English entry (front matter only)
├── it/index.md           # Italian entry (front matter only)
├── index.html            # Root redirect + hreflang + language detection
├── assets/css/style.css  # Styles
├── assets/js/script.js   # Theme toggle, smooth scroll, etc.
└── apps/piano/           # Standalone piano app (plain HTML/JS)
```

## Content Editing Workflow

1. **Edit YAML in `_data/`** — all text content is data-driven
2. **Add translations** — duplicate keys in `*_it.yml` or extend existing YAML with `it:` blocks (see `hero.yml`)
3. **Restart Jekyll** — changes to `_data/` require server restart (`bundle exec jekyll serve`)
4. **CSS/JS changes** — hot reload works via `--livereload`

## Multi-Language Notes

- Language determined by `page.lang` front matter in `en/index.md` / `it/index.md`
- `_config.yml` sets defaults per path prefix (`en/` → `lang: en`, `it/` → `lang: it`)
- Navigation, hero, footer, etc. read `site.data.*` — structure must match across languages
- Root `index.html` handles auto-redirect + `hreflang` SEO tags

## Deployment

- Push to `main` → GitHub Pages builds with Jekyll automatically
- No custom GitHub Actions workflow; uses GitHub Pages native Jekyll support
- `_site/` is in `.gitignore` (generated locally only for testing)

## Common Gotchas

- **YAML changes need Jekyll restart** — `--livereload` only watches `_includes`, `_layouts`, `assets`, markdown files
- **No front matter in section includes** — they're partials, not pages
- **Plugin list in `_config.yml` must match GitHub Pages supported plugins** — only `jekyll-feed`, `jekyll-sitemap`, `jekyll-seo-tag` are safe
- **Absolute URLs in `_config.yml`** — `url: "https://simonedelgrosso.github.io"` required for SEO/sitemap

## Testing Checklist (Pre-Push)

```bash
bundle exec jekyll build
# Verify _site/ structure:
#   - en/ and it/ directories exist with index.html
#   - assets/ copied correctly
#   - sitemap.xml and feed.xml generated
#   - apps/piano/ preserved
```

## Adding New Sections

1. Create `_includes/new_section.html`
2. Add data file `_data/new_section.yml` (mirror EN/IT structure)
3. Include in `_layouts/default.html` at desired position
4. Add navigation entry in `_data/navigation.yml` if needed