// Spot the Difference — difference lookup: which differences are in play for
// the chosen difficulty, and which one (if any) a click lands on.
import { DIFFICULTIES } from './config.js';

/** The differences active in this level: Easy 5, Normal 7, Hard all 8. */
export function activeDifferences(scene, difficultyKey) {
  const count = DIFFICULTIES[difficultyKey].diffs;
  return scene.diffs.slice(0, count);
}

/** The difference whose circle holds panel-local point (x, y), or null. */
export function differenceAt(scene, active, x, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const diff of active) {
    const dx = x - diff.x;
    const dy = y - diff.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= diff.r && distance < bestDistance) {
      best = diff;
      bestDistance = distance;
    }
  }
  return best;
}

/** Score for one find: base plus a combo step, capped by the combo length. */
export function pointsForFind(combo, base = 100, step = 25) {
  return base + step * Math.max(0, combo - 1);
}

export function remainingCount(active, found) {
  return active.filter((diff) => !found.has(diff.id)).length;
}

export function allFound(active, found) {
  return active.every((diff) => found.has(diff.id));
}
