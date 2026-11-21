// Spot the Difference — progression: stars earned per level, best scores and
// best times, and which levels are unlocked. Best results persist in the
// browser; a fresh browser simply starts with level 1 unlocked.
const STORAGE_KEY = 'spot-the-difference-progress-v1';

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stars: {}, bestScore: {}, bestTime: {}, unlocked: 1 };
    const parsed = JSON.parse(raw);
    return {
      stars: parsed.stars || {},
      bestScore: parsed.bestScore || {},
      bestTime: parsed.bestTime || {},
      unlocked: typeof parsed.unlocked === 'number' ? parsed.unlocked : 1,
    };
  } catch (err) {
    return { stars: {}, bestScore: {}, bestTime: {}, unlocked: 1 };
  }
}

function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    // Private mode or blocked storage: the game still plays, nothing persists.
  }
}

export function createProgress() {
  return loadProgress();
}

/** Stars from the time left when a level is completed: over half left is 3. */
export function starsForCompletion(timerFractionLeft, hintsUsed) {
  let stars = timerFractionLeft > 0.5 ? 3 : timerFractionLeft > 0.25 ? 2 : 1;
  if (hintsUsed > 0 && stars === 3) stars = 2;
  return stars;
}

export function recordLevelComplete(progress, levelId, stars, score, secondsUsed) {
  const previousStars = progress.stars[levelId] || 0;
  progress.stars[levelId] = Math.max(previousStars, stars);
  progress.bestScore[levelId] = Math.max(progress.bestScore[levelId] || 0, score);
  const previousBest = progress.bestTime[levelId];
  if (previousBest === undefined || secondsUsed < previousBest) {
    progress.bestTime[levelId] = secondsUsed;
  }
  const levelNumber = Number(levelId.replace('level', ''));
  progress.unlocked = Math.max(progress.unlocked, Math.min(8, levelNumber + 1));
  saveProgress(progress);
  return progress;
}

export function levelStars(progress, levelId) {
  return progress.stars[levelId] || 0;
}

export function levelBestScore(progress, levelId) {
  return progress.bestScore[levelId] || 0;
}

export function levelBestTime(progress, levelId) {
  return progress.bestTime[levelId] || null;
}

export function levelUnlocked(progress, levelNumber) {
  return levelNumber <= progress.unlocked;
}

export function totalStars(progress) {
  return Object.values(progress.stars).reduce((sum, value) => sum + value, 0);
}

export function totalBestScore(progress) {
  return Object.values(progress.bestScore).reduce((sum, value) => sum + value, 0);
}
