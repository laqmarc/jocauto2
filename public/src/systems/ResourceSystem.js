import { Item } from '../entities/Item.js';
import { resourceInfo } from '../data/recipes.js';
import { directionVectors, oppositeDirection } from '../data/buildables.js';

export class ResourceSystem {
  constructor(state) {
    this.state = state;
  }

  update(dt) {
    for (const producer of this.state.producers) {
      producer.timer += dt;
      if (producer.timer >= producer.interval) {
        producer.timer -= producer.interval;
        this.outputFromProducer(producer);
      }
    }

    for (const consumer of this.state.consumers) {
      consumer.update(dt, this.state);
    }
  }

  outputFromProducer(producer) {
    const info = resourceInfo[producer.output] || {};
    const item = new Item(producer.output, info.color);
    const dir = directionVectors[producer.orientation];
    if (!dir) {
      this.state.addResource(producer.output, 1);
      return;
    }
    const nextPos = {
      x: producer.position.x + dir.x,
      y: producer.position.y + dir.y,
    };
    const recipient = this.state.grid.get(nextPos.x, nextPos.y);
    if (recipient && typeof recipient.receiveItem === 'function') {
      if (recipient.receiveItem(item, oppositeDirection[producer.orientation])) {
        return;
      }
    }
    this.state.addResource(producer.output, 1);
  }
}
