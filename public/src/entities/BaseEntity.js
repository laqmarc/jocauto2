import { directionVectors } from '../data/buildables.js';

export class BaseEntity {
  constructor({ type, position, orientation = 'east', color = '#4da1ff' }) {
    this.type = type;
    this.position = { x: position.x, y: position.y };
    this.orientation = orientation;
    this.color = color;
  }

  draw(ctx, tileSize) {
    const px = this.position.x * tileSize;
    const py = this.position.y * tileSize;
    ctx.fillStyle = this.color;
    ctx.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8);
    this.drawPorts(ctx, tileSize);
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

    ctx.save();
    if (type === 'input') {
      ctx.fillStyle = 'rgba(248, 181, 129, 0.9)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(209, 116, 50, 0.9)';
      ctx.stroke();
    } else {
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
    }
    ctx.restore();
  }

  getIOMarkers() {
    return [];
  }
}
