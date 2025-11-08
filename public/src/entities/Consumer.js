import { BaseEntity } from './BaseEntity.js';
import { recipes, resourceInfo } from '../data/recipes.js';
import { directionVectors, oppositeDirection, rotateDirection } from '../data/buildables.js';
import { Item } from './Item.js';

export class Consumer extends BaseEntity {
  constructor({ position, orientation = 'east', recipeId, color, extraInputOffsets = [] }) {
    super({ type: 'consumer', position, orientation, color: color || '#ff6f61' });
    this.recipeId = recipeId;
    this.progress = 0;
    this.buffer = {};
    this.extraInputOffsets = extraInputOffsets;
    this.speedMultiplier = 1;
    this.applyLevel();
  }

  receiveItem(item) {
    const recipe = recipes[this.recipeId];
    if (!recipe) {
      return false;
    }
    if (!recipe.input[item.type]) {
      return false;
    }
    this.buffer[item.type] = (this.buffer[item.type] || 0) + 1;
    return true;
  }

  update(dt, state) {
    const recipe = recipes[this.recipeId];
    if (!recipe) {
      return;
    }
    if (!this.hasIngredients(recipe)) {
      this.progress = 0;
      return;
    }
    this.progress += dt * (this.speedMultiplier || 1);
    if (this.progress >= recipe.duration) {
      this.progress = 0;
      Object.entries(recipe.input).forEach(([resource, amount]) => {
        this.buffer[resource] -= amount;
      });
      this.deliverOutputs(recipe, state);
    }
  }

  hasIngredients(recipe) {
    return Object.entries(recipe.input).every(
      ([resource, amount]) => (this.buffer[resource] || 0) >= amount,
    );
  }

  draw(ctx, tileSize) {
    super.draw(ctx, tileSize);
    if (this.progress <= 0) {
      return;
    }
    const px = this.position.x * tileSize + 4;
    const py = this.position.y * tileSize + tileSize - 6;
    const width = (tileSize - 8) * Math.min(1, this.progress / (recipes[this.recipeId]?.duration || 1));
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(px, py, width, 2);
  }

  deliverOutputs(recipe, state) {
    const mode = recipe.outputMode || 'inventory';
    Object.entries(recipe.output).forEach(([resource, amount]) => {
      if (mode === 'belt') {
        this.emitToBelt(resource, amount, state);
      } else {
        state.addResource(resource, amount);
      }
    });
  }

  emitToBelt(resource, amount, state) {
    const dir = directionVectors[this.orientation];
    if (!dir) {
      state.addResource(resource, amount);
      return;
    }
    const targetPos = {
      x: this.position.x + dir.x,
      y: this.position.y + dir.y,
    };
    const target = state.grid.get(targetPos.x, targetPos.y);
    const info = resourceInfo[resource] || {};
    const incomingDirection = oppositeDirection[this.orientation];
    for (let i = 0; i < amount; i += 1) {
      const item = new Item(resource, info.color);
      if (
        !target ||
        typeof target.receiveItem !== 'function' ||
        !target.receiveItem(item, incomingDirection)
      ) {
        state.addResource(resource, amount - i);
        break;
      }
    }
  }

  getIOMarkers() {
    const markers = this.getInputDirections().map((direction) => ({
      type: 'input',
      direction,
    }));
    const recipe = recipes[this.recipeId];
    if (recipe?.outputMode === 'belt') {
      markers.push({ type: 'output', direction: this.orientation });
    }
    return markers;
  }

  getInputDirections() {
    const directions = [oppositeDirection[this.orientation]];
    (this.extraInputOffsets || []).forEach((offset) => {
      const dir = rotateDirection(this.orientation, offset);
      if (dir) {
        directions.push(dir);
      }
    });
    return [...new Set(directions)];
  }

  applyLevel() {
    this.speedMultiplier = this.level >= 2 ? 2 : 1;
  }
}
