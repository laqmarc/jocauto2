import { TileGrid } from '../entities/TileGrid.js';
import { ResourcePanel } from '../ui/ResourcePanel.js';
import { DebugPanel } from '../ui/DebugPanel.js';
import { StatusPanel } from '../ui/StatusPanel.js';
import { ResourceTooltip } from '../ui/ResourceTooltip.js';
import { RecipePanel } from '../ui/RecipePanel.js';
import { resourceInfo } from '../data/recipes.js';
import { randomResourceField } from '../data/resourceField.js';

export class WorldState {
  constructor({ canvas, width, height, tileSize }) {
    this.canvas = canvas;
    this.canvasWrapper = document.getElementById('canvas-wrapper');
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.canvas.width = width * tileSize;
    this.canvas.height = height * tileSize;

    this.grid = new TileGrid(width, height);
    this.entities = new Set();
    this.conveyors = new Set();
    this.producers = new Set();
    this.consumers = new Set();
    this.initialInventory = {
      iron_plate: 25,
      iron_ore: 0,
      copper_ore: 0,
      copper_plate: 0,
      copper_wire: 0,
      iron_gear: 0,
      circuit_board: 0,
    };
    this.inventory = { ...this.initialInventory };
    this.events = new Map();
    this.hoverTile = null;
    this.placementPreview = null;
    this.lastDelta = 0;
    this.resourceField = [];
    this.resourceSeed = null;

    this.panels = {
      resources: document.getElementById('resource-panel'),
      build: document.getElementById('build-panel'),
      recipes: document.getElementById('recipe-panel'),
      status: document.getElementById('status-panel'),
      debug: document.getElementById('debug-panel'),
    };

    this.resourcePanel = new ResourcePanel(this.panels.resources);
    this.recipePanel = new RecipePanel(this.panels.recipes);
    this.statusPanel = new StatusPanel(this.panels.status);
    this.debugPanel = new DebugPanel(this.panels.debug);
    const tooltipElement = document.getElementById('resource-tooltip');
    if (tooltipElement && this.canvasWrapper) {
      this.resourceTooltip = new ResourceTooltip(tooltipElement, this.canvasWrapper);
      this.resourceTooltip.bind(this);
    }
    this.initializeResourceField();
    this.on('build:feedback', (payload) => this.statusPanel?.showFeedback(payload));
    this.refreshPanels();
  }

  setDelta(delta) {
    this.lastDelta = delta;
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(handler);
  }

  off(event, handler) {
    const handlers = this.events.get(event);
    if (!handlers) {
      return;
    }
    handlers.delete(handler);
  }

  emit(event, payload) {
    const handlers = this.events.get(event);
    if (!handlers) {
      return;
    }
    handlers.forEach((handler) => handler(payload));
  }

  tileFromPointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const x = Math.floor(px / this.tileSize);
    const y = Math.floor(py / this.tileSize);
    if (!this.grid.inBounds(x, y)) {
      return null;
    }
    return { x, y };
  }

  setHoverTile(tile) {
    this.hoverTile = tile;
  }

  setPlacementPreview(preview) {
    this.placementPreview = preview;
  }

  clearPlacementPreview() {
    this.placementPreview = null;
  }

  addEntity(entity) {
    if (!this.grid.place(entity.position.x, entity.position.y, entity)) {
      return false;
    }
    entity.state = this;
    this.entities.add(entity);
    if (entity.type === 'conveyor') {
      this.conveyors.add(entity);
    } else if (entity.type === 'producer') {
      this.producers.add(entity);
    } else if (entity.type === 'consumer') {
      this.consumers.add(entity);
    }
    return true;
  }

  removeEntity(entity) {
    this.entities.delete(entity);
    if (entity.type === 'conveyor') {
      this.conveyors.delete(entity);
    } else if (entity.type === 'producer') {
      this.producers.delete(entity);
    } else if (entity.type === 'consumer') {
      this.consumers.delete(entity);
    }
    this.grid.clear(entity.position.x, entity.position.y, entity);
    entity.state = null;
  }

  removeEntityAt(tile) {
    const entity = this.grid.get(tile.x, tile.y);
    if (!entity) {
      return null;
    }
    this.removeEntity(entity);
    return entity;
  }

  canAfford(cost = null) {
    if (!cost) {
      return true;
    }
    return Object.entries(cost).every(
      ([resource, amount]) => (this.inventory[resource] || 0) >= amount,
    );
  }

  spend(cost = null) {
    if (!cost || !this.canAfford(cost)) {
      return false;
    }
    Object.entries(cost).forEach(([resource, amount]) => {
      this.inventory[resource] -= amount;
    });
    return true;
  }

  refund(cost = null) {
    if (!cost) {
      return;
    }
    Object.entries(cost).forEach(([resource, amount]) => {
      this.addResource(resource, amount);
    });
  }

  addResource(resource, amount = 1) {
    this.inventory[resource] = (this.inventory[resource] || 0) + amount;
  }

  setInventory(values = {}) {
    this.inventory = { ...this.initialInventory };
    Object.entries(values).forEach(([resource, amount]) => {
      this.inventory[resource] = amount;
    });
  }

  resetInventory() {
    this.inventory = { ...this.initialInventory };
  }

  clearEntities() {
    const existing = Array.from(this.entities);
    existing.forEach((entity) => this.removeEntity(entity));
    this.grid = new TileGrid(this.width, this.height);
    this.hoverTile = null;
  }

  resetToDefaults() {
    this.clearEntities();
    this.resetInventory();
    this.initializeResourceField();
    this.refreshPanels();
  }

  initializeResourceField(snapshot = null) {
    if (snapshot?.field && snapshot.field.length === this.width * this.height) {
      this.resourceField = [...snapshot.field];
      this.resourceSeed = snapshot.seed ?? null;
      return;
    }
    const generated = randomResourceField(this.width, this.height);
    this.resourceField = generated.field;
    this.resourceSeed = generated.seed;
  }

  getResourceSnapshot() {
    return {
      seed: this.resourceSeed,
      field: [...this.resourceField],
    };
  }

  resourceIndex(x, y) {
    return y * this.width + x;
  }

  getResourceAt(tile, maybeY) {
    const coords = typeof tile === 'object' ? tile : { x: tile, y: maybeY };
    if (!coords || !this.grid.inBounds(coords.x, coords.y)) {
      return null;
    }
    return this.resourceField[this.resourceIndex(coords.x, coords.y)];
  }

  setResourceAt(x, y, type) {
    if (!this.grid.inBounds(x, y)) {
      return;
    }
    this.resourceField[this.resourceIndex(x, y)] = type;
  }

  refreshPanels() {
    if (this.resourcePanel) {
      this.resourcePanel.update(this.inventory);
    }
    if (this.debugPanel) {
      const movingItems = Array.from(this.conveyors).reduce(
        (acc, conveyor) => acc + (conveyor.item ? 1 : 0),
        0,
      );
      this.debugPanel.update({
        fps: this.lastDelta ? 1 / this.lastDelta : 0,
        entities: this.entities.size,
        conveyors: this.conveyors.size,
        items: movingItems,
      });
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0d161d';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawResourceField();
    this.drawGrid();
    this.drawEntities();
    this.drawHover();
  }

  drawResourceField() {
    if (!this.resourceField?.length) {
      return;
    }
    const ctx = this.ctx;
    ctx.globalAlpha = 0.2;
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const resource = this.resourceField[this.resourceIndex(x, y)];
        if (!resource) {
          continue;
        }
        const color = resourceInfo[resource]?.color || '#4b5961';
        ctx.fillStyle = color;
        ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }
    ctx.globalAlpha = 1;
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = '#15222c';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.width; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * this.tileSize + 0.5, 0);
      ctx.lineTo(x * this.tileSize + 0.5, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.height; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.tileSize + 0.5);
      ctx.lineTo(this.canvas.width, y * this.tileSize + 0.5);
      ctx.stroke();
    }
  }

  drawEntities() {
    for (const entity of this.entities) {
      if (typeof entity.draw === 'function') {
        entity.draw(this.ctx, this.tileSize);
      }
    }
  }

  drawHover() {
    const preview = this.placementPreview;
    const tile = preview?.tile || this.hoverTile;
    if (!tile) {
      return;
    }
    const ctx = this.ctx;
    const color = preview
      ? preview.valid
        ? 'rgba(74, 222, 128, 0.45)'
        : 'rgba(248, 113, 113, 0.45)'
      : 'rgba(153, 209, 255, 0.35)';
    ctx.fillStyle = color;
    ctx.fillRect(
      tile.x * this.tileSize,
      tile.y * this.tileSize,
      this.tileSize,
      this.tileSize,
    );
    ctx.strokeStyle = preview
      ? preview.valid
        ? '#4ade80'
        : '#f87171'
      : '#99d1ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      tile.x * this.tileSize + 1,
      tile.y * this.tileSize + 1,
      this.tileSize - 2,
      this.tileSize - 2,
    );
  }
}
