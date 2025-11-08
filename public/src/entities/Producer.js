import { BaseEntity } from './BaseEntity.js';

export class Producer extends BaseEntity {
  constructor({ position, orientation = 'east', interval = 2, output, color }) {
    super({ type: 'producer', position, orientation, color: color || '#f7b733' });
    this.baseInterval = interval;
    this.interval = interval;
    this.output = output;
    this.timer = 0;
    this.applyLevel();
  }

  draw(ctx, tileSize) {
    super.draw(ctx, tileSize);
    const px = this.position.x * tileSize;
    const py = this.position.y * tileSize;
    ctx.strokeStyle = '#22140c';
    ctx.strokeRect(px + 6, py + 6, tileSize - 12, tileSize - 12);
  }

  getIOMarkers() {
    return [{ type: 'output', direction: this.orientation }];
  }

  applyLevel() {
    const multiplier = this.level >= 2 ? 0.5 : 1;
    this.interval = this.baseInterval * multiplier;
  }
}
