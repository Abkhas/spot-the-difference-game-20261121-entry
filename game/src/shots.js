// Spot the Difference — staged scenes for screenshots. Each shot sets the real
// game state to a fixed, deterministic frame (a mid-game hunt, the level
// select, a hard-mode finish, a level complete), so a screenshot is a real
// render of the game's own code at a moment worth showing. Nothing here edits
// a picture: the game draws the frame itself.
import { SCENES, sceneById } from './scenes.js';
import { activeDifferences } from './differences.js';
import { createTimer } from './timer.js';

const FROZEN_NOW = 1000000;

/** Freeze the clock for a shot: the timer and pulses hold still. */
export function freezeForShot(game) {
  game.shotMode = true;
  game.nowMs = FROZEN_NOW;
}

function stageLevel(game, sceneId, difficulty, foundCount, secondsLeft, score, combo, hintsLeft) {
  const scene = sceneById(sceneId);
  game.scene = scene;
  game.difficulty = difficulty;
  game.active = activeDifferences(scene, difficulty);
  game.found = new Set();
  game.foundOrder = [];
  game.foundAt = {};
  for (let i = 0; i < foundCount && i < game.active.length; i += 1) {
    const diff = game.active[i];
    game.found.add(diff.id);
    game.foundOrder.push(diff.id);
    game.foundAt[diff.id] = FROZEN_NOW - 2000;
  }
  game.timer = createTimer(secondsLeft + 48);
  game.timer.remaining = secondsLeft;
  game.timer.running = false;
  game.score = score;
  game.levelScore = score;
  game.combo = combo;
  game.hintsLeft = hintsLeft;
  game.hintDiff = null;
  game.hintUntilMs = 0;
  game.hintCooldownUntilMs = 0;
  game.particles = [];
  game.floats = [];
  game.missMark = null;
  game.screen = 'play';
}

/**
 * Set `game` to the named shot (cover, select, hard or win; anything else is
 * the cover) and freeze its clock. Returns the screen the shot shows.
 */
export function stageShot(name, game) {
  if (name === 'select') {
    game.progress = {
      stars: { level1: 3, level2: 2 },
      bestScore: { level1: 1450, level2: 1100 },
      bestTime: { level1: 48, level2: 65 },
      unlocked: 3,
    };
    game.difficulty = 'normal';
    game.screen = 'select';
  } else if (name === 'hard') {
    // Library on Hard, one difference left, 18 seconds on a red clock.
    stageLevel(game, 'level2', 'hard', 7, 18, 2850, 5, 1);
    const last = game.active[game.active.length - 1];
    game.hintDiff = last;
    game.hintUntilMs = FROZEN_NOW + 4000;
  } else if (name === 'win') {
    stageLevel(game, 'level1', 'normal', 7, 46, 1730, 4, 2);
    game.lastStars = 3;
    game.lastTimeBonus = 460;
    game.lastLevelScore = 1730;
    game.screen = 'levelComplete';
  } else {
    // Cover: Night Market mid-hunt, 4 of 7 found, 3 still hiding.
    stageLevel(game, 'level1', 'normal', 4, 72, 1250, 3, 3);
  }
  freezeForShot(game);
  return game.screen;
}

export const SHOT_NAMES = ['cover', 'select', 'hard', 'win'];
