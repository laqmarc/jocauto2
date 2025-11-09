const TOUCH_MODES = new Set(['build', 'remove', 'inspect']);

export class InputSystem {
  constructor(state) {
    this.state = state;
    this.pointerInfo = new Map();
    this.longPressDelay = 450;
    this.dragThreshold = 12;
    this.touchMode = 'build';
  }

  init() {
    this.handlePointerMove = this.onPointerMove.bind(this);
    this.handlePointerDown = this.onPointerDown.bind(this);
    this.handlePointerUp = this.onPointerUp.bind(this);
    this.handlePointerLeave = this.onPointerLeave.bind(this);
    this.handleKeyDown = this.onKeyDown.bind(this);
    this.handleTouchMode = (payload) => this.setTouchMode(payload?.mode);

    this.state.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.state.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.state.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.state.canvas.addEventListener('pointercancel', this.handlePointerUp);
    this.state.canvas.addEventListener('pointerleave', this.handlePointerLeave);
    this.state.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    window.addEventListener('keydown', this.handleKeyDown);
    this.state.on('touch:mode', this.handleTouchMode);
  }

  update() {
    // Event-driven
  }

  updateHover(event) {
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
    return tile;
  }

  onPointerMove(event) {
    this.updateHover(event);
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      this.handleTouchDrag(event);
    }
  }

  onPointerDown(event) {
    event.preventDefault();
    if (typeof this.state.canvas.setPointerCapture === 'function') {
      try {
        this.state.canvas.setPointerCapture(event.pointerId);
      } catch {
        // noop – some browsers throw if capture fails
      }
    }
    const tile = this.updateHover(event);
    if (!tile) {
      return;
    }
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      this.trackTouchStart(event, tile);
      return;
    }
    if (event.button === 0) {
      this.state.emit('input:place', { tile, originalEvent: event });
    } else if (event.button === 2) {
      this.state.emit('input:remove', { tile, originalEvent: event });
    }
  }

  onPointerUp(event) {
    if (typeof this.state.canvas.releasePointerCapture === 'function') {
      try {
        this.state.canvas.releasePointerCapture(event.pointerId);
      } catch {
        // ignore
      }
    }
    const info = this.pointerInfo.get(event.pointerId);
    if (info) {
      this.finishTouch(event, info);
      this.pointerInfo.delete(event.pointerId);
    }
  }

  onPointerLeave() {
    this.pointerInfo.forEach((info) => {
      if (info.longPressTimer) {
        clearTimeout(info.longPressTimer);
      }
    });
    this.pointerInfo.clear();
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
    } else if (key === 'u') {
      if (this.state.hoverTile) {
        this.state.emit('input:upgrade', { tile: this.state.hoverTile });
      }
    } else if (key === 'i') {
      if (this.state.hoverTile) {
        this.state.emit('input:inspect', { tile: this.state.hoverTile });
      }
    } else if (key === 'e') {
      if (this.state.hoverTile) {
        this.state.emit('input:rotate-entity', { tile: this.state.hoverTile });
      }
    } else if (['w', 'a', 's', 'd'].includes(key)) {
      this.handleCameraPan(key);
    }
  }

  handleCameraPan(key) {
    const delta = {
      w: { x: 0, y: -1 },
      a: { x: -1, y: 0 },
      s: { x: 0, y: 1 },
      d: { x: 1, y: 0 },
    }[key];
    if (!delta) {
      return;
    }
    this.state.panCamera(delta.x, delta.y);
  }

  setTouchMode(mode) {
    if (!mode || !TOUCH_MODES.has(mode)) {
      return;
    }
    this.touchMode = mode;
  }

  trackTouchStart(event, tile) {
    const info = {
      pointerId: event.pointerId,
      startTile: tile,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      dragging: false,
      longPressTriggered: false,
    };
    if (this.touchMode === 'build') {
      info.longPressTimer = setTimeout(() => {
        info.longPressTriggered = true;
        this.emitRemove(tile, event);
      }, this.longPressDelay);
    }
    this.pointerInfo.set(event.pointerId, info);
  }

  handleTouchDrag(event) {
    const info = this.pointerInfo.get(event.pointerId);
    if (!info) {
      return;
    }
    const deltaX = event.clientX - info.lastX;
    const deltaY = event.clientY - info.lastY;
    const distance = Math.hypot(event.clientX - info.startX, event.clientY - info.startY);
    if (!info.dragging && distance > this.dragThreshold) {
      info.dragging = true;
      if (info.longPressTimer) {
        clearTimeout(info.longPressTimer);
        info.longPressTimer = null;
      }
    }
    if (info.dragging) {
      this.panCameraFromDrag(deltaX, deltaY);
    }
    info.lastX = event.clientX;
    info.lastY = event.clientY;
  }

  panCameraFromDrag(deltaX, deltaY) {
    if (!deltaX && !deltaY) {
      return;
    }
    const tileSize = this.state.tileSize || 1;
    const dxTiles = -deltaX / tileSize;
    const dyTiles = -deltaY / tileSize;
    this.state.panCamera(dxTiles, dyTiles);
  }

  finishTouch(event, info) {
    if (info.longPressTimer) {
      clearTimeout(info.longPressTimer);
    }
    if (info.longPressTriggered || info.dragging) {
      return;
    }
    const tile = this.state.tileFromPointer(event) || info.startTile;
    if (!tile) {
      return;
    }
    if (this.touchMode === 'remove') {
      this.emitRemove(tile, event);
      return;
    }
    if (this.touchMode === 'inspect') {
      this.state.emit('input:inspect', { tile, originalEvent: event });
      return;
    }
    this.state.emit('input:place', { tile, originalEvent: event });
  }

  emitRemove(tile, event) {
    this.state.emit('input:remove', { tile, originalEvent: event });
  }
}
