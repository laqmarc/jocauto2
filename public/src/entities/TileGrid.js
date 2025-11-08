export class TileGrid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = new Array(width * height).fill(null);
  }

  index(x, y) {
    return y * this.width + x;
  }

  inBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  get(x, y) {
    if (!this.inBounds(x, y)) {
      return null;
    }
    return this.cells[this.index(x, y)];
  }

  place(x, y, entity) {
    if (!this.inBounds(x, y)) {
      return false;
    }
    if (this.get(x, y)) {
      return false;
    }
    this.cells[this.index(x, y)] = entity;
    return true;
  }

  clear(x, y, entity) {
    if (!this.inBounds(x, y)) {
      return;
    }
    const idx = this.index(x, y);
    if (this.cells[idx] === entity) {
      this.cells[idx] = null;
    }
  }
}
