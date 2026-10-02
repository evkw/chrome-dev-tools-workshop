# Chrome DevTools workshop slides

The deck is a standalone Slidev app inside the Nx workspace. Its slides are live demo prompts, with the presenter notes carrying the short walkthrough reminders.

## Commands

```bash
npm run slides                 # development server (nx serve slides)
npx nx build slides            # static site in dist/apps/slides
npx nx export slides           # PDF in dist/apps/slides/chrome-devtools-workshop.pdf
```

In the running deck, press **P** to open Presenter Mode with notes and the next slide. The built-in route is also available at `/presenter`.

## Editing the deck

- `slides.md` contains the slide content and speaker notes.
- `layouts/` contains the reusable cover, section, statement, content, code and screenshot layouts.
- `styles/index.css` contains the Efimis colors, typography and layout styling.
- `public/` is for workshop screenshots and other local assets.

Add a section by adding a slide with `<!-- layout: section -->`, a heading and one short supporting line; detailed demo reminders belong in that slide's final HTML comment block. Slidev displays that final comment block as presenter notes.

For a screenshot slide, use `<!-- layout: screenshot -->`, a short heading, and this image area:

```html
<div class="screenshot-frame">
  <img src="/network-panel.png" alt="Chrome Network panel" />
</div>
```

Put the image in `public/`; the frame scales it to fit most of the slide while preserving its aspect ratio. No Chrome screenshots are fabricated in this starter deck.

## Production and PDF

`nx build slides` builds the static presentation for hosting. `nx export slides` uses Slidev's Playwright-based exporter to create a PDF. Both commands write under the workspace `dist/apps/slides` directory.
