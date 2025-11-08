export const directionOrder = ['north', 'east', 'south', 'west'];

export const directionVectors = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

export const oppositeDirection = {
  north: 'south',
  east: 'west',
  south: 'north',
  west: 'east',
};

export function rotateDirection(baseDirection, offset = 0) {
  const index = directionOrder.indexOf(baseDirection);
  if (index === -1) {
    return baseDirection;
  }
  const normalized = (index + offset + directionOrder.length * 10) % directionOrder.length;
  return directionOrder[normalized];
}

export const directionLabels = {
  north: 'Nord',
  east: 'Est',
  south: 'Sud',
  west: 'Oest',
};

export const buildableList = [
  {
    id: 'conveyor',
    type: 'conveyor',
    label: 'Cinta',
    speed: 2,
    color: '#5ac8fa',
    cost: { iron_plate: 1 },
  },
  {
    id: 'depot',
    type: 'depot',
    label: 'Diposit',
    color: '#7cd67b',
    cost: { iron_plate: 4 },
  },
  {
    id: 'iron_miner',
    type: 'producer',
    label: 'Miner de ferro',
    output: 'iron_ore',
    interval: 1.8,
    color: '#f7b733',
    cost: { iron_plate: 12 },
    requiresResource: 'iron_ore',
  },
  {
    id: 'copper_miner',
    type: 'producer',
    label: 'Miner de coure',
    output: 'copper_ore',
    interval: 2.1,
    color: '#ffcc80',
    cost: { iron_plate: 12 },
    requiresResource: 'copper_ore',
  },
  {
    id: 'iron_furnace',
    type: 'consumer',
    label: 'Forn de ferro',
    recipe: 'iron_plate',
    color: '#ff6f61',
    cost: { iron_plate: 10 },
  },
  {
    id: 'copper_furnace',
    type: 'consumer',
    label: 'Forn de coure',
    recipe: 'copper_plate',
    color: '#ffab76',
    cost: { iron_plate: 10 },
  },
  {
    id: 'wire_drawer',
    type: 'consumer',
    label: 'Filadora',
    recipe: 'copper_wire',
    color: '#ffb347',
    cost: { iron_plate: 10, copper_plate: 6 },
  },
  {
    id: 'gear_press',
    type: 'consumer',
    label: "Premsa d'engranatges",
    recipe: 'iron_gear',
    color: '#7c9bb5',
    cost: { iron_plate: 14 },
  },
  {
    id: 'circuit_assembler',
    type: 'consumer',
    label: 'Assembler de circuits',
    recipe: 'circuit_board',
    color: '#52d8b2',
    cost: { iron_plate: 18, copper_wire: 6 },
    extraInputOffsets: [1, -1],
  },
];

export const buildables = buildableList.reduce((acc, def) => {
  acc[def.id] = def;
  return acc;
}, {});
