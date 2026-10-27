# WordSprout 🌱

A cheerful crossword playground for children preparing for the English Olympiad. Built with React, TypeScript, and Vite. No backend, accounts, or API keys are required.

## Open the website

**[Play WordSprout](https://shahriyar-kabir.github.io/practice-for-english-olympiad/)**

The app is hosted on GitHub Pages and stays available independently of the Codex coding workspace. Each child's progress is saved locally in their browser.

Changes pushed to `main` are tested, built, and published automatically by `.github/workflows/deploy-pages.yml`. In the repository's **Settings → Pages**, the deployment source is **GitHub Actions**. The repository's **Actions** tab shows deployment status and allows rerunning the workflow. No hosting account or custom domain is required.

## Run locally

Use Node.js 22 or newer (verified with Node.js 24).

```sh
npm ci
npm run dev
```

Vite listens on port 5173 by default. For a production build:

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to any static web host. Assets, fonts, and artwork are bundled locally; the app does not use external APIs. Relative asset paths support GitHub Pages project URLs as well as a host's root URL.

## Play

1. Choose one of the 10 adventures.
2. Select an Across or Down clue to highlight its squares.
3. Drag a word tile onto the highlighted squares, or tap/click the tile. Buttons also work with the keyboard.
4. Correct words turn green. Incorrect answers stay in the word bank with gentle feedback.
5. Ask for a hint to uncover a letter. Finish an adventure to earn a celebration.

Progress and hints are saved in this browser’s local storage. “My progress” shows discovered words and milestones. “Start over” asks before clearing only the current puzzle. Clearing browser storage removes saved progress. If storage is unavailable, the app still works for the current visit. Sound is optional and starts muted.

## Content

All 10 original grids, clue numbering, clues, and 110 answers were transcribed from the user-supplied **English Olympiad — Beginner / Crossword Practice: 10 Crosswords With Word Banks** PDF. The puzzle collection lives in `src/data/puzzles.ts`.

- Animal Friends
- In the Classroom
- Food and Drinks
- Our Natural World
- Opposites
- Action Words
- Around the House
- Travel and Transport
- Time and Calendar
- English Word Skills

## Validate

```sh
npm test
npm run build
```

Tests verify every original grid’s numbering, bounds, crossings, connectivity, and one-to-one word bank, plus hint rendering and robust saved-progress handling. `src/game.ts` contains the shared grid and storage helpers. The interface supports narrow screens and reduced-motion preferences.

For an optional real-browser smoke check, start the development server and run:

```sh
python3 scripts/browser_smoke.py
```

This requires Python Playwright and Chromium (both available in the prepared cloud environment). Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if Chromium is not at `/usr/bin/chromium`. The browser checks cover drag-and-drop, touch, keyboard controls, persistence, resets, all 110 answers, and phone layouts.
