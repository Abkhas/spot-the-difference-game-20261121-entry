// Spot the Difference — keyboard and mouse input. Pointer clicks are mapped
// to panel-local coordinates and handed to the game as "try this spot"; the
// arrow keys drive a crosshair so the game is fully playable by keyboard.
import { CANVAS_WIDTH, CANVAS_HEIGHT, LEFT_PANEL_X, RIGHT_PANEL_X, PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT, SCENE_HEIGHT, SCENE_WIDTH } from './config.js';

export function createCursor() {
  return { x: CANVAS_WIDTH / 2, y: PANEL_TOP + PANEL_HEIGHT / 2, visible: false };
}

/** Which panel (0 left, 1 right) holds canvas point (x, y), with local coords. */
export function panelAt(x, y) {
  if (y < PANEL_TOP || y > PANEL_TOP + PANEL_HEIGHT) return null;
  if (x >= LEFT_PANEL_X && x <= LEFT_PANEL_X + PANEL_WIDTH) {
    return { panel: 0, x: x - LEFT_PANEL_X, y: y - PANEL_TOP };
  }
  if (x >= RIGHT_PANEL_X && x <= RIGHT_PANEL_X + PANEL_WIDTH) {
    return { panel: 1, x: x - RIGHT_PANEL_X, y: y - PANEL_TOP };
  }
  return null;
}

/** Panel-local point (0..610, 0..548) into scene space (0..610, 0..560). */
export function toScenePoint(local) {
  return { x: local.x, y: (local.y * SCENE_HEIGHT) / PANEL_HEIGHT };
}

/** Scene-space point (0..610, 0..560) into panel-local pixels. */
export function toPanelPoint(scenePoint) {
  return { x: scenePoint.x, y: (scenePoint.y * PANEL_HEIGHT) / SCENE_HEIGHT };
}

export function moveCursor(cursor, dx, dy) {
  cursor.visible = true;
  cursor.x = Math.min(CANVAS_WIDTH - 4, Math.max(4, cursor.x + dx));
  cursor.y = Math.min(CANVAS_HEIGHT - 4, Math.max(4, cursor.y + dy));
}

/** Canvas coordinates of a pointer event, honouring the CSS scaling. */
export function eventPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export const KEY_ACTIONS = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ' ': 'confirm',
  Enter: 'confirm',
  h: 'hint',
  H: 'hint',
  p: 'pause',
  P: 'pause',
  m: 'mute',
  M: 'mute',
  Escape: 'back',
};
