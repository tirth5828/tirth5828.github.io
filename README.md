# tirth5828.github.io

Personal site of Tirth Joshi: research on the left, production on the right.

Plain HTML, CSS and JavaScript on GitHub Pages. No framework, no build step.

| Path | What it is |
|---|---|
| `index.html` | Home page: the split-face hero, experience, research, off the clock, contact |
| `style.css` | All styles, light and dark themes |
| `main.js` | Theme toggle, hover-card dismissal, BibTeX copy (shared by every page) |
| `hero.js` | Draws the split face on a canvas from `face.json` |
| `face.json` | A quantised darkness grid (figure mask plus 8 levels). Not a photograph |
| `play.js` | The off-the-clock tiles: Morse, archery, Spanish, books |
| `icnc-2026/`, `nsia-2026/` | Paper pages |
| `work/sales-ops-platform/`, `work/ai-harness/` | Project pages |

The ECCV, unlearning and gradient-conflict project pages live in their own repositories.

## Preview locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000/. The face needs `http://`, not `file://`, because `hero.js` fetches `face.json`.

## The production half of the face

`hero.js` can draw the right side of the face four ways. The live one is set by `data-prod` on the canvas in `index.html`:

- `code`: a code minimap; tokens near the cursor light up in syntax colours (live)
- `circuit`: the same contours as the research side, routed like PCB traces
- `layout`: UI panels, finer at the features
- `tiles`: the first version, rounded tiles sized by darkness

## Changing the book

Edit the `book-now` line in `index.html`. A one-line takeaway goes in the `book-take` paragraph right below it; the tile shows it on hover once it has text.
