// Spot the Difference — the renderer. One job: paint the current screen on
// the canvas — header HUD, both panels with their markers, footer strip, and
// the title / level-select / completion screens. It never changes game state.
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, HEADER_HEIGHT, FOOTER_TOP, LEFT_PANEL_X, RIGHT_PANEL_X,
  PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT, SCENE_WIDTH, SCENE_HEIGHT, PALETTE, DIFFICULTIES,
} from './config.js';
import { SCENES } from './scenes.js';
import { formatTime, timerIsLow, timerFractionLeft } from './timer.js';
import { levelStars, levelBestScore, levelBestTime, levelUnlocked, totalStars, totalBestScore } from './levels.js';
import { toPanelPoint } from './input.js';

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStars(ctx, x, y, stars, size = 16) {
  for (let i = 0; i < 3; i += 1) {
    const cx = x + i * (size + 8);
    ctx.beginPath();
    for (let p = 0; p < 10; p += 1) {
      const rad = p % 2 === 0 ? size : size * 0.45;
      const a = (p * Math.PI) / 5 - Math.PI / 2;
      const px = cx + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = i < stars ? PALETTE.gold : 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
  }
}

/** Paint one scene into a rectangle, scaling the 610x560 scene space. */
export function drawSceneInto(ctx, scene, altSet, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x, y);
  ctx.scale(w / SCENE_WIDTH, h / SCENE_HEIGHT);
  scene.draw(ctx, altSet);
  ctx.restore();
}

function drawFoundMarker(ctx, panelX, diff, index, pulse) {
  const p = toPanelPoint(diff);
  const cx = panelX + p.x;
  const cy = PANEL_TOP + p.y;
  const radius = diff.r + 6 + pulse * 4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.foundFill;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = PALETTE.foundRing;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PALETTE.foundRing;
  ctx.stroke();
  text(ctx, String(index + 1), cx, cy + 1, 15, '#0d7a6f', 'center');
}

function drawHintHighlight(ctx, panelX, diff, nowMs, untilMs) {
  const p = toPanelPoint(diff);
  const cx = panelX + p.x;
  const cy = PANEL_TOP + p.y;
  const phase = (nowMs % 900) / 900;
  const radius = 62 + Math.sin(phase * Math.PI * 2) * 10;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = PALETTE.hintRing;
  ctx.stroke();
  ctx.setLineDash([]);
  text(ctx, '?', cx, cy, 34, PALETTE.hintRing, 'center');
}

function drawHeader(ctx, game) {
  ctx.fillStyle = PALETTE.header;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HEADER_HEIGHT);
  ctx.fillStyle = PALETTE.accent;
  ctx.fillRect(0, HEADER_HEIGHT - 4, CANVAS_WIDTH, 4);
  const scene = game.scene;
  const diff = DIFFICULTIES[game.difficulty];
  text(ctx, `LEVEL ${scene.number}/6`, 20, 26, 22, PALETTE.headerText);
  text(ctx, scene.name, 20, 56, 20, '#ffffff');
  // Difficulty badge.
  const badgeText = `  ${diff.label}  `;
  ctx.font = 'bold 15px Trebuchet MS, Verdana, sans-serif';
  const badgeW = ctx.measureText(badgeText).width + 12;
  ctx.fillStyle = game.difficulty === 'hard' ? '#ff4d4d' : game.difficulty === 'easy' ? '#2ec4b6' : '#ffc53d';
  roundRect(ctx, 230, 12, badgeW, 26, 13);
  ctx.fill();
  text(ctx, diff.label, 230 + badgeW / 2, 26, 15, '#23202b', 'center');
  // The counter: FOUND n/N, big, dead centre.
  const found = game.found.size;
  const total = game.active.length;
  const remaining = total - found;
  text(ctx, `FOUND ${found}/${total}`, CANVAS_WIDTH / 2, 34, 40, '#ffffff', 'center');
  text(ctx, `${remaining} remaining`, CANVAS_WIDTH / 2, 68, 16, '#ffe9a8', 'center');
  // Timer, score, combo, hints on the right.
  const low = timerIsLow(game.timer);
  const timeColor = low ? '#ff6b6b' : '#ffffff';
  const pulse = low ? 1 + Math.sin(game.nowMs / 180) * 0.06 : 1;
  ctx.save();
  ctx.translate(1010, 34);
  ctx.scale(pulse, pulse);
  text(ctx, formatTime(game.timer.remaining), 0, 0, 38, timeColor, 'center');
  ctx.restore();
  text(ctx, `SCORE ${game.score}`, 1010, 68, 16, '#ffe9a8', 'center');
  text(ctx, game.combo > 1 ? `COMBO x${game.combo}` : 'COMBO x1', 1140, 26, 18, PALETTE.gold, 'center');
  text(ctx, `HINTS ${game.hintsLeft}/${diff.hints}`, 1140, 56, 16, '#ffffff', 'center');
}

function drawPanels(ctx, game) {
  const altSet = new Set(game.active.map((d) => d.id));
  const emptySet = new Set();
  drawSceneInto(ctx, game.scene, emptySet, LEFT_PANEL_X, PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT);
  drawSceneInto(ctx, game.scene, altSet, RIGHT_PANEL_X, PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT);
  for (const panelX of [LEFT_PANEL_X, RIGHT_PANEL_X]) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = PALETTE.panelFrame;
    ctx.strokeRect(panelX, PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT);
  }
  // Found markers on both panels, numbered in find order.
  const now = game.nowMs;
  game.foundOrder.forEach((diffId, index) => {
    const diff = game.active.find((d) => d.id === diffId);
    if (!diff) return;
    const age = now - (game.foundAt[diffId] || 0);
    const pulse = age < 500 ? 1 - age / 500 : 0;
    drawFoundMarker(ctx, LEFT_PANEL_X, diff, index, pulse);
    drawFoundMarker(ctx, RIGHT_PANEL_X, diff, index, pulse);
  });
  // Hint region highlight on both panels.
  if (game.hintDiff && now < game.hintUntilMs) {
    drawHintHighlight(ctx, LEFT_PANEL_X, game.hintDiff, now, game.hintUntilMs);
    drawHintHighlight(ctx, RIGHT_PANEL_X, game.hintDiff, now, game.hintUntilMs);
  }
  // Particles and floating scores.
  for (const particle of game.particles) {
    ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const float of game.floats) {
    const age = (now - float.bornMs) / 900;
    if (age >= 1) continue;
    ctx.globalAlpha = 1 - age;
    text(ctx, float.label, float.x, float.y - age * 46, 24, float.color, 'center');
  }
  ctx.globalAlpha = 1;
  // Miss mark: a fading red X where the player clicked wrong.
  if (game.missMark && now - game.missMark.bornMs < 500) {
    const age = (now - game.missMark.bornMs) / 500;
    ctx.globalAlpha = 1 - age;
    ctx.strokeStyle = '#ff4d4d';
    ctx.lineWidth = 4;
    const { x, y } = game.missMark;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12);
    ctx.lineTo(x - 12, y + 12);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Keyboard crosshair.
  if (game.cursor.visible) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(game.cursor.x, game.cursor.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(game.cursor.x - 20, game.cursor.y);
    ctx.lineTo(game.cursor.x - 8, game.cursor.y);
    ctx.moveTo(game.cursor.x + 8, game.cursor.y);
    ctx.lineTo(game.cursor.x + 20, game.cursor.y);
    ctx.moveTo(game.cursor.x, game.cursor.y - 20);
    ctx.lineTo(game.cursor.x, game.cursor.y - 8);
    ctx.moveTo(game.cursor.x, game.cursor.y + 8);
    ctx.lineTo(game.cursor.x, game.cursor.y + 20);
    ctx.stroke();
  }
  // Panel labels, above the panels, never covering the pictures.
  text(ctx, 'ORIGINAL', LEFT_PANEL_X + PANEL_WIDTH / 2, 100, 15, '#8a8496', 'center');
  text(ctx, 'FIND THE DIFFERENCES', RIGHT_PANEL_X + PANEL_WIDTH / 2, 100, 15, '#8a8496', 'center');
}

export const HINT_BUTTON = { x: 1070, y: 700, w: 190, h: 46 };
export const PAUSE_BUTTON = { x: 880, y: 700, w: 170, h: 46 };
export const SOUND_BUTTON = { x: 690, y: 700, w: 170, h: 46 };

function drawFooter(ctx, game) {
  ctx.fillStyle = '#f3ead6';
  ctx.fillRect(0, FOOTER_TOP, CANVAS_WIDTH, CANVAS_HEIGHT - FOOTER_TOP);
  // Next-level teaser strip.
  const next = SCENES[game.scene.number % SCENES.length];
  const nextLabel = game.scene.number < SCENES.length
    ? `NEXT: LEVEL ${next.number} — ${next.name}`
    : 'NEXT: FREE PLAY — REPLAY ANY LEVEL';
  text(ctx, nextLabel, 20, 700, 18, '#5a4a3a');
  // Progress dots for all six levels.
  for (let i = 0; i < SCENES.length; i += 1) {
    const cx = 96 + i * 48;
    const cy = 748;
    const done = (game.progress.stars[SCENES[i].id] || 0) > 0;
    const current = SCENES[i].number === game.scene.number;
    ctx.beginPath();
    ctx.arc(cx, cy, current ? 15 : 12, 0, Math.PI * 2);
    ctx.fillStyle = done ? PALETTE.teal : current ? PALETTE.accent : '#d9cdb2';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    text(ctx, String(i + 1), cx, cy + 1, 14, '#ffffff', 'center');
  }
  text(ctx, 'LEVELS', 20, 748, 14, '#8a7a62');
  // Footer buttons: hint, pause, sound.
  const hintReady = game.hintsLeft > 0 && game.nowMs >= game.hintCooldownUntilMs;
  ctx.fillStyle = hintReady ? PALETTE.gold : '#c9bfa5';
  roundRect(ctx, HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.w, HINT_BUTTON.h, 10);
  ctx.fill();
  text(ctx, `HINT (${game.hintsLeft})`, HINT_BUTTON.x + HINT_BUTTON.w / 2, HINT_BUTTON.y + 24, 17, '#23202b', 'center');
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, PAUSE_BUTTON.x, PAUSE_BUTTON.y, PAUSE_BUTTON.w, PAUSE_BUTTON.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#8a8496';
  ctx.lineWidth = 2;
  roundRect(ctx, PAUSE_BUTTON.x, PAUSE_BUTTON.y, PAUSE_BUTTON.w, PAUSE_BUTTON.h, 10);
  ctx.stroke();
  text(ctx, 'PAUSE (P)', PAUSE_BUTTON.x + PAUSE_BUTTON.w / 2, PAUSE_BUTTON.y + 24, 17, '#23202b', 'center');
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, SOUND_BUTTON.x, SOUND_BUTTON.y, SOUND_BUTTON.w, SOUND_BUTTON.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#8a8496';
  roundRect(ctx, SOUND_BUTTON.x, SOUND_BUTTON.y, SOUND_BUTTON.w, SOUND_BUTTON.h, 10);
  ctx.stroke();
  text(ctx, game.muted ? 'SOUND OFF (M)' : 'SOUND ON (M)', SOUND_BUTTON.x + SOUND_BUTTON.w / 2, SOUND_BUTTON.y + 24, 15, '#23202b', 'center');
  text(ctx, 'Click a difference on either picture  ·  Arrow keys move the crosshair, Space clicks  ·  H hint', 730, 762, 13, '#8a7a62', 'center');
}

function drawOverlayPanel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(29, 24, 48, 0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = PALETTE.paper;
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();
}

function drawButton(ctx, rect, labelText, fill) {
  ctx.fillStyle = fill;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  text(ctx, labelText, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1, 19, '#23202b', 'center');
}

function drawTitle(ctx, game) {
  ctx.fillStyle = '#1d1830';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // A strip of the night market behind the title, dimmed.
  ctx.save();
  ctx.globalAlpha = 0.35;
  drawSceneInto(ctx, SCENES[0], new Set(), 0, 0, CANVAS_WIDTH, 430);
  ctx.restore();
  ctx.fillStyle = 'rgba(29, 24, 48, 0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 430);
  text(ctx, 'SPOT THE DIFFERENCE', CANVAS_WIDTH / 2, 120, 64, '#ffffff', 'center');
  text(ctx, 'Six hand-drawn scenes  ·  48 differences hiding in plain sight', CANVAS_WIDTH / 2, 180, 22, PALETTE.headerText, 'center');
  text(ctx, 'Two pictures, side by side. Click every difference before the clock runs out.', CANVAS_WIDTH / 2, 214, 18, '#ffffff', 'center');
  // Difficulty cards.
  const cards = titleDifficultyCards();
  for (const card of cards) {
    const diff = DIFFICULTIES[card.key];
    ctx.fillStyle = game.difficulty === card.key ? '#ffffff' : 'rgba(255, 255, 255, 0.88)';
    roundRect(ctx, card.x, card.y, card.w, card.h, 14);
    ctx.fill();
    if (game.difficulty === card.key) {
      ctx.strokeStyle = PALETTE.accent;
      ctx.lineWidth = 4;
      roundRect(ctx, card.x, card.y, card.w, card.h, 14);
      ctx.stroke();
    }
    text(ctx, diff.label, card.x + card.w / 2, card.y + 40, 26, '#23202b', 'center');
    text(ctx, `${diff.diffs} differences  ·  ${formatTime(diff.seconds)}`, card.x + card.w / 2, card.y + 78, 16, '#5a4a3a', 'center');
    text(ctx, diff.tag, card.x + card.w / 2, card.y + 106, 15, '#8a7a62', 'center');
    text(ctx, `${diff.hints} hints`, card.x + card.w / 2, card.y + 132, 15, '#8a7a62', 'center');
  }
  text(ctx, 'HOW TO PLAY', CANVAS_WIDTH / 2, 500, 20, PALETTE.gold, 'center');
  text(ctx, 'Click a difference on either picture — a ring stamps it on both.  Wrong clicks cost points.', CANVAS_WIDTH / 2, 532, 17, '#ffffff', 'center');
  text(ctx, 'H shows a hint region  ·  P pauses  ·  M mutes  ·  Arrow keys + Space play by keyboard.', CANVAS_WIDTH / 2, 560, 17, '#ffffff', 'center');
  const stars = totalStars(game.progress);
  const best = totalBestScore(game.progress);
  text(ctx, stars > 0 || best > 0 ? `YOUR BEST SO FAR: ${stars}/18 STARS  ·  ${best} POINTS` : 'NO GAMES PLAYED YET — PICK A DIFFICULTY ABOVE', CANVAS_WIDTH / 2, 610, 17, PALETTE.headerText, 'center');
  drawButton(ctx, titleStartButton(), 'CHOOSE A LEVEL  →', PALETTE.gold);
  text(ctx, 'Every scene is drawn in code — no photos, no stock art.', CANVAS_WIDTH / 2, 740, 14, '#8a8496', 'center');
}

export function titleDifficultyCards() {
  const w = 300;
  const gap = 40;
  const total = w * 3 + gap * 2;
  const x0 = (CANVAS_WIDTH - total) / 2;
  return ['easy', 'normal', 'hard'].map((key, i) => ({
    key, x: x0 + i * (w + gap), y: 270, w, h: 160,
  }));
}

export function titleStartButton() {
  return { x: CANVAS_WIDTH / 2 - 160, y: 650, w: 320, h: 56 };
}

function drawSelect(ctx, game) {
  ctx.fillStyle = '#1d1830';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, 'CHOOSE YOUR SCENE', CANVAS_WIDTH / 2, 60, 40, '#ffffff', 'center');
  const diff = DIFFICULTIES[game.difficulty];
  text(ctx, `Difficulty: ${diff.label} — ${diff.diffs} differences, ${formatTime(diff.seconds)} on the clock, ${diff.hints} hints`, CANVAS_WIDTH / 2, 104, 18, PALETTE.headerText, 'center');
  text(ctx, `6 SCENES  ·  48 DIFFERENCES  ·  ${totalStars(game.progress)}/18 STARS EARNED`, CANVAS_WIDTH / 2, 134, 16, '#8a8496', 'center');
  // Difficulty switcher.
  for (const card of selectDifficultyButtons()) {
    const d = DIFFICULTIES[card.key];
    ctx.fillStyle = game.difficulty === card.key ? PALETTE.gold : 'rgba(255, 255, 255, 0.2)';
    roundRect(ctx, card.x, card.y, card.w, card.h, 9);
    ctx.fill();
    text(ctx, d.label, card.x + card.w / 2, card.y + card.h / 2 + 1, 16, game.difficulty === card.key ? '#23202b' : '#ffffff', 'center');
  }
  // Scene cards, 3 across, 2 down.
  for (const card of selectSceneCards(game)) {
    const scene = card.scene;
    const locked = !levelUnlocked(game.progress, scene.number);
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, card.x, card.y, card.w, card.h, 14);
    ctx.fill();
    drawSceneInto(ctx, scene, new Set(), card.x + 10, card.y + 10, card.w - 20, 130);
    text(ctx, `LEVEL ${scene.number} — ${scene.name}`, card.x + 16, card.y + 168, 19, '#23202b');
    text(ctx, scene.tagline, card.x + 16, card.y + 192, 14, '#8a7a62');
    drawStars(ctx, card.x + 16, card.y + 216, levelStars(game.progress, scene.id), 13);
    const best = levelBestScore(game.progress, scene.id);
    const bestTime = levelBestTime(game.progress, scene.id);
    text(ctx, best > 0 ? `BEST ${best} PTS${bestTime !== null ? `  ·  ${formatTime(bestTime)}` : ''}` : 'NOT PLAYED YET', card.x + 16, card.y + 240, 13, '#5a4a3a');
    if (locked) {
      ctx.fillStyle = 'rgba(29, 24, 48, 0.72)';
      roundRect(ctx, card.x, card.y, card.w, card.h, 14);
      ctx.fill();
      text(ctx, 'LOCKED — FINISH LEVEL ' + (scene.number - 1) + ' TO UNLOCK', card.x + card.w / 2, card.y + card.h / 2, 17, '#ffffff', 'center');
    }
  }
  drawButton(ctx, selectBackButton(), '←  BACK TO TITLE', '#ffffff');
}

export function selectDifficultyButtons() {
  const w = 130;
  const gap = 16;
  const total = w * 3 + gap * 2;
  const x0 = (CANVAS_WIDTH - total) / 2;
  return ['easy', 'normal', 'hard'].map((key, i) => ({
    key, x: x0 + i * (w + gap), y: 156, w, h: 38,
  }));
}

export function selectSceneCards(game) {
  const w = 390;
  const h = 270;
  const gapX = 25;
  const gapY = 16;
  const x0 = (CANVAS_WIDTH - (w * 3 + gapX * 2)) / 2;
  const y0 = 206;
  return SCENES.map((scene, i) => ({
    scene,
    x: x0 + (i % 3) * (w + gapX),
    y: y0 + Math.floor(i / 3) * (h + gapY),
    w, h,
  }));
}

export function selectBackButton() {
  return { x: 20, y: 20, w: 200, h: 44 };
}

function drawLevelComplete(ctx, game) {
  drawPanels(ctx, game);
  drawOverlayPanel(ctx, 390, 170, 500, 460);
  const stars = game.lastStars || 1;
  text(ctx, 'LEVEL COMPLETE!', 640, 240, 40, '#23202b', 'center');
  drawStars(ctx, 640 - 40, 300, stars, 26);
  text(ctx, `${game.scene.name}  ·  ${DIFFICULTIES[game.difficulty].label}`, 640, 350, 18, '#5a4a3a', 'center');
  text(ctx, `TIME BONUS  +${game.lastTimeBonus}`, 640, 400, 20, '#23202b', 'center');
  text(ctx, `LEVEL SCORE  ${game.lastLevelScore}`, 640, 434, 20, '#23202b', 'center');
  text(ctx, `TOTAL SCORE  ${game.score}`, 640, 468, 22, PALETTE.accent, 'center');
  const next = SCENES[game.scene.number % SCENES.length];
  text(ctx, game.scene.number < SCENES.length ? `NEXT: LEVEL ${next.number} — ${next.name}` : 'THAT WAS THE LAST SCENE — PLAY AGAIN!', 640, 510, 17, '#5a4a3a', 'center');
  drawButton(ctx, completeNextButton(), game.scene.number < SCENES.length ? 'NEXT LEVEL  →' : 'PLAY AGAIN', PALETTE.gold);
  drawButton(ctx, completeSelectButton(), 'LEVEL SELECT', '#ffffff');
}

export function completeNextButton() {
  return { x: 420, y: 540, w: 190, h: 52 };
}

export function completeSelectButton() {
  return { x: 630, y: 540, w: 190, h: 52 };
}

function drawTimeUp(ctx, game) {
  drawPanels(ctx, game);
  drawOverlayPanel(ctx, 390, 200, 500, 380);
  text(ctx, "TIME'S UP!", 640, 280, 44, '#23202b', 'center');
  text(ctx, `You found ${game.found.size} of ${game.active.length} differences in ${game.scene.name}.`, 640, 340, 19, '#5a4a3a', 'center');
  text(ctx, 'The unfound ones are still hiding — try again!', 640, 372, 17, '#8a7a62', 'center');
  drawButton(ctx, timeUpRetryButton(), 'TRY AGAIN', PALETTE.gold);
  drawButton(ctx, timeUpSelectButton(), 'LEVEL SELECT', '#ffffff');
}

export function timeUpRetryButton() {
  return { x: 440, y: 430, w: 200, h: 52 };
}

export function timeUpSelectButton() {
  return { x: 660, y: 430, w: 200, h: 52 };
}

function drawPaused(ctx, game) {
  drawPanels(ctx, game);
  drawOverlayPanel(ctx, 440, 300, 400, 180);
  text(ctx, 'PAUSED', 640, 360, 40, '#23202b', 'center');
  text(ctx, 'Press P or click Resume to keep hunting.', 640, 412, 17, '#5a4a3a', 'center');
  drawButton(ctx, pausedResumeButton(), 'RESUME', PALETTE.gold);
}

export function pausedResumeButton() {
  return { x: 540, y: 440, w: 200, h: 52 };
}

function drawGameComplete(ctx, game) {
  ctx.fillStyle = '#1d1830';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, 'YOU FOUND THEM ALL!', CANVAS_WIDTH / 2, 180, 52, '#ffffff', 'center');
  text(ctx, 'Every difference in every scene — 48 out of 48.', CANVAS_WIDTH / 2, 240, 20, PALETTE.headerText, 'center');
  drawStars(ctx, CANVAS_WIDTH / 2 - 40, 310, 3, 26);
  text(ctx, `${totalStars(game.progress)}/18 STARS  ·  BEST TOTAL ${totalBestScore(game.progress)} POINTS`, CANVAS_WIDTH / 2, 370, 20, '#ffffff', 'center');
  text(ctx, 'Thanks for playing Spot the Difference. Pick a scene to hunt again.', CANVAS_WIDTH / 2, 410, 17, '#8a8496', 'center');
  drawButton(ctx, gameCompleteSelectButton(), 'PLAY AGAIN — LEVEL SELECT', PALETTE.gold);
}

export function gameCompleteSelectButton() {
  return { x: CANVAS_WIDTH / 2 - 190, y: 470, w: 380, h: 56 };
}

/** The master draw: one screen, painted from the game state. */
export function renderGame(ctx, game) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (game.screen === 'title') {
    drawTitle(ctx, game);
    return;
  }
  if (game.screen === 'select') {
    drawSelect(ctx, game);
    return;
  }
  if (game.screen === 'gameComplete') {
    drawGameComplete(ctx, game);
    return;
  }
  // Play, level-complete, time-up and paused all show the game underneath.
  drawHeader(ctx, game);
  drawPanels(ctx, game);
  drawFooter(ctx, game);
  if (game.screen === 'levelComplete') drawLevelComplete(ctx, game);
  else if (game.screen === 'timeUp') drawTimeUp(ctx, game);
  else if (game.screen === 'paused') drawPaused(ctx, game);
}

/** Clickable regions for the current screen, as {id, x, y, w, h}. */
export function uiHitRegions(game) {
  if (game.screen === 'title') {
    const regions = titleDifficultyCards().map((c) => ({ id: `difficulty:${c.key}`, ...c }));
    regions.push({ id: 'title:start', ...titleStartButton() });
    return regions;
  }
  if (game.screen === 'select') {
    const regions = selectDifficultyButtons().map((c) => ({ id: `difficulty:${c.key}`, ...c }));
    for (const card of selectSceneCards(game)) regions.push({ id: `level:${card.scene.id}`, ...card });
    regions.push({ id: 'select:back', ...selectBackButton() });
    return regions;
  }
  if (game.screen === 'levelComplete') {
    return [
      { id: 'complete:next', ...completeNextButton() },
      { id: 'complete:select', ...completeSelectButton() },
    ];
  }
  if (game.screen === 'timeUp') {
    return [
      { id: 'timeup:retry', ...timeUpRetryButton() },
      { id: 'timeup:select', ...timeUpSelectButton() },
    ];
  }
  if (game.screen === 'paused') {
    return [{ id: 'paused:resume', ...pausedResumeButton() }];
  }
  if (game.screen === 'gameComplete') {
    return [{ id: 'gamecomplete:select', ...gameCompleteSelectButton() }];
  }
  return [
    { id: 'hint', ...HINT_BUTTON },
    { id: 'pause', ...PAUSE_BUTTON },
    { id: 'sound', ...SOUND_BUTTON },
  ];
}
