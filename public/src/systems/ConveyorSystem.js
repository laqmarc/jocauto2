import { directionVectors } from '../data/buildables.js';

export class ConveyorSystem {
  constructor(state) {
    this.state = state;
  }

  update(dt) {
    for (const conveyor of this.state.conveyors) {
      if (!conveyor.item) {
        continue;
      }
      conveyor.progress += dt * conveyor.speed;
      if (conveyor.progress >= 1) {
        this.transfer(conveyor);
      }
    }
  }

  transfer(conveyor) {
    const dir = directionVectors[conveyor.orientation];
    if (!dir) {
      conveyor.progress = 0;
      return;
    }
    const nextPos = {
      x: conveyor.position.x + dir.x,
      y: conveyor.position.y + dir.y,
    };
    const next = this.state.grid.get(nextPos.x, nextPos.y);
    if (next && typeof next.receiveItem === 'function') {
      const success = next.receiveItem(conveyor.item);
      if (success) {
        conveyor.clearItem();
        return;
      }
    }
    conveyor.progress = 1;
  }
}
