import { BaseEntity } from './BaseEntity.js';
import { directionOrder, directionVectors, oppositeDirection } from '../data/buildables.js';
import { Item } from './Item.js';
import { resourceInfo } from '../data/recipes.js';

export class Depot extends BaseEntity {
  constructor({ position, orientation = 'east', color }) {
    super({
      type: 'depot',
      position,
      orientation,
      color: color || '#7cd67b',
    });
    this.outputResource = null;
    this.outputTimer = 0;
    this.interval = 1.5;
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
    if (this.outputResource) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        resourceInfo[this.outputResource]?.label?.slice(0, 3) || this.outputResource.slice(0, 3),
        this.position.x * tileSize + tileSize / 2,
        py + 14,
      );
    }
  }

  getIOMarkers() {
    const markers = directionOrder.map((direction) => ({ type: 'input', direction }));
    markers.push({ type: 'output', direction: this.orientation });
    return markers;
  }

  cycleOutputResource(resources) {
    if (!resources?.length) {
      this.outputResource = null;
      return;
    }
    const currentIndex = resources.indexOf(this.outputResource);
    const nextIndex = (currentIndex + 1) % resources.length;
    this.outputResource = resources[nextIndex];
  }

  update(dt) {
    if (!this.outputResource || !this.state) {
      return;
    }
    this.outputTimer += dt;
    if (this.outputTimer < this.interval) {
      return;
    }
    this.outputTimer = 0;
    if (!this.state.consumeResource(this.outputResource, 1)) {
      return;
    }
    const dir = directionVectors[this.orientation];
    if (!dir) {
      return;
    }
    const targetPos = {
      x: this.position.x + dir.x,
      y: this.position.y + dir.y,
    };
    const target = this.state.grid.get(targetPos.x, targetPos.y);
    const item = new Item(this.outputResource, resourceInfo[this.outputResource]?.color);
    if (target && typeof target.receiveItem === 'function') {
      const success = target.receiveItem(item, oppositeDirection[this.orientation]);
      if (!success) {
        this.state.addResource(this.outputResource, 1);
      }
    } else {
      this.state.addResource(this.outputResource, 1);
    }
  }
}
