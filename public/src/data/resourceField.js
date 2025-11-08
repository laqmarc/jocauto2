function mulberry32(seed) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomResourceField(width, height, seed = Math.floor(Math.random() * 1e9)) {
  const rng = mulberry32(seed);
  const field = new Array(width * height).fill(null);
  const deposits = [
    { type: 'iron_ore', clusters: Math.ceil((width * height) * 0.015), radius: 3, density: 0.6 },
    { type: 'copper_ore', clusters: Math.ceil((width * height) * 0.012), radius: 3, density: 0.55 },
  ];

  deposits.forEach((deposit) => {
    for (let c = 0; c < deposit.clusters; c += 1) {
      const cx = Math.floor(rng() * width);
      const cy = Math.floor(rng() * height);
      paintCluster(field, width, height, cx, cy, deposit, rng);
    }
  });

  return { field, seed };
}

function paintCluster(field, width, height, cx, cy, deposit, rng) {
  const { radius, density, type } = deposit;
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > radius) {
        continue;
      }
      const falloff = 1 - distance / (radius + 0.5);
      if (rng() < density * falloff) {
        field[y * width + x] = type;
      }
    }
  }
}
