import { buildables } from '../data/buildables.js';
import { Conveyor } from './Conveyor.js';
import { Producer } from './Producer.js';
import { Consumer } from './Consumer.js';
import { Depot } from './Depot.js';

const constructors = {
  conveyor: (def, tile, orientation) =>
    new Conveyor({
      position: tile,
      orientation,
      speed: def.speed,
      color: def.color,
    }),
  producer: (def, tile, orientation) =>
    new Producer({
      position: tile,
      orientation,
      interval: def.interval,
      output: def.output,
      color: def.color,
    }),
  consumer: (def, tile, orientation) =>
    new Consumer({
      position: tile,
      orientation,
      recipeId: def.recipe,
      color: def.color,
    }),
  depot: (def, tile, orientation) =>
    new Depot({
      position: tile,
      orientation,
      color: def.color,
    }),
};

export function createEntityFromId(id, tile, orientation) {
  const def = buildables[id];
  if (!def) {
    return null;
  }
  const ctor = constructors[def.type];
  if (!ctor) {
    return null;
  }
  const entity = ctor(def, tile, orientation);
  entity.buildId = def.id;
  return entity;
}

export function entityToSnapshot(entity) {
  if (!entity?.buildId) {
    return null;
  }
  return {
    id: entity.buildId,
    x: entity.position.x,
    y: entity.position.y,
    orientation: entity.orientation,
  };
}
