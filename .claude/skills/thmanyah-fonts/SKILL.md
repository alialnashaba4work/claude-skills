---
name: thmanyah-fonts
description: Use when the user asks for their fonts, "my fonts", Thmanyah Sans / ثمانية, or wants a design, page, artifact or document with their usual typography (Thmanyah Sans for Arabic, Montserrat for English and numbers).
---

# Thmanyah Sans + Montserrat

The user's default typography:

- **Arabic**: Thmanyah Sans (weights: Light 300, Regular 400, Medium 500, Bold 700, Black 900)
- **English and numbers**: Montserrat (Google Fonts)

## Where the font files are

Thmanyah Sans files are licensed for personal use only. Its license forbids
re-hosting or redistributing them, so they are **not** in this public repo.
They live in the private repo `alialnashaba4work/private-fonts`, folder `thmanyah-sans/`:

- `ThmanyahSans-Light.otf`
- `ThmanyahSans-Regular.otf`
- `ThmanyahSans-Medium.otf`
- `ThmanyahSans-Bold.otf`
- `ThmanyahSans-Black.otf`

To get them in a cloud session: attach the repo with `add_repo`
(owner `alialnashaba4work`, repo `private-fonts`), then clone it.

## Rules

- Never commit the font files to this repo or any other public repo.
- Never put them anywhere public: a public website, a public link, or a shared artifact.
- Embedding them in a page that only the user can open is fine. If the page
  will be shared, say so first and fall back to IBM Plex Sans Arabic for Arabic.
- Montserrat is free (SIL OFL) and can load from Google Fonts anywhere.

## CSS

Put Montserrat first in the stack. It has no Arabic letters, so Latin text and
digits render in Montserrat and Arabic falls through to Thmanyah Sans.

```css
@font-face { font-family: "Thmanyah Sans"; font-weight: 300; src: url("ThmanyahSans-Light.otf") format("opentype"); }
@font-face { font-family: "Thmanyah Sans"; font-weight: 400; src: url("ThmanyahSans-Regular.otf") format("opentype"); }
@font-face { font-family: "Thmanyah Sans"; font-weight: 500; src: url("ThmanyahSans-Medium.otf") format("opentype"); }
@font-face { font-family: "Thmanyah Sans"; font-weight: 700; src: url("ThmanyahSans-Bold.otf") format("opentype"); }
@font-face { font-family: "Thmanyah Sans"; font-weight: 900; src: url("ThmanyahSans-Black.otf") format("opentype"); }

:root { --font: "Montserrat", "Thmanyah Sans", "IBM Plex Sans Arabic", system-ui, sans-serif; }
body { font-family: var(--font); }
```

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700;900&family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap">
```

In a claude.ai Artifact, only Google Fonts can load from outside. For a private
artifact, publish the .otf files alongside the page with the Artifact tool's
`files` option (e.g. `fonts/ThmanyahSans-Regular.otf`, content type `font/otf`)
and point `@font-face` at those relative paths. Keep the font files out of git;
`.gitignore` already blocks them.
Show Arabic dates with Latin digits (`ar-u-nu-latn`) so numbers use Montserrat.
