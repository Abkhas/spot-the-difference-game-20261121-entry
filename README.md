# Spot the Difference — Six Scenes, 48 Differences

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Abkhas/spot-the-difference-game-20261121-entry/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Abkhas/spot-the-difference-game-20261121-entry/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451): two near-identical pictures side by side, click every difference before the clock runs out.

## The game

- **6 hand-drawn scenes** — Night Market, Old Library, Harbour at Dusk, Bakery Kitchen, Train Station, Greenhouse Garden — each drawn in code (canvas 2D, no image files, no network).
- **48 differences** — 8 per scene: objects added or removed, colours swapped, signs reworded, lights switched, counts changed. Fair but not obvious.
- **3 difficulties** — Easy (5 differences, 150 s), Normal (7, 120 s), Hard (8, 90 s).
- **The hunt, on screen** — a big `FOUND n/N` counter with how many remain, a countdown timer that pulses red under 15 s, score and combo, hints (limited, with cooldown, highlighting a region — never the exact spot).
- **Satisfying finds** — a numbered ring stamps onto both panels, a chime, a particle burst, `+points` and `+5s` floats. Wrong clicks cost points and shake the frame.
- **Progression** — a level-select grid with stars (1–3 per level), best scores and best times, unlock order, and a next-level teaser strip at the bottom of every frame.
- **Keyboard + mouse** — click either picture; arrow keys move a crosshair, Space clicks, H hints, P pauses, M mutes.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: `game/index.html` and its ES modules under `game/src/` are the whole game.

## Layout

- `game/src/config.js` — canvas geometry, difficulty tables, scoring rules
- `game/src/scenes.js` — the six scenes and their 48 difference tables
- `game/src/differences.js` — which differences are in play, hit testing
- `game/src/render.js` — header HUD, panels, markers, screens
- `game/src/input.js` — pointer and keyboard input, panel mapping
- `game/src/timer.js` — countdown, bonuses, pressure states
- `game/src/audio.js` — WebAudio chimes (no audio files)
- `game/src/levels.js` — stars, best scores, unlocks
- `game/src/shots.js` — staged `?shot=` scenes for screenshots
- `game/src/main.js` — boot, game loop, screen flow

## Entry

`main.ts` (Node 22) copies `game/` and `screenshots/` to `/output` and writes `dossier.json` via `vendor/makefun-game.ts` (the kit's copy, unchanged).

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of the running game: the cover is the Night Market mid-hunt (4 of 7 found, 3 still hiding), then the level-select grid, a Hard-mode Library finish, and a level-complete screen.
