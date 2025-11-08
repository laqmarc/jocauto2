import { directionVectors } from '../data/buildables.js';

const iconCache = new Map();

function loadIcon(src) {
  if (!src) {
    return null;
  }
  if (iconCache.has(src)) {
    return iconCache.get(src);
  }
  const img = new Image();
  img.src = src;
  iconCache.set(src, img);
  return img;
}

export class BaseEntity {
  constructor({ type, position, orientation = 'east', color = '#4da1ff' }) {
    this.type = type;
    this.position = { x: position.x, y: position.y };
    this.orientation = orientation;
    this.color = color;
    this.level = 1;
    this.tier = 1;
  }

  draw(ctx, tileSize) {
    const px = this.position.x * tileSize;
    const py = this.position.y * tileSize;
    ctx.fillStyle = this.color;
    ctx.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8);
    this.drawPorts(ctx, tileSize);
    this.drawIcon(ctx, tileSize);
    if ((this.tier || 1) >= 2) {
      this.drawTierBadge(ctx, tileSize);
    }
    if ((this.level || 1) >= 2) {
      this.drawLevelBadge(ctx, tileSize);
    }
  }

  drawPorts(ctx, tileSize) {
    const ports = this.getIOMarkers();
    if (!ports?.length) {
      return;
    }
    for (const port of ports) {
      this.drawPort(ctx, tileSize, port);
    }
  }

  drawPort(ctx, tileSize, port) {
    const { direction, type } = port;
    const vector = directionVectors[direction];
    if (!vector) {
      return;
    }
    const centerX = this.position.x * tileSize + tileSize / 2 + vector.x * (tileSize / 2 - 6);
    const centerY = this.position.y * tileSize + tileSize / 2 + vector.y * (tileSize / 2 - 6);
    const size = 6;

    if (type === 'input' || type === 'input-secondary') {
      ctx.save();
      ctx.fillStyle = type === 'input' ? 'rgba(248, 181, 129, 0.9)' : 'rgba(248, 181, 129, 0.45)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = type === 'input' ? 'rgba(209, 116, 50, 0.9)' : 'rgba(209, 116, 50, 0.45)';
      ctx.stroke();
      ctx.restore();
      this.drawIOLabel(ctx, centerX, centerY, 'I');
    } else {
      ctx.save();
      ctx.translate(centerX, centerY);
      const angle = Math.atan2(vector.y, vector.x);
      ctx.rotate(angle);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.9)';
      ctx.beginPath();
      ctx.moveTo(-size / 2, size / 2);
      ctx.lineTo(-size / 2, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(30, 150, 70, 0.9)';
      ctx.stroke();
      ctx.restore();
      this.drawIOLabel(ctx, centerX, centerY, 'O');
    }
  }

  getIOMarkers() {
    return [];
  }

  drawIcon(ctx, tileSize) {
    if (!this.icon) {
      return;
    }
    const image = loadIcon(this.icon);
    if (!image?.complete) {
      return;
    }
    const size = tileSize * 0.55;
    const x = this.position.x * tileSize + (tileSize - size) / 2;
    const y = this.position.y * tileSize + (tileSize - size) / 2;
    ctx.drawImage(image, x, y, size, size);
  }

  drawTierBadge(ctx, tileSize) {
    const px = this.position.x * tileSize;
    const py = this.position.y * tileSize;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 196, 64, 0.5)';
    ctx.strokeStyle = 'rgba(255, 220, 120, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + tileSize - 6, py + 6);
    ctx.lineTo(px + tileSize - 6, py + tileSize - 6);
    ctx.lineTo(px + 6, py + tileSize - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawLevelBadge(ctx, tileSize) {
    const px = this.position.x * tileSize + tileSize - 27;
    const py = this.position.y * tileSize + 4;
    ctx.save();
    ctx.fillStyle = '#0f1c24';
    ctx.fillRect(px, py, 10, 10);
    ctx.strokeStyle = '#4ade80';
    ctx.strokeRect(px, py, 10, 10);
    ctx.fillStyle = '#4ade80';
    ctx.font = '8px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2', px + 5, py + 5);
    ctx.restore();
  }

  drawIOLabel(ctx, x, y, letter) {
    ctx.save();
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(0, 0);
    ctx.scale(1, 1);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = '#000';
    ctx.strokeText(letter, x, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(letter, x, y);
    ctx.restore();
  }
}
