import { BaseEntity } from './BaseEntity.js';
import { directionOrder } from '../data/buildables.js';

export class Depot extends BaseEntity {
  constructor({ position, orientation = 'east', color }) {
    super({
      type: 'depot',
      position,
      orientation,
      color: color || '#7cd67b',
    });
  }

  receiveItem(item) {
    if (!item || !this.state) {
      return false;
    }
    this.state.addResource(item.type, 1);
    return true;
  }

  draw(ctx, tileSize) {
    super.draw(ctx, tileSize);
    const px = this.position.x * tileSize;
    const py = this.position.y * tileSize;
    ctx.strokeStyle = '#123312';
    ctx.strokeRect(px + 8, py + 8, tileSize - 16, tileSize - 16);
  }

  getIOMarkers() {
    return directionOrder.map((direction) => ({ type: 'input', direction }));
  }
}
