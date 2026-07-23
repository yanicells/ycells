import type { Facing } from "./math";

export function drawArena(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shakeX: number,
  shakeY: number,
): void {
  ctx.save();
  ctx.translate(shakeX, shakeY);

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#050506");
  g.addColorStop(0.45, "#08080a");
  g.addColorStop(1, "#0e0c0a");
  ctx.fillStyle = g;
  ctx.fillRect(-20, -20, w + 40, h + 40);

  const horizon = h * 0.42;
  const groundGrad = ctx.createLinearGradient(0, horizon, 0, h);
  groundGrad.addColorStop(0, "#161412");
  groundGrad.addColorStop(1, "#0a0908");
  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(w, horizon);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(42, 38, 34, 0.9)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    const y = horizon + (h - horizon) * t * t;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const vanishingX = w * 0.5;
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue;
    const edgeX = vanishingX + i * (w * 0.18);
    ctx.beginPath();
    ctx.moveTo(vanishingX, horizon);
    ctx.lineTo(edgeX, h);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(196, 168, 130, 0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  ctx.restore();
}

export function drawSahur(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  facing: Facing,
  bob: number,
  wobble: number,
  hitFlash: number,
): void {
  const baseW = 72;
  const baseH = 96;
  let drawW = baseW;
  let drawH = baseH;
  let flipX = 1;
  let skew = 0;
  let alpha = 1;
  let filter = "none";

  if (facing === "left") {
    flipX = -1;
    skew = wobble * 0.04;
  } else if (facing === "right") {
    flipX = 1;
    skew = -wobble * 0.04;
  } else if (facing === "back") {
    drawW = baseW * 0.88;
    drawH = baseH * 0.92;
    filter = "saturate(0.55) brightness(0.82)";
    alpha = 0.92;
  } else {
    skew = wobble * 0.02;
  }

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.transform(flipX, 0, skew, 1, 0, 0);
  ctx.globalAlpha = alpha;
  if (filter !== "none") ctx.filter = filter;

  if (hitFlash > 0) {
    ctx.filter = `brightness(${1 + hitFlash * 2}) saturate(${1 + hitFlash})`;
  }

  ctx.drawImage(img, -drawW / 2, -drawH, drawW, drawH);

  ctx.restore();

  // soft shadow on ground
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + 4, drawW * 0.28, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export type ObstacleKind = "bat" | "cylinder" | "block";

export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  kind: ObstacleKind,
  x: number,
  y: number,
  w: number,
  h: number,
  pulse: number,
): void {
  ctx.save();
  if (kind === "bat") {
    ctx.fillStyle = `rgba(40, 36, 32, ${0.75 + pulse * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(196, 168, 130, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.45);
    ctx.quadraticCurveTo(x + w * 0.25, y, x + w * 0.5, y + h * 0.35);
    ctx.quadraticCurveTo(x + w * 0.75, y, x + w, y + h * 0.45);
    ctx.stroke();
  } else if (kind === "cylinder") {
    const r = w / 2;
    const bodyH = h - r;
    ctx.fillStyle = "#1a1612";
    ctx.fillRect(x, y + r * 0.5, w, bodyH);
    ctx.beginPath();
    ctx.ellipse(x + r, y + r * 0.5, r, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#2a241c";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + r, y + bodyH + r * 0.5, r, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#12100e";
    ctx.fill();
    ctx.strokeStyle = "rgba(138, 115, 96, 0.45)";
    ctx.strokeRect(x, y + r * 0.5, w, bodyH);
  } else {
    ctx.fillStyle = `rgba(18, 16, 14, ${0.85 + pulse * 0.1})`;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(196, 92, 74, 0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.strokeStyle = "rgba(196, 168, 130, 0.2)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();
  }
  ctx.restore();
}
