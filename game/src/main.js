// Spot the Difference — boot and game loop. Wires the canvas, the input, the
// timer and the screens together; the rules live in differences.js, the
// pictures in scenes.js, the painting in render.js.
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, DIFFICULTIES, SCORE_FIND, SCORE_COMBO_STEP,
  SCORE_MISS, SCORE_TIME_BONUS_PER_SECOND, HINT_COOLDOWN_MS, HINT_HIGHLIGHT_MS,
  MISS_SHAKE_MS, LEFT_PANEL_X, PANEL_TOP,
} from './config.js';
import { SCENES, sceneById } from './scenes.js';
import { activeDifferences, differenceAt, pointsForFind, allFound } from './differences.js';
import { createTimer, startTimer, stopTimer, tickTimer, addTimeBonus, timerFractionLeft, timerSecondsLeft } from './timer.js';
import { createProgress, starsForCompletion, recordLevelComplete } from './levels.js';
import { renderGame, uiHitRegions } from './render.js';
import { createCursor, panelAt, toScenePoint, eventPoint, moveCursor, KEY_ACTIONS } from './input.js';
import { playFound, playMiss, playHint, playLevelComplete, playClick, unlockAudio, toggleMuted, isMuted } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');

export const game = {
  screen: 'title',
  difficulty: 'normal',
  scene: SCENES[0],
  active: [],
  found: new Set(),
  foundOrder: [],
  foundAt: {},
  score: 0,
  levelScore: 0,
  combo: 0,
  hintsUsed: 0,
  hintsLeft: DIFFICULTIES.normal.hints,
  hintDiff: null,
  hintUntilMs: 0,
  hintCooldownUntilMs: 0,
  timer: createTimer(DIFFICULTIES.normal.seconds),
  particles: [],
  floats: [],
  missMark: null,
  shakeUntilMs: 0,
  cursor: createCursor(),
  progress: createProgress(),
  muted: false,
  nowMs: 0,
  lastStars: 0,
  lastTimeBonus: 0,
  lastLevelScore: 0,
  shotMode: false,
};

function announce(message) {
  if (statusLine) statusLine.textContent = message;
}

function spawnFindBurst(canvasX, canvasY) {
  const colors = ['#2ec4b6', '#ffc53d', '#ff5d8f', '#ffffff'];
  for (let i = 0; i < 14; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 90;
    game.particles.push({
      x: canvasX,
      y: canvasY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 4,
      color: colors[i % colors.length],
      age: 0,
      life: 500 + Math.random() * 300,
    });
  }
}

function startLevel(sceneId) {
  const scene = sceneById(sceneId);
  const diff = DIFFICULTIES[game.difficulty];
  game.scene = scene;
  game.active = activeDifferences(scene, game.difficulty);
  game.found = new Set();
  game.foundOrder = [];
  game.foundAt = {};
  game.levelScore = 0;
  game.combo = 0;
  game.hintsUsed = 0;
  game.hintsLeft = diff.hints;
  game.hintDiff = null;
  game.hintUntilMs = 0;
  game.hintCooldownUntilMs = 0;
  game.timer = createTimer(diff.seconds);
  game.particles = [];
  game.floats = [];
  game.missMark = null;
  game.screen = 'play';
  startTimer(game.timer);
  announce(`Level ${scene.number}: ${scene.name}. Find ${game.active.length} differences.`);
}

function finishLevel() {
  stopTimer(game.timer);
  const secondsLeft = timerSecondsLeft(game.timer);
  const timeBonus = secondsLeft * SCORE_TIME_BONUS_PER_SECOND;
  game.lastTimeBonus = timeBonus;
  game.lastLevelScore = game.levelScore + timeBonus;
  game.score += timeBonus;
  game.lastStars = starsForCompletion(timerFractionLeft(game.timer), game.hintsUsed);
  recordLevelComplete(game.progress, game.scene.id, game.lastStars, game.lastLevelScore, game.timer.total - secondsLeft);
  playLevelComplete();
  game.screen = 'levelComplete';
  announce(`Level complete! ${game.lastStars} stars, ${game.lastLevelScore} points.`);
}

function trySpot(panel, scenePoint, canvasPoint) {
  if (game.screen !== 'play' || game.timer.expired) return;
  const diff = differenceAt(game.scene, game.active, scenePoint.x, scenePoint.y);
  if (diff === null) {
    game.combo = 0;
    game.score = Math.max(0, game.score - SCORE_MISS);
    game.missMark = { x: canvasPoint.x, y: canvasPoint.y, bornMs: game.nowMs };
    game.shakeUntilMs = game.nowMs + MISS_SHAKE_MS;
    playMiss();
    announce('Not a difference. Try again.');
    return;
  }
  if (game.found.has(diff.id)) return;
  game.found.add(diff.id);
  game.foundOrder.push(diff.id);
  game.foundAt[diff.id] = game.nowMs;
  game.combo += 1;
  const points = pointsForFind(game.combo, SCORE_FIND, SCORE_COMBO_STEP);
  game.score += points;
  game.levelScore += points;
  addTimeBonus(game.timer, 5);
  spawnFindBurst(canvasPoint.x, canvasPoint.y);
  game.floats.push({ label: `+${points}`, x: canvasPoint.x, y: canvasPoint.y - 24, bornMs: game.nowMs, color: '#2ec4b6' });
  game.floats.push({ label: '+5s', x: canvasPoint.x, y: canvasPoint.y + 6, bornMs: game.nowMs, color: '#ffc53d' });
  playFound(game.combo);
  const remaining = game.active.length - game.found.size;
  announce(`Found: ${diff.label}. ${remaining} remaining.`);
  if (allFound(game.active, game.found)) finishLevel();
}

function useHint() {
  if (game.screen !== 'play' || game.timer.expired) return;
  const diff = DIFFICULTIES[game.difficulty];
  if (game.hintsLeft <= 0) {
    announce('No hints left in this level.');
    return;
  }
  if (game.nowMs < game.hintCooldownUntilMs) {
    announce('The hint is cooling down.');
    return;
  }
  const unfound = game.active.find((d) => !game.found.has(d.id));
  if (!unfound) return;
  game.hintsLeft -= 1;
  game.hintsUsed += 1;
  game.score = Math.max(0, game.score - diff.hintCost);
  game.hintDiff = unfound;
  game.hintUntilMs = game.nowMs + HINT_HIGHLIGHT_MS;
  game.hintCooldownUntilMs = game.nowMs + HINT_COOLDOWN_MS;
  playHint();
  announce('Hint: look inside the golden circle.');
}

function handleUiAction(id) {
  if (id.startsWith('difficulty:')) {
    game.difficulty = id.split(':')[1];
    playClick();
    return;
  }
  if (id === 'title:start') {
    playClick();
    game.screen = 'select';
    return;
  }
  if (id.startsWith('level:')) {
    const sceneId = id.split(':')[1];
    const scene = sceneById(sceneId);
    if (scene.number > game.progress.unlocked) return;
    playClick();
    startLevel(sceneId);
    return;
  }
  if (id === 'select:back') {
    playClick();
    game.screen = 'title';
    return;
  }
  if (id === 'complete:next') {
    playClick();
    if (game.scene.number < SCENES.length) {
      startLevel(SCENES[game.scene.number].id);
    } else {
      game.screen = 'gameComplete';
    }
    return;
  }
  if (id === 'complete:select') {
    playClick();
    game.screen = 'select';
    return;
  }
  if (id === 'timeup:retry') {
    playClick();
    startLevel(game.scene.id);
    return;
  }
  if (id === 'timeup:select') {
    playClick();
    game.screen = 'select';
    return;
  }
  if (id === 'paused:resume') {
    playClick();
    game.screen = 'play';
    startTimer(game.timer);
    return;
  }
  if (id === 'gamecomplete:select') {
    playClick();
    game.screen = 'select';
    return;
  }
  if (id === 'hint') {
    useHint();
    return;
  }
  if (id === 'pause') {
    togglePause();
    return;
  }
  if (id === 'sound') {
    game.muted = toggleMuted();
    return;
  }
}

function togglePause() {
  if (game.screen === 'play') {
    stopTimer(game.timer);
    game.screen = 'paused';
    announce('Paused.');
  } else if (game.screen === 'paused') {
    game.screen = 'play';
    startTimer(game.timer);
    announce('Resumed.');
  }
}

function handleCanvasClick(point) {
  unlockAudio();
  const regions = uiHitRegions(game);
  for (const region of regions) {
    if (point.x >= region.x && point.x <= region.x + region.w && point.y >= region.y && point.y <= region.y + region.h) {
      handleUiAction(region.id);
      return;
    }
  }
  if (game.screen !== 'play') return;
  const panel = panelAt(point.x, point.y);
  if (panel === null) return;
  const scenePoint = toScenePoint(panel);
  trySpot(panel.panel, scenePoint, point);
}

function fitCanvas() {
  const scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT);
  canvas.style.width = `${Math.floor(CANVAS_WIDTH * scale)}px`;
  canvas.style.height = `${Math.floor(CANVAS_HEIGHT * scale)}px`;
}

canvas.addEventListener('pointerdown', (event) => {
  handleCanvasClick(eventPoint(canvas, event));
});

canvas.addEventListener('pointermove', (event) => {
  const point = eventPoint(canvas, event);
  game.cursor.x = point.x;
  game.cursor.y = point.y;
  game.cursor.visible = false;
});

window.addEventListener('keydown', (event) => {
  const action = KEY_ACTIONS[event.key];
  if (!action) return;
  if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
    event.preventDefault();
    const step = event.shiftKey ? 60 : 24;
    const dx = action === 'left' ? -step : action === 'right' ? step : 0;
    const dy = action === 'up' ? -step : action === 'down' ? step : 0;
    moveCursor(game.cursor, dx, dy);
    return;
  }
  if (action === 'confirm') {
    event.preventDefault();
    unlockAudio();
    if (game.cursor.visible) handleCanvasClick({ x: game.cursor.x, y: game.cursor.y });
    return;
  }
  if (action === 'hint') {
    useHint();
    return;
  }
  if (action === 'pause') {
    togglePause();
    return;
  }
  if (action === 'mute') {
    game.muted = toggleMuted();
    return;
  }
  if (action === 'back') {
    if (game.screen === 'select') game.screen = 'title';
    else if (game.screen === 'play') togglePause();
    else if (game.screen === 'paused') togglePause();
  }
});

window.addEventListener('resize', fitCanvas);
fitCanvas();

// The staged screenshot scenes: ?shot=cover|select|hard|win
const shotName = new URLSearchParams(window.location.search).get('shot');
if (shotName) {
  stageShot(shotName, game);
  game.shotMode = true;
}

let lastFrameMs = performance.now();
let shotReadySignalled = false;

function frame(now) {
  const deltaSeconds = game.shotMode ? 0 : Math.min(0.1, (now - lastFrameMs) / 1000);
  lastFrameMs = now;
  game.nowMs = game.shotMode ? game.nowMs : now;
  tickTimer(game.timer, deltaSeconds);
  if (game.timer.expired && game.screen === 'play') {
    game.screen = 'timeUp';
    playMiss();
    announce(`Time's up! You found ${game.found.size} of ${game.active.length} differences.`);
  }
  for (const particle of game.particles) {
    particle.age += deltaSeconds * 1000;
    particle.x += particle.vx * deltaSeconds;
    particle.y += particle.vy * deltaSeconds;
    particle.vy += 60 * deltaSeconds;
  }
  game.particles = game.particles.filter((p) => p.age < p.life);
  game.floats = game.floats.filter((f) => game.nowMs - f.bornMs < 900);
  ctx.save();
  if (game.nowMs < game.shakeUntilMs) {
    ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
  }
  renderGame(ctx, game);
  ctx.restore();
  if (game.shotMode && !shotReadySignalled) {
    shotReadySignalled = true;
    window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}

window.__game = game;
requestAnimationFrame(frame);
