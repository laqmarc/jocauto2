export class InputSystem {
  constructor(state) {
    this.state = state;
  }

  init() {
    this.handlePointerMove = this.onPointerMove.bind(this);
    this.handlePointerDown = this.onPointerDown.bind(this);
    this.handlePointerLeave = this.onPointerLeave.bind(this);
    this.handleKeyDown = this.onKeyDown.bind(this);

    this.state.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.state.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.state.canvas.addEventListener('pointerleave', this.handlePointerLeave);
    this.state.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    window.addEventListener('keydown', this.handleKeyDown);
  }

  update() {
    // Input is event-driven; no per-frame work needed yet.
  }

  onPointerMove(event) {
    const tile = this.state.tileFromPointer(event);
    this.state.setHoverTile(tile);
    const rect = this.state.canvas.getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const resource = tile ? this.state.getResourceAt(tile) : null;
    const entity = tile ? this.state.grid.get(tile.x, tile.y) : null;
    this.state.emit('hover:resource', {
      tile,
      resource,
      entity,
      offset,
    });
  }

  onPointerDown(event) {
    event.preventDefault();
    const tile = this.state.tileFromPointer(event);
    if (!tile) {
      return;
    }
    if (event.button === 0) {
      this.state.emit('input:place', { tile, originalEvent: event });
    } else if (event.button === 2) {
      this.state.emit('input:remove', { tile, originalEvent: event });
    }
  }

  onPointerLeave() {
    this.state.setHoverTile(null);
    this.state.emit('hover:resource', null);
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (key === 'r') {
      this.state.emit('input:rotate');
    } else if (key === 'f') {
      this.state.emit('input:cycle-conveyor');
    } else if (key === 'q') {
      if (this.state.hoverTile) {
        this.state.emit('input:cycle-depot', { tile: this.state.hoverTile });
      }
    } else if (key === 'i') {
      if (this.state.hoverTile) {
        this.state.emit('input:inspect', { tile: this.state.hoverTile });
      }
    }
  }
}
