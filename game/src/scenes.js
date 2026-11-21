// Spot the Difference — the six scenes. Every picture is drawn in code (canvas
// 2D, no image files): each scene is one function that paints the same place
// twice, the right panel with a set of differences switched on. A difference
// is a discrete, fair change: an object added or removed, a colour swapped,
// a sign reworded, a light switched. Coordinates live in a 610 x 560 panel.
import { SCENE_WIDTH, SCENE_HEIGHT } from './config.js';

export const PANEL_W = SCENE_WIDTH;
export const PANEL_H = SCENE_HEIGHT;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function star(ctx, x, y, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function skyGradient(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}

function ground(ctx, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, PANEL_W, PANEL_H - y);
}

function label(ctx, text, x, y, size, color, align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// ---------------------------------------------------------------------------
// Scene 1 — Night Market. Dusk sky, string lights, three stalls, a cat.
// ---------------------------------------------------------------------------
function drawNightMarket(ctx, alt) {
  skyGradient(ctx, [[0, '#2b1a4d'], [0.55, '#7b2d6b'], [0.75, '#e8734a'], [1, '#f7b267']]);
  // Stars (one of them is a difference).
  ctx.fillStyle = '#fff6c9';
  const stars = [[60, 50], [120, 60], [200, 38], [350, 55], [430, 40], [90, 110], [260, 90]];
  for (const [x, y] of stars) {
    if (x === 120 && alt.has('star-count')) continue;
    star(ctx, x, y, 5);
    ctx.fill();
  }
  // Moon: full in the original, a crescent in the altered panel.
  circle(ctx, 520, 70, 26);
  ctx.fillStyle = '#ffedb0';
  ctx.fill();
  if (alt.has('moon-phase')) {
    circle(ctx, 530, 64, 22);
    ctx.fillStyle = '#7b2d6b';
    ctx.fill();
  }
  // Distant rooftops, one window lit in the original only.
  ctx.fillStyle = '#3a2358';
  ctx.fillRect(0, 300, 180, 120);
  ctx.fillRect(430, 290, 180, 130);
  ctx.fillStyle = alt.has('window-light') ? '#3a2358' : '#ffd94d';
  ctx.fillRect(60, 320, 26, 30);
  ctx.fillStyle = '#ffd94d';
  ctx.fillRect(480, 330, 24, 28);
  ctx.fillRect(540, 330, 24, 28);
  // Street.
  ground(ctx, 420, '#4a2c4f');
  ctx.fillStyle = '#5d3a5e';
  ctx.fillRect(0, 420, PANEL_W, 10);
  // String lights across the top.
  ctx.strokeStyle = '#2b1a4d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.quadraticCurveTo(305, 165, 610, 120);
  ctx.stroke();
  const bulbColors = ['#ffd94d', '#ff5d8f', '#2ec4b6', '#ffd94d', '#ff5d8f', '#2ec4b6'];
  for (let i = 0; i < 6; i += 1) {
    const t = (i + 0.5) / 6;
    const x = t * 610;
    const y = 120 + Math.sin(t * Math.PI) * 38;
    circle(ctx, x, y + 8, 8);
    ctx.fillStyle = bulbColors[i];
    ctx.fill();
  }
  // Bunting flags under the lights (flag 3 is teal in the original, pink altered).
  for (let i = 0; i < 8; i += 1) {
    const x = 20 + i * 72;
    let flagColor = ['#2ec4b6', '#ffc53d', '#ff5d8f'][i % 3];
    if (i === 2) flagColor = alt.has('flag-colour') ? '#ff5d8f' : '#2ec4b6';
    ctx.fillStyle = flagColor;
    ctx.beginPath();
    ctx.moveTo(x, 168);
    ctx.lineTo(x + 34, 168);
    ctx.lineTo(x + 17, 196);
    ctx.closePath();
    ctx.fill();
  }
  drawMarketStall(ctx, 30, 250, '#e84545', 'SATE', alt.has('sign-text') ? 'SOTO' : 'SATE', alt);
  drawMarketStall(ctx, 230, 240, '#2ec4b6', 'LANTERNS', 'LANTERNS', alt);
  drawMarketStall(ctx, 430, 250, '#ffc53d', 'TOYS', 'TOYS', alt);
  // Basket of oranges at the food stall: five in the original, four altered.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(70, 448, 70, 26);
  const orangeCount = alt.has('oranges-count') ? 4 : 5;
  for (let i = 0; i < orangeCount; i += 1) {
    circle(ctx, 80 + i * 13, 442 - (i % 2) * 8, 9);
    ctx.fillStyle = '#ff8c2e';
    ctx.fill();
  }
  // The market cat, asleep on a crate by the toy stall.
  if (!alt.has('cat-present')) {
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.ellipse(505, 470, 30, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 530, 458, 11);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(524, 449);
    ctx.lineTo(528, 438);
    ctx.lineTo(533, 449);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(534, 449);
    ctx.lineTo(538, 438);
    ctx.lineTo(543, 449);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(478, 472);
    ctx.quadraticCurveTo(462, 462, 468, 450);
    ctx.stroke();
  }
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(480, 486, 56, 40);
  ctx.fillRect(540, 486, 40, 40);
}

function drawMarketStall(ctx, x, y, awning, signText, shownText, alt) {
  // Stall counter and posts.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x, y + 150, 150, 90);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(x, y + 150, 150, 14);
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(x + 8, y + 40, 10, 116);
  ctx.fillRect(x + 132, y + 40, 10, 116);
  // Striped awning.
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? awning : '#fff8e7';
    ctx.fillRect(x - 6 + i * 32, y, 32, 40);
  }
  // Hanging lanterns (the middle stall's centre lantern changes colour).
  const isLanternStall = signText === 'LANTERNS';
  for (let i = 0; i < 3; i += 1) {
    const lx = x + 30 + i * 45;
    ctx.strokeStyle = '#4a2c14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, y + 40);
    ctx.lineTo(lx, y + 52);
    ctx.stroke();
    let lanternColor = '#ff5d5d';
    if (isLanternStall && i === 1 && alt.has('lantern-colour')) lanternColor = '#ffc53d';
    circle(ctx, lx, y + 66, 13);
    ctx.fillStyle = lanternColor;
    ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.fillRect(lx - 4, y + 54, 8, 4);
  }
  // Sign board.
  ctx.fillStyle = '#2b1a4d';
  rr(ctx, x + 18, y + 96, 114, 40, 8);
  ctx.fill();
  label(ctx, shownText, x + 75, y + 117, 20, '#ffe9a8');
  // Goods on the counter.
  if (signText === 'SATE') {
    ctx.fillStyle = '#ffcf5c';
    for (let i = 0; i < 3; i += 1) {
      rr(ctx, x + 20 + i * 42, y + 168, 36, 26, 6);
      ctx.fill();
    }
  } else if (signText === 'LANTERNS') {
    ctx.fillStyle = '#ff8c2e';
    for (let i = 0; i < 3; i += 1) {
      circle(ctx, x + 32 + i * 42, y + 182, 12);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#ff5d8f';
    circle(ctx, x + 40, y + 182, 13);
    ctx.fill();
    ctx.fillStyle = '#2ec4b6';
    circle(ctx, x + 78, y + 182, 13);
    ctx.fill();
    ctx.fillStyle = '#ffc53d';
    circle(ctx, x + 112, y + 182, 13);
    ctx.fill();
  }
}

const nightMarketDiffs = [
  { id: 'moon-phase', x: 520, y: 70, r: 30, label: 'The moon changed phase' },
  { id: 'lantern-colour', x: 305, y: 306, r: 24, label: 'A lantern changed colour' },
  { id: 'sign-text', x: 105, y: 367, r: 32, label: 'The stall sign changed word' },
  { id: 'cat-present', x: 505, y: 465, r: 32, label: 'The sleeping cat vanished' },
  { id: 'star-count', x: 120, y: 60, r: 16, label: 'A star went out' },
  { id: 'flag-colour', x: 181, y: 182, r: 20, label: 'A bunting flag changed colour' },
  { id: 'oranges-count', x: 105, y: 440, r: 28, label: 'An orange is missing' },
  { id: 'window-light', x: 73, y: 335, r: 24, label: 'A window went dark' },
];

// ---------------------------------------------------------------------------
// Scene 2 — Old Library. Shelves, a desk lamp, a portrait, a window of rain.
// ---------------------------------------------------------------------------
function drawLibrary(ctx, alt) {
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  // Tall shelves left and right.
  drawBookShelf(ctx, 20, 60, 170, 380, alt);
  drawBookShelf(ctx, 420, 60, 170, 380, alt);
  // Centre window: rain in the original, clear night altered.
  ctx.fillStyle = '#3a2a1a';
  rr(ctx, 225, 60, 160, 200, 6);
  ctx.fill();
  ctx.fillStyle = '#1d2f4d';
  ctx.fillRect(235, 70, 140, 180);
  if (!alt.has('window-rain')) {
    ctx.strokeStyle = 'rgba(180, 210, 255, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i += 1) {
      const x = 245 + i * 16;
      ctx.beginPath();
      ctx.moveTo(x, 80 + (i % 3) * 40);
      ctx.lineTo(x - 8, 110 + (i % 3) * 40);
      ctx.stroke();
    }
  } else {
    circle(ctx, 335, 105, 16);
    ctx.fillStyle = '#ffe9a8';
    ctx.fill();
    star(ctx, 260, 95, 5);
    ctx.fillStyle = '#fff6c9';
    ctx.fill();
    star(ctx, 355, 150, 4);
    ctx.fill();
  }
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(300, 70, 8, 180);
  ctx.fillRect(235, 160, 140, 8);
  // Wall clock above the window.
  circle(ctx, 305, 40, 24);
  ctx.fillStyle = '#fff8e7';
  ctx.fill();
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(305, 40, 24, 0, Math.PI * 2);
  ctx.stroke();
  drawClockHands(ctx, 305, 40, alt.has('clock-time'));
  // Portrait of the stern librarian (moustache in the altered panel).
  ctx.fillStyle = '#c9a227';
  rr(ctx, 235, 280, 140, 120, 6);
  ctx.fill();
  ctx.fillStyle = '#e8d5a8';
  ctx.fillRect(245, 290, 120, 100);
  circle(ctx, 305, 330, 22);
  ctx.fillStyle = '#f2c89b';
  ctx.fill();
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(283, 312, 44, 8);
  ctx.fillStyle = '#5a4632';
  ctx.beginPath();
  ctx.moveTo(245, 390);
  ctx.quadraticCurveTo(305, 350, 365, 390);
  ctx.closePath();
  ctx.fill();
  if (alt.has('portrait-moustache')) {
    ctx.fillStyle = '#3a2a1a';
    rr(ctx, 292, 338, 26, 7, 3);
    ctx.fill();
  }
  // Desk with lamp and globe.
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(150, 440, 310, 26);
  ctx.fillRect(170, 466, 16, 70);
  ctx.fillRect(424, 466, 16, 70);
  // Lamp: warm glow in the original, switched off altered.
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(200, 440);
  ctx.lineTo(200, 390);
  ctx.stroke();
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.moveTo(182, 392);
  ctx.lineTo(218, 392);
  ctx.lineTo(208, 372);
  ctx.lineTo(192, 372);
  ctx.closePath();
  ctx.fill();
  if (!alt.has('lamp-off')) {
    const glow = ctx.createRadialGradient(200, 400, 4, 200, 400, 90);
    glow.addColorStop(0, 'rgba(255, 217, 77, 0.55)');
    glow.addColorStop(1, 'rgba(255, 217, 77, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(100, 300, 200, 160);
  }
  // Globe on the desk.
  circle(ctx, 420, 405, 30);
  ctx.fillStyle = '#2e86c1';
  ctx.fill();
  ctx.fillStyle = '#58b368';
  ctx.beginPath();
  ctx.ellipse(412, 398, 12, 9, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(430, 414, 10, 7, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(420, 405, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(414, 434, 12, 8);
  // Ladder leaning on the right shelf (one rung fewer altered).
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(430, 440);
  ctx.lineTo(470, 120);
  ctx.moveTo(460, 440);
  ctx.lineTo(500, 120);
  ctx.stroke();
  ctx.lineWidth = 4;
  const rungs = alt.has('ladder-rungs') ? 4 : 5;
  for (let i = 0; i < rungs; i += 1) {
    const y = 400 - i * 62;
    ctx.beginPath();
    ctx.moveTo(434 + (440 - y) * 0.125, y);
    ctx.lineTo(464 + (440 - y) * 0.125, y);
    ctx.stroke();
  }
  // Rug with a diamond that changes colour.
  ctx.fillStyle = '#a33327';
  rr(ctx, 180, 500, 250, 44, 8);
  ctx.fill();
  ctx.fillStyle = alt.has('rug-diamond') ? '#2ec4b6' : '#ffc53d';
  ctx.beginPath();
  ctx.moveTo(305, 508);
  ctx.lineTo(325, 522);
  ctx.lineTo(305, 536);
  ctx.lineTo(285, 522);
  ctx.closePath();
  ctx.fill();
  // The shelf owl (present in the original only).
  if (!alt.has('owl-present')) {
    ctx.fillStyle = '#8a6d4b';
    circle(ctx, 505, 130, 16);
    ctx.fill();
    circle(ctx, 490, 112, 8);
    ctx.fill();
    circle(ctx, 520, 112, 8);
    ctx.fill();
    ctx.fillStyle = '#fff8e7';
    circle(ctx, 499, 128, 5);
    ctx.fill();
    circle(ctx, 511, 128, 5);
    ctx.fill();
  }
}

function drawClockHands(ctx, x, y, altered) {
  ctx.strokeStyle = '#23202b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  if (!altered) {
    ctx.lineTo(x + 12, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 13);
  } else {
    ctx.lineTo(x - 11, y + 6);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4, y - 13);
  }
  ctx.stroke();
  circle(ctx, x, y, 3);
  ctx.fillStyle = '#23202b';
  ctx.fill();
}

function drawBookShelf(ctx, x, y, w, h, alt) {
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x, y, w, h);
  const rows = 4;
  const rowH = h / rows;
  const spineColors = ['#c0392b', '#2e86c1', '#27ae60', '#e67e22', '#8e44ad', '#f1c40f', '#16a085', '#d35400'];
  for (let r = 0; r < rows; r += 1) {
    const rowY = y + r * rowH + 8;
    const bookW = 16;
    const count = Math.floor((w - 16) / bookW);
    for (let i = 0; i < count; i += 1) {
      // One book is missing from the second row, left shelf (a difference).
      if (x === 20 && r === 1 && i === 4 && alt.has('book-gap')) continue;
      const bx = x + 8 + i * bookW;
      ctx.fillStyle = spineColors[(r * 3 + i) % spineColors.length];
      ctx.fillRect(bx, rowY, bookW - 3, rowH - 22);
      ctx.fillStyle = 'rgba(255, 248, 231, 0.85)';
      ctx.fillRect(bx + 2, rowY + 8, bookW - 7, 4);
    }
    ctx.fillStyle = '#4a2c14';
    ctx.fillRect(x, rowY + rowH - 14, w, 8);
  }
}

const libraryDiffs = [
  { id: 'clock-time', x: 305, y: 40, r: 28, label: 'The clock shows a different time' },
  { id: 'book-gap', x: 92, y: 190, r: 22, label: 'A book is missing from the shelf' },
  { id: 'lamp-off', x: 200, y: 390, r: 30, label: 'The desk lamp is switched off' },
  { id: 'portrait-moustache', x: 305, y: 340, r: 30, label: 'The portrait grew a moustache' },
  { id: 'rug-diamond', x: 305, y: 522, r: 26, label: 'The rug diamond changed colour' },
  { id: 'window-rain', x: 305, y: 165, r: 34, label: 'The rain stopped outside' },
  { id: 'ladder-rungs', x: 455, y: 152, r: 26, label: 'The ladder lost a rung' },
  { id: 'owl-present', x: 505, y: 128, r: 26, label: 'The shelf owl flew away' },
];

// ---------------------------------------------------------------------------
// Scene 3 — Harbour at Dusk. Lighthouse, boats, gulls, a jumping fish.
// ---------------------------------------------------------------------------
function drawHarbour(ctx, alt) {
  skyGradient(ctx, [[0, '#1d2f4d'], [0.45, '#e8734a'], [0.6, '#f7b267'], [0.62, '#2e6f8e'], [1, '#1d4e6b']]);
  circle(ctx, 470, 300, 34);
  ctx.fillStyle = '#ffd94d';
  ctx.fill();
  // Distant headland with a little house (one window lit in the original).
  ctx.fillStyle = '#24344d';
  ctx.beginPath();
  ctx.moveTo(0, 330);
  ctx.lineTo(150, 300);
  ctx.lineTo(240, 330);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#24344d';
  ctx.fillRect(40, 268, 60, 52);
  ctx.beginPath();
  ctx.moveTo(35, 268);
  ctx.lineTo(70, 240);
  ctx.lineTo(105, 268);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = alt.has('house-window') ? '#24344d' : '#ffd94d';
  ctx.fillRect(62, 288, 14, 16);
  // Sea.
  ctx.fillStyle = '#1d4e6b';
  ctx.fillRect(0, 330, PANEL_W, 230);
  ctx.strokeStyle = 'rgba(255, 237, 176, 0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const y = 360 + i * 38;
    ctx.beginPath();
    for (let x = 20; x <= 590; x += 20) {
      const yy = y + Math.sin((x + i * 40) * 0.03) * 5;
      if (x === 20) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Lighthouse on the left pier (beam on in the original only).
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(52, 400, 130, 14);
  ctx.fillStyle = '#f4f1ea';
  ctx.beginPath();
  ctx.moveTo(70, 400);
  ctx.lineTo(80, 240);
  ctx.lineTo(110, 240);
  ctx.lineTo(120, 400);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e84545';
  ctx.fillRect(74, 300, 42, 26);
  ctx.fillRect(78, 262, 34, 22);
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(76, 222, 38, 20);
  circle(ctx, 95, 232, 8);
  ctx.fillStyle = '#ffd94d';
  ctx.fill();
  if (!alt.has('lighthouse-beam')) {
    const beam = ctx.createLinearGradient(114, 232, 560, 232);
    beam.addColorStop(0, 'rgba(255, 217, 77, 0.5)');
    beam.addColorStop(1, 'rgba(255, 217, 77, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(114, 222);
    ctx.lineTo(560, 190);
    ctx.lineTo(560, 280);
    ctx.lineTo(114, 242);
    ctx.closePath();
    ctx.fill();
  }
  // Boats.
  drawBoat(ctx, 250, 400, '#e84545', alt.has('sail-colour'), alt.has('boat-flag'));
  drawBoat(ctx, 420, 450, '#2ec4b6', false, false);
  // Crates on the pier (one fewer crate altered).
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(200, 470, 60, 60);
  ctx.fillRect(264, 470, 60, 60);
  ctx.fillRect(232, 410, 60, 60);
  if (!alt.has('crate-count')) {
    ctx.fillRect(290, 410, 34, 60);
  }
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 2;
  ctx.strokeRect(200, 470, 60, 60);
  ctx.strokeRect(264, 470, 60, 60);
  ctx.strokeRect(232, 410, 60, 60);
  // Buoy (orange in the original, yellow altered).
  circle(ctx, 520, 500, 14);
  ctx.fillStyle = alt.has('buoy-colour') ? '#ffd94d' : '#ff6b35';
  ctx.fill();
  ctx.fillStyle = '#fff8e7';
  ctx.fillRect(514, 492, 12, 6);
  // Gulls (one fewer altered).
  ctx.strokeStyle = '#23202b';
  ctx.lineWidth = 2;
  const gulls = [[180, 120], [300, 90], [420, 140], [520, 90]];
  for (let i = 0; i < gulls.length; i += 1) {
    if (i === 3 && alt.has('gull-count')) continue;
    const [gx, gy] = gulls[i];
    ctx.beginPath();
    ctx.moveTo(gx - 10, gy);
    ctx.quadraticCurveTo(gx - 3, gy - 8, gx, gy);
    ctx.quadraticCurveTo(gx + 3, gy - 8, gx + 10, gy);
    ctx.stroke();
  }
  // A fish jumping out of the sea (original only).
  if (!alt.has('fish-jump')) {
    ctx.fillStyle = '#9fd8e8';
    ctx.beginPath();
    ctx.ellipse(360, 360, 16, 8, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(374, 356);
    ctx.lineTo(388, 348);
    ctx.lineTo(384, 362);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(360, 382, 12, Math.PI, 0);
    ctx.stroke();
  }
  // Foreground pier planks.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(0, 530, PANEL_W, 30);
  ctx.strokeStyle = '#4a2c14';
  ctx.lineWidth = 2;
  for (let x = 0; x < PANEL_W; x += 76) {
    ctx.beginPath();
    ctx.moveTo(x, 530);
    ctx.lineTo(x, 560);
    ctx.stroke();
  }
}

function drawBoat(ctx, x, y, sailColor, sailAltered, flagAltered) {
  // Hull.
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.moveTo(x - 50, y);
  ctx.lineTo(x + 50, y);
  ctx.lineTo(x + 34, y + 22);
  ctx.lineTo(x - 34, y + 22);
  ctx.closePath();
  ctx.fill();
  // Mast and sail.
  ctx.strokeStyle = '#4a2c14';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 90);
  ctx.stroke();
  ctx.fillStyle = sailAltered ? '#fff8e7' : sailColor;
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 86);
  ctx.lineTo(x + 4, y - 10);
  ctx.lineTo(x + 46, y - 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = sailAltered ? '#fff8e7' : sailColor;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 80);
  ctx.lineTo(x - 4, y - 12);
  ctx.lineTo(x - 36, y - 12);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  // Flag on the mast (original only for the first boat).
  if (!flagAltered) {
    ctx.fillStyle = '#ffc53d';
    ctx.beginPath();
    ctx.moveTo(x, y - 90);
    ctx.lineTo(x + 20, y - 84);
    ctx.lineTo(x, y - 78);
    ctx.closePath();
    ctx.fill();
  }
}

const harbourDiffs = [
  { id: 'lighthouse-beam', x: 300, y: 232, r: 34, label: 'The lighthouse beam went out' },
  { id: 'sail-colour', x: 280, y: 350, r: 30, label: 'The sail changed colour' },
  { id: 'gull-count', x: 520, y: 90, r: 18, label: 'A gull flew away' },
  { id: 'buoy-colour', x: 520, y: 500, r: 22, label: 'The buoy changed colour' },
  { id: 'crate-count', x: 307, y: 440, r: 28, label: 'A crate is missing from the stack' },
  { id: 'fish-jump', x: 365, y: 360, r: 26, label: 'The jumping fish is gone' },
  { id: 'house-window', x: 69, y: 296, r: 20, label: 'The cottage window went dark' },
  { id: 'boat-flag', x: 270, y: 315, r: 20, label: 'The boat lost its flag' },
];

// ---------------------------------------------------------------------------
// Scene 4 — Bakery Kitchen. Jars, cakes, a chalkboard, a potted plant.
// ---------------------------------------------------------------------------
function drawBakery(ctx, alt) {
  // Tiled wall.
  ctx.fillStyle = '#f3e3c8';
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  ctx.strokeStyle = '#e0cba0';
  ctx.lineWidth = 2;
  for (let y = 0; y < 380; y += 46) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PANEL_W, y);
    ctx.stroke();
  }
  for (let x = 0; x < PANEL_W; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 380);
    ctx.stroke();
  }
  // Window with a sunny sky.
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, 400, 40, 170, 150, 8);
  ctx.fill();
  ctx.fillStyle = '#aee3f5';
  ctx.fillRect(412, 52, 146, 126);
  circle(ctx, 510, 90, 20);
  ctx.fillStyle = '#ffd94d';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(450, 120, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(500, 145, 30, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(480, 52, 8, 126);
  ctx.fillRect(412, 110, 146, 8);
  // Shelf with jars (one jar's jam changes colour).
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(30, 180, 330, 14);
  const jarColors = ['#e84545', '#f39c12', '#8e44ad', '#27ae60'];
  for (let i = 0; i < 4; i += 1) {
    const jx = 50 + i * 78;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    rr(ctx, jx, 120, 52, 60, 8);
    ctx.fill();
    let fill = jarColors[i];
    if (i === 1 && alt.has('jar-colour')) fill = '#e84545';
    ctx.fillStyle = fill;
    ctx.fillRect(jx + 6, 148, 40, 28);
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(jx + 10, 112, 32, 10);
  }
  // Chalkboard menu (the word changes).
  ctx.fillStyle = '#2b3a2b';
  rr(ctx, 30, 200, 180, 80, 8);
  ctx.fill();
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 26px Trebuchet MS, Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(alt.has('menu-word') ? 'PIE' : 'CAKE', 120, 240);
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 200, 180, 80);
  // Hanging utensils (one spoon missing altered).
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(250, 220);
  ctx.lineTo(250, 250);
  ctx.moveTo(290, 220);
  ctx.lineTo(290, 250);
  ctx.moveTo(330, 220);
  ctx.lineTo(330, 250);
  ctx.stroke();
  drawSpoon(ctx, 250, 258);
  if (!alt.has('spoon-missing')) drawSpoon(ctx, 290, 258);
  drawSpoon(ctx, 330, 258);
  // Counter.
  ctx.fillStyle = '#a9805a';
  ctx.fillRect(0, 380, PANEL_W, 30);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, 410, PANEL_W, 150);
  // Layer cake on a stand (three layers original, two altered).
  ctx.fillStyle = '#d9d9d9';
  ctx.beginPath();
  ctx.ellipse(120, 372, 62, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7d6e0';
  ctx.fillRect(76, 300, 88, 26);
  ctx.fillStyle = '#fff8e7';
  ctx.fillRect(84, 326, 72, 20);
  if (!alt.has('cake-layers')) {
    ctx.fillStyle = '#f7d6e0';
    ctx.fillRect(92, 274, 56, 26);
    ctx.fillStyle = '#e84545';
    circle(ctx, 120, 268, 7);
    ctx.fill();
  } else {
    ctx.fillStyle = '#e84545';
    circle(ctx, 120, 294, 7);
    ctx.fill();
  }
  // Cupcake row (one cherry missing altered).
  for (let i = 0; i < 3; i += 1) {
    const cx = 250 + i * 56;
    ctx.fillStyle = '#e8b4d6';
    ctx.beginPath();
    ctx.moveTo(cx - 16, 356);
    ctx.lineTo(cx + 16, 356);
    ctx.lineTo(cx + 11, 378);
    ctx.lineTo(cx - 11, 378);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff8e7';
    circle(ctx, cx, 350, 13);
    ctx.fill();
    if (!(i === 1 && alt.has('cherry-missing'))) {
      ctx.fillStyle = '#e84545';
      circle(ctx, cx, 336, 5);
      ctx.fill();
    }
  }
  // Oven with a glowing window (dark altered).
  ctx.fillStyle = '#5a5a5a';
  rr(ctx, 430, 380, 150, 140, 8);
  ctx.fill();
  ctx.fillStyle = alt.has('oven-light') ? '#3a3a3a' : '#ffb347';
  rr(ctx, 450, 400, 110, 60, 6);
  ctx.fill();
  ctx.fillStyle = '#d9d9d9';
  ctx.fillRect(450, 480, 110, 8);
  circle(ctx, 460, 392, 4);
  ctx.fillStyle = '#e84545';
  ctx.fill();
  circle(ctx, 480, 392, 4);
  ctx.fillStyle = '#2ec4b6';
  ctx.fill();
  // Potted plant (three flowers original, two altered).
  ctx.fillStyle = '#c96f4a';
  ctx.beginPath();
  ctx.moveTo(540, 330);
  ctx.lineTo(580, 330);
  ctx.lineTo(574, 372);
  ctx.lineTo(546, 372);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#27ae60';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(560, 330);
  ctx.lineTo(560, 290);
  ctx.moveTo(560, 310);
  ctx.lineTo(540, 292);
  ctx.moveTo(560, 300);
  ctx.lineTo(582, 282);
  ctx.stroke();
  const flowerCount = alt.has('plant-flowers') ? 2 : 3;
  const flowerSpots = [[540, 290], [582, 280], [560, 268]];
  for (let i = 0; i < flowerCount; i += 1) {
    const [fx, fy] = flowerSpots[i];
    ctx.fillStyle = '#ff5d8f';
    for (let p = 0; p < 5; p += 1) {
      const a = (p * Math.PI * 2) / 5;
      circle(ctx, fx + Math.cos(a) * 7, fy + Math.sin(a) * 7, 5);
      ctx.fill();
    }
    ctx.fillStyle = '#ffd94d';
    circle(ctx, fx, fy, 5);
    ctx.fill();
  }
  // Wall clock.
  circle(ctx, 305, 90, 24);
  ctx.fillStyle = '#fff8e7';
  ctx.fill();
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(305, 90, 24, 0, Math.PI * 2);
  ctx.stroke();
  drawClockHands(ctx, 305, 90, alt.has('clock-time'));
}

function drawSpoon(ctx, x, y) {
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 22);
  ctx.stroke();
  ctx.fillStyle = '#c9c9c9';
  ctx.beginPath();
  ctx.ellipse(x, y + 30, 7, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

const bakeryDiffs = [
  { id: 'cake-layers', x: 120, y: 315, r: 28, label: 'The cake lost a layer' },
  { id: 'jar-colour', x: 128, y: 150, r: 26, label: 'A jar of jam changed colour' },
  { id: 'menu-word', x: 120, y: 240, r: 26, label: 'The chalkboard word changed' },
  { id: 'oven-light', x: 505, y: 430, r: 32, label: 'The oven light went out' },
  { id: 'plant-flowers', x: 560, y: 285, r: 28, label: 'A flower is missing from the plant' },
  { id: 'spoon-missing', x: 290, y: 280, r: 22, label: 'A hanging spoon is gone' },
  { id: 'clock-time', x: 305, y: 90, r: 28, label: 'The clock shows a different time' },
  { id: 'cherry-missing', x: 306, y: 336, r: 18, label: 'A cupcake lost its cherry' },
];

// ---------------------------------------------------------------------------
// Scene 5 — Train Station. Clock, posters, luggage, a waiting train.
// ---------------------------------------------------------------------------
function drawStation(ctx, alt) {
  skyGradient(ctx, [[0, '#8ecae6'], [0.6, '#cdeffb'], [1, '#e8f6ff']]);
  // Station roofline and arches.
  ctx.fillStyle = '#4a3b2f';
  ctx.fillRect(0, 0, PANEL_W, 60);
  ctx.fillStyle = '#6b5a4a';
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(90 + i * 150, 60, 42, Math.PI, 0);
    ctx.fill();
  }
  // The waiting train.
  ctx.fillStyle = '#2e86c1';
  rr(ctx, 30, 180, 550, 130, 18);
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.fillRect(30, 240, 550, 14);
  const litWindows = alt.has('train-window') ? 4 : 5;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i < litWindows ? '#fff8e7' : '#2b3a4d';
    rr(ctx, 60 + i * 104, 200, 72, 34, 6);
    ctx.fill();
  }
  ctx.fillStyle = '#23202b';
  circle(ctx, 110, 320, 26);
  ctx.fill();
  circle(ctx, 500, 320, 26);
  ctx.fill();
  ctx.fillStyle = '#8a8a8a';
  circle(ctx, 110, 320, 10);
  ctx.fill();
  circle(ctx, 500, 320, 10);
  ctx.fill();
  // Platform.
  ground(ctx, 330, '#9c8a76');
  ctx.fillStyle = '#7a6a58';
  ctx.fillRect(0, 330, PANEL_W, 10);
  ctx.fillStyle = '#ffd94d';
  for (let x = 10; x < PANEL_W; x += 60) ctx.fillRect(x, 344, 34, 8);
  // Big station clock.
  circle(ctx, 305, 110, 34);
  ctx.fillStyle = '#fff8e7';
  ctx.fill();
  ctx.strokeStyle = '#23202b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(305, 110, 34, 0, Math.PI * 2);
  ctx.stroke();
  drawClockHands(ctx, 305, 110, alt.has('clock-time'));
  // Departure board (the time changes).
  ctx.fillStyle = '#23202b';
  rr(ctx, 60, 380, 200, 70, 8);
  ctx.fill();
  label(ctx, 'PLATFORM 2', 160, 400, 15, '#7ec8e3');
  label(ctx, alt.has('board-time') ? '11:15' : '10:45', 160, 430, 26, '#ffd94d');
  // Posters (the sun poster becomes a moon poster).
  drawPoster(ctx, 330, 380, '#ff8c2e', alt.has('poster-scene') ? 'moon' : 'sun');
  drawPoster(ctx, 440, 380, '#2ec4b6', 'sea');
  // Benches (one bench missing altered).
  drawBench(ctx, 300, 470);
  if (!alt.has('bench-count')) drawBench(ctx, 480, 470);
  // Luggage (the red suitcase turns blue).
  ctx.fillStyle = alt.has('suitcase-colour') ? '#2e86c1' : '#e84545';
  rr(ctx, 90, 480, 56, 44, 6);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(112, 468, 12, 12);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(90, 498, 56, 6);
  ctx.fillStyle = '#2e86c1';
  rr(ctx, 152, 492, 44, 32, 6);
  ctx.fill();
  // Signal light (green original, red altered).
  ctx.fillStyle = '#23202b';
  ctx.fillRect(556, 380, 22, 52);
  circle(ctx, 567, 392, 8);
  ctx.fillStyle = alt.has('signal-colour') ? '#ff4d4d' : '#2ec4b6';
  ctx.fill();
  circle(ctx, 567, 416, 8);
  ctx.fillStyle = '#3a3a3a';
  ctx.fill();
  // Pigeons (one fewer altered).
  ctx.fillStyle = '#7a7a8a';
  const pigeons = [[220, 540], [260, 545], [360, 542]];
  for (let i = 0; i < pigeons.length; i += 1) {
    if (i === 2 && alt.has('pigeon-count')) continue;
    const [px, py] = pigeons[i];
    circle(ctx, px, py, 8);
    ctx.fill();
    circle(ctx, px + 8, py - 6, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + 12, py - 7);
    ctx.lineTo(px + 17, py - 5);
    ctx.lineTo(px + 12, py - 3);
    ctx.closePath();
    ctx.fillStyle = '#e8a13a';
    ctx.fill();
    ctx.fillStyle = '#7a7a8a';
  }
}

function drawPoster(ctx, x, y, bg, scene) {
  ctx.fillStyle = bg;
  rr(ctx, x, y, 90, 70, 6);
  ctx.fill();
  ctx.fillStyle = '#fff8e7';
  rr(ctx, x + 8, y + 8, 74, 54, 4);
  ctx.fill();
  if (scene === 'sun') {
    circle(ctx, x + 45, y + 32, 14);
    ctx.fillStyle = '#ff8c2e';
    ctx.fill();
  } else if (scene === 'moon') {
    circle(ctx, x + 45, y + 32, 14);
    ctx.fillStyle = '#f7d774';
    ctx.fill();
    circle(ctx, x + 51, y + 28, 11);
    ctx.fillStyle = '#fff8e7';
    ctx.fill();
  } else {
    ctx.fillStyle = '#2e86c1';
    ctx.fillRect(x + 8, y + 34, 74, 28);
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 44);
    ctx.lineTo(x + 45, y + 22);
    ctx.lineTo(x + 70, y + 44);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBench(ctx, x, y) {
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x, y, 110, 10);
  ctx.fillRect(x, y - 26, 110, 10);
  ctx.fillRect(x + 6, y + 10, 8, 34);
  ctx.fillRect(x + 96, y + 10, 8, 34);
  ctx.fillRect(x + 6, y - 26, 8, 36);
  ctx.fillRect(x + 96, y - 26, 8, 36);
}

const stationDiffs = [
  { id: 'clock-time', x: 305, y: 110, r: 36, label: 'The station clock shows a different time' },
  { id: 'board-time', x: 160, y: 430, r: 34, label: 'The departure time changed' },
  { id: 'poster-scene', x: 375, y: 415, r: 30, label: 'The poster changed from sun to moon' },
  { id: 'bench-count', x: 535, y: 470, r: 32, label: 'A bench is missing' },
  { id: 'suitcase-colour', x: 118, y: 500, r: 28, label: 'The suitcase changed colour' },
  { id: 'signal-colour', x: 567, y: 392, r: 18, label: 'The signal light changed colour' },
  { id: 'pigeon-count', x: 360, y: 542, r: 18, label: 'A pigeon flew away' },
  { id: 'train-window', x: 476, y: 217, r: 30, label: 'A train window went dark' },
];

// ---------------------------------------------------------------------------
// Scene 6 — Garden Greenhouse. Plants, a fountain, bees and butterflies.
// ---------------------------------------------------------------------------
function drawGreenhouse(ctx, alt) {
  skyGradient(ctx, [[0, '#aee3f5'], [0.5, '#d8f3dc'], [1, '#e9f5db']]);
  circle(ctx, 520, 70, 30);
  ctx.fillStyle = '#ffd94d';
  ctx.fill();
  ctx.strokeStyle = '#e8b13a';
  ctx.lineWidth = 4;
  const rayCount = alt.has('sun-rays') ? 6 : 8;
  for (let i = 0; i < rayCount; i += 1) {
    const a = (i * Math.PI * 2) / 8;
    ctx.beginPath();
    ctx.moveTo(520 + Math.cos(a) * 38, 70 + Math.sin(a) * 38);
    ctx.lineTo(520 + Math.cos(a) * 50, 70 + Math.sin(a) * 50);
    ctx.stroke();
  }
  // Greenhouse glass walls.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(30, 60, 550, 400);
  ctx.strokeStyle = '#5a7a4a';
  ctx.lineWidth = 5;
  ctx.strokeRect(30, 60, 550, 400);
  ctx.beginPath();
  ctx.moveTo(30, 60);
  ctx.lineTo(305, 20);
  ctx.lineTo(580, 60);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(120, 60);
  ctx.lineTo(120, 460);
  ctx.moveTo(220, 60);
  ctx.lineTo(220, 460);
  ctx.moveTo(390, 60);
  ctx.lineTo(390, 460);
  ctx.moveTo(490, 60);
  ctx.lineTo(490, 460);
  ctx.stroke();
  // Hanging planters.
  for (let i = 0; i < 3; i += 1) {
    const hx = 90 + i * 90;
    ctx.strokeStyle = '#5a7a4a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hx, 60);
    ctx.lineTo(hx, 110);
    ctx.stroke();
    ctx.fillStyle = '#c96f4a';
    ctx.beginPath();
    ctx.moveTo(hx - 22, 110);
    ctx.lineTo(hx + 22, 110);
    ctx.lineTo(hx + 16, 136);
    ctx.lineTo(hx - 16, 136);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#58b368';
    circle(ctx, hx, 100, 16);
    ctx.fill();
  }
  // Fountain in the middle (splash on in the original only).
  ctx.fillStyle = '#8a8a8a';
  ctx.beginPath();
  ctx.ellipse(305, 400, 90, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7ec8e3';
  ctx.beginPath();
  ctx.ellipse(305, 396, 76, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(296, 330, 18, 66);
  ctx.beginPath();
  ctx.ellipse(305, 330, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!alt.has('fountain-splash')) {
    ctx.strokeStyle = '#7ec8e3';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i - 2) * 0.45;
      ctx.beginPath();
      ctx.moveTo(305, 322);
      ctx.quadraticCurveTo(305 + Math.cos(a) * 26, 322 + Math.sin(a) * 26, 305 + Math.cos(a) * 40, 322 + Math.sin(a) * 40);
      ctx.stroke();
    }
    circle(ctx, 305, 300, 6);
    ctx.fillStyle = '#7ec8e3';
    ctx.fill();
  }
  // Potted plants along the bottom (one pot missing altered).
  const potXs = [70, 150, 470, 545];
  for (let i = 0; i < potXs.length; i += 1) {
    if (i === 3 && alt.has('pot-count')) continue;
    const px = potXs[i];
    ctx.fillStyle = '#c96f4a';
    ctx.beginPath();
    ctx.moveTo(px - 20, 440);
    ctx.lineTo(px + 20, 440);
    ctx.lineTo(px + 15, 472);
    ctx.lineTo(px - 15, 472);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px, 440);
    ctx.lineTo(px, 410);
    ctx.moveTo(px, 424);
    ctx.lineTo(px - 14, 408);
    ctx.moveTo(px, 418);
    ctx.lineTo(px + 14, 402);
    ctx.stroke();
    ctx.fillStyle = i % 2 === 0 ? '#ff5d8f' : '#ffc53d';
    circle(ctx, px, 404, 7);
    ctx.fill();
  }
  // Butterflies (one fewer altered) and a bee (original only).
  drawButterfly(ctx, 180, 180, '#ff8c2e');
  drawButterfly(ctx, 420, 160, '#b388ff');
  if (!alt.has('butterfly-count')) drawButterfly(ctx, 250, 250, '#ff5d8f');
  if (!alt.has('bee-present')) {
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.ellipse(480, 280, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#23202b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(476, 273);
    ctx.lineTo(476, 287);
    ctx.moveTo(484, 273);
    ctx.lineTo(484, 287);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(478, 270, 7, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Stepping stones (one fewer altered).
  ctx.fillStyle = '#b8b0a0';
  const stones = [[180, 510], [250, 525], [320, 510], [390, 525], [450, 510]];
  for (let i = 0; i < stones.length; i += 1) {
    if (i === 2 && alt.has('stone-count')) continue;
    ctx.beginPath();
    ctx.ellipse(stones[i][0], stones[i][1], 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // The watering can by the fountain (original only).
  if (!alt.has('watering-can')) {
    ctx.fillStyle = '#2ec4b6';
    rr(ctx, 180, 420, 44, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#2ec4b6';
    ctx.beginPath();
    ctx.moveTo(224, 430);
    ctx.lineTo(248, 412);
    ctx.lineTo(248, 420);
    ctx.lineTo(224, 440);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2ec4b6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(178, 432, 10, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();
  }
  // Flower bed: one bloom changes colour.
  for (let i = 0; i < 5; i += 1) {
    const fx = 60 + i * 24;
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx, 500);
    ctx.lineTo(fx, 480);
    ctx.stroke();
    ctx.fillStyle = i === 2 && alt.has('flower-colour') ? '#ffc53d' : '#ff5d8f';
    circle(ctx, fx, 474, 8);
    ctx.fill();
    ctx.fillStyle = '#ffd94d';
    circle(ctx, fx, 474, 3);
    ctx.fill();
  }
  ground(ctx, 460, '#7a9a5a');
}

function drawButterfly(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x - 9, y, 10, 7, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 9, y, 10, 7, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#23202b';
  ctx.fillRect(x - 2, y - 8, 4, 16);
}

const greenhouseDiffs = [
  { id: 'butterfly-count', x: 250, y: 250, r: 22, label: 'A butterfly flew away' },
  { id: 'flower-colour', x: 108, y: 474, r: 18, label: 'A flower changed colour' },
  { id: 'fountain-splash', x: 305, y: 310, r: 30, label: 'The fountain stopped splashing' },
  { id: 'watering-can', x: 205, y: 430, r: 30, label: 'The watering can is gone' },
  { id: 'pot-count', x: 545, y: 440, r: 28, label: 'A potted plant is missing' },
  { id: 'sun-rays', x: 520, y: 70, r: 34, label: 'The sun lost some rays' },
  { id: 'bee-present', x: 480, y: 280, r: 20, label: 'The bee flew away' },
  { id: 'stone-count', x: 320, y: 510, r: 26, label: 'A stepping stone is missing' },
];

// ---------------------------------------------------------------------------
// The catalogue: six scenes, eight differences each, 48 in all.
// ---------------------------------------------------------------------------
export const SCENES = [
  { id: 'level1', number: 1, name: 'NIGHT MARKET', tagline: 'Lanterns, stalls and one sleepy cat', accent: '#ff5d8f', diffs: nightMarketDiffs, draw: drawNightMarket },
  { id: 'level2', number: 2, name: 'OLD LIBRARY', tagline: 'Books, a globe and a stern portrait', accent: '#c9a227', diffs: libraryDiffs, draw: drawLibrary },
  { id: 'level3', number: 3, name: 'HARBOUR AT DUSK', tagline: 'Lighthouse, boats and a jumping fish', accent: '#e8734a', diffs: harbourDiffs, draw: drawHarbour },
  { id: 'level4', number: 4, name: 'BAKERY KITCHEN', tagline: 'Cakes, jars and a chalkboard menu', accent: '#e8b4d6', diffs: bakeryDiffs, draw: drawBakery },
  { id: 'level5', number: 5, name: 'TRAIN STATION', tagline: 'Clocks, posters and pigeons', accent: '#2e86c1', diffs: stationDiffs, draw: drawStation },
  { id: 'level6', number: 6, name: 'GREENHOUSE GARDEN', tagline: 'Plants, a fountain and busy bees', accent: '#58b368', diffs: greenhouseDiffs, draw: drawGreenhouse },
];

export function sceneById(id) {
  return SCENES.find((scene) => scene.id === id) || SCENES[0];
}
