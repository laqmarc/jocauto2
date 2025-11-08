import { BaseEntity } from './BaseEntity.js';
import { directionVectors, oppositeDirection } from '../data/buildables.js';

export class Conveyor extends BaseEntity {
  constructor({ position, orientation = 'east', speed = 1, color }) {
    super({ type: 'conveyor', position, orientation, color: color || '#5ac8fa' });
    this.speed = speed;
    this.item = null;
    this.progress = 0;
  }

  receiveItem(item) {
    if (this.item) {
      return false;
    }
    this.item = item;
    this.progress = 0;
    return true;
  }

  clearItem() {
    this.item = null;
    this.progress = 0;
  }

  draw(ctx, tileSize) {
    super.draw(ctx, tileSize);
    this.drawArrow(ctx, tileSize);
    if (this.item) {
      this.drawItem(ctx, tileSize);
    }
  }

  drawArrow(ctx, tileSize) {
    const dir = directionVectors[this.orientation] || { x: 1, y: 0 };
    const centerX = this.position.x * tileSize + tileSize / 2;
    const centerY = this.position.y * tileSize + tileSize / 2;
    const length = tileSize / 2 - 6;

    ctx.strokeStyle = '#0f2731';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - dir.x * length, centerY - dir.y * length);
    ctx.lineTo(centerX + dir.x * length, centerY + dir.y * length);
    ctx.stroke();
  }

  drawItem(ctx, tileSize) {
    const dir = directionVectors[this.orientation] || { x: 1, y: 0 };
    const centerX = this.position.x * tileSize + tileSize / 2;
    const centerY = this.position.y * tileSize + tileSize / 2;
    const offsetX = dir.x * (this.progress - 0.5) * (tileSize - 12);
    const offsetY = dir.y * (this.progress - 0.5) * (tileSize - 12);

    ctx.fillStyle = this.item.color || '#ffffff';
    ctx.fillRect(centerX + offsetX - 6, centerY + offsetY - 6, 12, 12);
  }

  getIOMarkers() {
    return [
      { type: 'input', direction: oppositeDirection[this.orientation] },
      { type: 'output', direction: this.orientation },
    ];
  }
}
