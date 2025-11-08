export const resourceInfo = {
  iron_ore: {
    label: 'Mineral de ferro',
    color: '#c26d2c',
    isField: true,
    icon: '⛏️',
  },
  iron_plate: {
    label: 'Planxa de ferro',
    color: '#f2f2f2',
    icon: '⬜',
  },
  copper_ore: {
    label: 'Mineral de coure',
    color: '#c2843b',
    isField: true,
    icon: '🟠',
  },
  copper_plate: {
    label: 'Planxa de coure',
    color: '#ffbb71',
    icon: '🟧',
  },
  copper_wire: {
    label: 'Fil de coure',
    color: '#ffa260',
    icon: '〰️',
  },
  iron_gear: {
    label: 'Engranatge',
    color: '#d9e0eb',
    icon: '⚙️',
  },
  circuit_board: {
    label: 'Circuit',
    color: '#8ff0c8',
    icon: '🟩',
  },
  coal: {
    label: 'Carbó',
    color: '#3c3c3c',
    isField: true,
    icon: '🪨',
  },
  steel_plate: {
    label: 'Planxa d\'acer',
    color: '#bcc7d3',
    icon: '⬛',
  },
  advanced_circuit: {
    label: 'Circuit avançat',
    color: '#c084fc',
    icon: '🔷',
  },
  oil: {
    label: 'Petroli',
    color: '#1f2a38',
    isField: true,
    icon: '🛢️',
  },
  plastic: {
    label: 'Plàstic',
    color: '#f7f1e3',
    icon: '🧪',
  },
  quartz: {
    label: 'Quars',
    color: '#dfe6e9',
    isField: true,
    icon: '💎',
  },
  silicon: {
    label: 'Silici',
    color: '#b2bec3',
    icon: '🔹',
  },
  processing_unit: {
    label: 'Unitat de processament',
    color: '#6c5ce7',
    icon: '🟪',
  },
};

export const recipes = {
  iron_plate: {
    input: { iron_ore: 2 },
    output: { iron_plate: 1 },
    duration: 3,
    outputMode: 'belt',
  },
  copper_plate: {
    input: { copper_ore: 2 },
    output: { copper_plate: 1 },
    duration: 3,
    outputMode: 'belt',
  },
  copper_wire: {
    input: { copper_plate: 1 },
    output: { copper_wire: 2 },
    duration: 2.5,
    outputMode: 'belt',
  },
  iron_gear: {
    input: { iron_plate: 2 },
    output: { iron_gear: 1 },
    duration: 2.5,
    outputMode: 'belt',
  },
  circuit_board: {
    input: { copper_wire: 2, iron_plate: 1 },
    output: { circuit_board: 1 },
    duration: 5,
    outputMode: 'inventory',
  },
  steel_plate: {
    input: { iron_plate: 1, coal: 1 },
    output: { steel_plate: 1 },
    duration: 4,
    outputMode: 'belt',
  },
  advanced_circuit: {
    input: { circuit_board: 1, steel_plate: 1 },
    output: { advanced_circuit: 1 },
    duration: 6,
    outputMode: 'inventory',
  },
  plastic: {
    input: { oil: 2, coal: 1 },
    output: { plastic: 1 },
    duration: 5,
    outputMode: 'belt',
  },
  silicon: {
    input: { quartz: 2 },
    output: { silicon: 1 },
    duration: 4,
    outputMode: 'belt',
  },
  processing_unit: {
    input: { plastic: 1, silicon: 1, advanced_circuit: 1 },
    output: { processing_unit: 1 },
    duration: 7,
    outputMode: 'inventory',
  },
};
