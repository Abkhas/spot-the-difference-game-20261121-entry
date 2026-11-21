// Spot the Difference — configuration: canvas geometry, difficulty tables,
// scoring rules and the shared palette. One job: constants, no behaviour.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

export const HEADER_HEIGHT = 88;
export const FOOTER_TOP = 668;
export const FOOTER_HEIGHT = 124;

export const PANEL_WIDTH = 610;
export const PANEL_HEIGHT = 548;
export const PANEL_TOP = 112;
export const SCENE_WIDTH = 610;
export const SCENE_HEIGHT = 560;
export const LEFT_PANEL_X = 20;
export const RIGHT_PANEL_X = 650;
export const PANEL_GAP_LABEL = 'ORIGINAL';
export const PANEL_GAP_LABEL_RIGHT = 'SPOT THE DIFFERENCES';

export const DIFFICULTIES = {
  easy: { label: 'EASY', diffs: 5, seconds: 150, hints: 3, hintCost: 0, tag: 'Relaxed hunt' },
  normal: { label: 'NORMAL', diffs: 7, seconds: 120, hints: 3, hintCost: 50, tag: 'The classic hunt' },
  hard: { label: 'HARD', diffs: 8, seconds: 90, hints: 2, hintCost: 100, tag: 'Eagle eyes only' },
};

export const DIFFICULTY_ORDER = ['easy', 'normal', 'hard'];

export const SCORE_FIND = 100;
export const SCORE_COMBO_STEP = 25;
export const SCORE_MISS = 25;
export const SCORE_TIME_BONUS_PER_SECOND = 10;
export const HINT_COOLDOWN_MS = 5000;
export const HINT_HIGHLIGHT_MS = 4000;
export const MISS_SHAKE_MS = 350;

export const PALETTE = {
  ink: '#23202b',
  paper: '#fff8e7',
  header: '#1d1830',
  headerText: '#ffe9a8',
  accent: '#ff5d8f',
  gold: '#ffc53d',
  teal: '#2ec4b6',
  sky: '#7ec8e3',
  panelFrame: '#ffffff',
  foundRing: '#2ec4b6',
  foundFill: 'rgba(46, 196, 182, 0.28)',
  hintRing: '#ffc53d',
  danger: '#ff4d4d',
};
