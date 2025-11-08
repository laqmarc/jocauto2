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
    requiredTier: 1,
    icon: 'assets/conveyor.svg',
  },
  {
    id: 'depot',
    type: 'depot',
    label: 'Diposit',
    color: '#7cd67b',
    cost: { iron_plate: 4 },
    requiredTier: 1,
    icon: 'assets/depot.svg',
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
    requiredTier: 1,
    icon: 'assets/iron_miner.svg',
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
    requiredTier: 1,
    icon: 'assets/copper_miner.svg',
  },
  {
    id: 'iron_furnace',
    type: 'consumer',
    label: 'Forn de ferro',
    recipe: 'iron_plate',
    color: '#ff6f61',
    cost: { iron_plate: 10 },
    requiredTier: 1,
    icon: 'assets/iron_furnace.svg',
  },
  {
    id: 'copper_furnace',
    type: 'consumer',
    label: 'Forn de coure',
    recipe: 'copper_plate',
    color: '#ffab76',
    cost: { iron_plate: 10 },
    requiredTier: 1,
    icon: 'assets/copper_furnace.svg',
  },
  {
    id: 'wire_drawer',
    type: 'consumer',
    label: 'Filadora',
    recipe: 'copper_wire',
    color: '#ffb347',
    cost: { iron_plate: 10, copper_plate: 6 },
    requiredTier: 1,
    icon: 'assets/wire_drawer.svg',
  },
  {
    id: 'gear_press',
    type: 'consumer',
    label: "Premsa d'engranatges",
    recipe: 'iron_gear',
    color: '#7c9bb5',
    cost: { iron_plate: 14 },
    requiredTier: 1,
    icon: 'assets/gear_press.svg',
  },
  {
    id: 'circuit_assembler',
    type: 'consumer',
    label: 'Assembler de circuits',
    recipe: 'circuit_board',
    color: '#52d8b2',
    cost: { iron_plate: 18, copper_wire: 6 },
    extraInputOffsets: [1, -1],
    requiredTier: 1,
    icon: 'assets/circuit_assembler.svg',
  },
  {
    id: 'coal_miner',
    type: 'producer',
    label: 'Miner de carbó',
    output: 'coal',
    interval: 2,
    color: '#3a4450',
    cost: { iron_plate: 18, circuit_board: 4 },
    requiresResource: 'coal',
    requiredTier: 2,
    icon: 'assets/coal_miner.svg',
  },
  {
    id: 'oil_pumpjack',
    type: 'producer',
    label: 'Bomba de petroli',
    output: 'oil',
    interval: 2.4,
    color: '#2d3436',
    cost: { steel_plate: 20, advanced_circuit: 6 },
    requiresResource: 'oil',
    requiredTier: 3,
    icon: '',
  },
  {
    id: 'quartz_miner',
    type: 'producer',
    label: 'Miner de quars',
    output: 'quartz',
    interval: 2.2,
    color: '#dfe6e9',
    cost: { steel_plate: 18, advanced_circuit: 4 },
    requiresResource: 'quartz',
    requiredTier: 3,
    icon: '',
  },
  {
    id: 'steel_forge',
    type: 'consumer',
    label: "Farga d'acer",
    recipe: 'steel_plate',
    color: '#8c9faa',
    cost: { iron_plate: 20, coal: 5 },
    requiredTier: 2,
    extraInputOffsets: [1, -1],
    icon: 'assets/steel_forge.svg',
  },
  {
    id: 'advanced_assembler',
    type: 'consumer',
    label: 'Assembler avançat',
    recipe: 'advanced_circuit',
    color: '#34d399',
    cost: { steel_plate: 10, circuit_board: 5 },
    requiredTier: 2,
    extraInputOffsets: [1, -1],
    icon: 'assets/advanced_assembler.svg',
  },
  {
    id: 'plastic_refinery',
    type: 'consumer',
    label: 'Refineria de plàstic',
    recipe: 'plastic',
    color: '#f5cd79',
    cost: { steel_plate: 16, advanced_circuit: 4, coal: 5 },
    requiredTier: 3,
    extraInputOffsets: [1, -1],
    icon: '',
  },
  {
    id: 'silicon_crystallizer',
    type: 'consumer',
    label: 'Cristal·litzador de silici',
    recipe: 'silicon',
    color: '#b2bec3',
    cost: { steel_plate: 14, advanced_circuit: 4, quartz: 4 },
    requiredTier: 3,
    extraInputOffsets: [1, -1],
    icon: '',
  },
  {
    id: 'processing_assembler',
    type: 'consumer',
    label: 'Assembler de processadors',
    recipe: 'processing_unit',
    color: '#6c5ce7',
    cost: { plastic: 4, silicon: 4, advanced_circuit: 6 },
    requiredTier: 3,
    extraInputOffsets: [1, -1],
    icon: '',
  },
];

export const buildables = buildableList.reduce((acc, def) => {
  acc[def.id] = def;
  return acc;
}, {});
