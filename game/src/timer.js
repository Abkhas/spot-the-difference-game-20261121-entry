// Spot the Difference — countdown timer. One job: track remaining time, hand
// out bonuses, and report the pressure states the HUD and the judge can see.
export function createTimer(totalSeconds) {
  return {
    total: totalSeconds,
    remaining: totalSeconds,
    running: false,
    expired: false,
  };
}

export function startTimer(timer) {
  timer.running = true;
}

export function stopTimer(timer) {
  timer.running = false;
}

export function tickTimer(timer, deltaSeconds) {
  if (!timer.running || timer.expired) return;
  timer.remaining -= deltaSeconds;
  if (timer.remaining <= 0) {
    timer.remaining = 0;
    timer.expired = true;
    timer.running = false;
  }
}

/** A found difference buys a little more time, shown as a floating "+5s". */
export function addTimeBonus(timer, seconds) {
  timer.remaining = Math.min(timer.total, timer.remaining + seconds);
  return seconds;
}

export function timerSecondsLeft(timer) {
  return Math.ceil(timer.remaining);
}

export function timerFractionLeft(timer) {
  return timer.total === 0 ? 0 : timer.remaining / timer.total;
}

/** Under 15 seconds the HUD pulses red: time pressure you can feel. */
export function timerIsLow(timer) {
  return timer.remaining <= 15 && !timer.expired;
}

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
