import { TileGrid } from '../entities/TileGrid.js';
import { ResourcePanel } from '../ui/ResourcePanel.js';
import { DebugPanel } from '../ui/DebugPanel.js';
import { StatusPanel } from '../ui/StatusPanel.js';
import { ResourceTooltip } from '../ui/ResourceTooltip.js';
import { RecipePanel } from '../ui/RecipePanel.js';
import { ControlsPanel } from '../ui/ControlsPanel.js';
import { UpgradePanel } from '../ui/UpgradePanel.js';
import { TutorialPanel } from '../ui/TutorialPanel.js';
import { MobileToolbar } from '../ui/MobileToolbar.js';
import { resourceInfo } from '../data/recipes.js';
import { randomResourceField } from '../data/resourceField.js';

export class WorldState {
  constructor({ canvas, width, height, tileSize, viewWidth, viewHeight }) {
    this.canvas = canvas;
    this.canvasWrapper = document.getElementById('canvas-wrapper');
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.viewWidth = viewWidth ?? width;
    this.viewHeight = viewHeight ?? height;
    this.baseTileSize = tileSize;
    this.tileSize = tileSize;
    this.setCanvasResolution(tileSize);

    this.grid = new TileGrid(width, height);
    this.entities = new Set();
    this.conveyors = new Set();
    this.producers = new Set();
    this.consumers = new Set();
    this.depots = new Set();
    this.initialInventory = {
      iron_plate: 25,
      iron_ore: 0,
      copper_ore: 0,
      copper_plate: 0,
      copper_wire: 0,
      iron_gear: 0,
      circuit_board: 0,
      coal: 0,
      steel_plate: 0,
      advanced_circuit: 0,
      oil: 0,
      plastic: 0,
      quartz: 0,
      silicon: 0,
      processing_unit: 0,
    };
    this.inventory = { ...this.initialInventory };
    this.lastInventorySnapshot = { ...this.inventory };
    this.resourceRates = {};
    this.rateTimer = 0;
    this.rateInterval = 15;
    this.resetRateTracking();
    this.progression = {
      tier: 1,
      milestones: {
        tier2Unlocked: false,
        tier3Unlocked: false,
      },
    };
    this.events = new Map();
    this.hoverTile = null;
    this.placementPreview = null;
    this.lastDelta = 0;
    this.resourceField = [];
    this.resourceSeed = null;
    this.camera = { x: 0, y: 0 };

    this.panels = {
      resources: document.getElementById('resource-panel'),
      build: document.getElementById('build-panel'),
      controls: document.getElementById('controls-panel'),
      recipes: document.getElementById('recipe-panel'),
      upgrades: document.getElementById('upgrade-panel'),
      tutorial: document.getElementById('tutorial-panel'),
      touch: document.getElementById('mobile-toolbar'),
      status: document.getElementById('status-panel'),
      debug: document.getElementById('debug-panel'),
    };

    this.resourcePanel = new ResourcePanel(this, this.panels.resources);
    this.recipePanel = new RecipePanel(this.panels.recipes);
    this.controlsPanel = new ControlsPanel(this.panels.controls);
    this.upgradePanel = new UpgradePanel(this.panels.upgrades);
    this.tutorialPanel = new TutorialPanel(this.panels.tutorial);
    this.touchToolbar = new MobileToolbar(this, this.panels.touch);
    this.statusPanel = new StatusPanel(this.panels.status);
    this.debugPanel = new DebugPanel(this.panels.debug);
    const tooltipElement = document.getElementById('resource-tooltip');
    if (tooltipElement && this.canvasWrapper) {
      this.resourceTooltip = new ResourceTooltip(tooltipElement, this.canvasWrapper);
      this.resourceTooltip.bind(this);
    }
    this.initializeResourceField();
    this.handleResize = () => this.resizeToWrapper();
    window.addEventListener('resize', this.handleResize);
    this.resizeToWrapper();
    this.on('build:feedback', (payload) => this.statusPanel?.showFeedback(payload));
    this.refreshPanels();
  }

  setDelta(delta) {
    this.lastDelta = delta;
    this.rateTimer += delta;
    if (this.rateTimer >= this.rateInterval) {
      this.computeResourceRates(this.rateTimer);
      this.rateTimer = 0;
    }
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
    const x = Math.floor(px / this.tileSize) + this.camera.x;
    const y = Math.floor(py / this.tileSize) + this.camera.y;
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

  setCanvasResolution(tileSize) {
    const resolved = Math.max(12, tileSize);
    this.tileSize = resolved;
    this.canvas.width = Math.round(this.viewWidth * resolved);
    this.canvas.height = Math.round(this.viewHeight * resolved);
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;
  }

  resizeToWrapper() {
    if (!this.canvasWrapper) {
      this.setCanvasResolution(this.baseTileSize);
      return;
    }
    const wrapperWidth = this.canvasWrapper.clientWidth || (this.viewWidth * this.baseTileSize);
    const maxWidth = this.viewWidth * this.baseTileSize;
    const limitedWidth = Math.min(wrapperWidth, maxWidth);
    const tileSize = Math.max(36, Math.floor(limitedWidth / this.viewWidth));
    this.setCanvasResolution(tileSize || this.baseTileSize);
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
    } else if (entity.type === 'depot') {
      this.depots.add(entity);
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
    } else if (entity.type === 'depot') {
      this.depots.delete(entity);
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
    this.emit('inventory:add', {
      resource,
      amount,
      total: this.inventory[resource],
    });
  }

  consumeResource(resource, amount = 1) {
    if ((this.inventory[resource] || 0) < amount) {
      return false;
    }
    this.inventory[resource] -= amount;
    this.emit('inventory:remove', {
      resource,
      amount,
      total: this.inventory[resource],
    });
    return true;
  }

  setInventory(values = {}) {
    this.inventory = { ...this.initialInventory };
    Object.entries(values).forEach(([resource, amount]) => {
      this.inventory[resource] = amount;
    });
    this.resetRateTracking();
  }

  resetInventory() {
    this.inventory = { ...this.initialInventory };
    this.resetRateTracking();
  }

  resetProgression() {
    this.progression = {
      tier: 1,
      milestones: {
        tier2Unlocked: false,
        tier3Unlocked: false,
      },
    };
  }

  resetRateTracking() {
    this.lastInventorySnapshot = { ...this.inventory };
    this.resourceRates = {};
    this.rateTimer = 0;
  }

  setProgression(progress = null) {
    if (!progress) {
      this.resetProgression();
      return;
    }
    this.progression = {
      tier: progress.tier ?? 1,
      milestones: {
        tier2Unlocked: Boolean(progress.milestones?.tier2Unlocked),
        tier3Unlocked: Boolean(progress.milestones?.tier3Unlocked),
      },
    };
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
    this.resetProgression();
    this.initializeResourceField();
    this.resetRateTracking();
    this.refreshPanels();
  }

  unlockTier2() {
    if (this.progression.milestones.tier2Unlocked) {
      return;
    }
    this.progression.tier = 2;
    this.progression.milestones.tier2Unlocked = true;
    this.scatterResourceDeposits('coal', {
      clusters: Math.max(3, Math.round((this.width * this.height) * 0.012)),
      radius: 3,
      density: 0.55,
    });
    this.statusPanel?.showFeedback({
      valid: true,
      action: 'milestone',
      message: 'Milestone: 100 circuits! Vetes de carbó desbloquejades.',
    });
    this.resourcePanel?.refreshLegend();
    this.recipePanel?.render();
    this.refreshPanels();
    this.emit('tier:changed', { tier: this.progression.tier });
  }

  unlockTier3() {
    if (this.progression.milestones.tier3Unlocked) {
      return;
    }
    this.progression.tier = 3;
    this.progression.milestones.tier3Unlocked = true;
    this.scatterResourceDeposits('oil', {
      clusters: Math.max(2, Math.round((this.width * this.height) * 0.008)),
      radius: 4,
      density: 0.55,
    });
    this.scatterResourceDeposits('quartz', {
      clusters: Math.max(3, Math.round((this.width * this.height) * 0.01)),
      radius: 3,
      density: 0.6,
    });
    this.statusPanel?.showFeedback({
      valid: true,
      action: 'milestone',
      message: 'Milestone: 100 circuits avançats! Tier 3 desbloquejat amb petroli i quars.',
    });
    this.resourcePanel?.refreshLegend();
    this.recipePanel?.render();
    this.refreshPanels();
    this.emit('tier:changed', { tier: this.progression.tier });
  }

  scatterResourceDeposits(type, { clusters = 5, radius = 3, density = 0.5 } = {}) {
    for (let c = 0; c < clusters; c += 1) {
      const cx = Math.floor(Math.random() * this.width);
      const cy = Math.floor(Math.random() * this.height);
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const x = cx + dx;
          const y = cy + dy;
          if (!this.grid.inBounds(x, y)) {
            continue;
          }
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > radius) {
            continue;
          }
          const falloff = 1 - distance / (radius + 0.5);
          if (Math.random() < density * falloff) {
            const idx = this.resourceIndex(x, y);
            if (!this.resourceField[idx]) {
              this.resourceField[idx] = type;
            }
          }
        }
      }
    }
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0d161d';
    ctx.fillRect(0, 0, this.viewWidth * this.tileSize, this.viewHeight * this.tileSize);
    ctx.save();
    ctx.translate(-this.camera.x * this.tileSize, -this.camera.y * this.tileSize);
    this.drawResourceField();
    this.drawGrid();
    this.drawEntities();
    ctx.restore();
    this.drawHover();
  }

  drawResourceField() {
    if (!this.resourceField?.length) {
      return;
    }
    const ctx = this.ctx;
    ctx.globalAlpha = 0.35;
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const resource = this.resourceField[this.resourceIndex(x, y)];
        if (!resource) {
          continue;
        }
        const color = resourceInfo[resource]?.color || '#4b5961';
        ctx.fillStyle = color;
        if (resource === 'iron_ore' || resource === 'copper_ore' || resource === 'coal' || resource === 'quartz') {
          ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
          ctx.globalAlpha = 0.6;
          if (resource === 'iron_ore') {
            ctx.strokeStyle = '#f2f2f2';
          } else if (resource === 'copper_ore') {
            ctx.strokeStyle = '#ffb347';
          } else if (resource === 'quartz') {
            ctx.strokeStyle = '#dfe6e9';
          } else {
            ctx.strokeStyle = '#6b7280';
            ctx.setLineDash([4, 3]);
          }
          ctx.lineWidth = 2;
          ctx.strokeRect(
            x * this.tileSize + 3,
            y * this.tileSize + 3,
            this.tileSize - 6,
            this.tileSize - 6,
          );
          ctx.setLineDash([]);
          ctx.globalAlpha = 0.35;
        } else {
          ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = '#15222c';
    ctx.lineWidth = 1;
    const startX = Math.floor(this.camera.x);
    const endX = Math.ceil(this.camera.x + this.viewWidth);
    const startY = Math.floor(this.camera.y);
    const endY = Math.ceil(this.camera.y + this.viewHeight);
    const top = this.camera.y * this.tileSize;
    const bottom = (this.camera.y + this.viewHeight) * this.tileSize;
    const left = this.camera.x * this.tileSize;
    const right = (this.camera.x + this.viewWidth) * this.tileSize;
    for (let x = startX; x <= endX; x += 1) {
      const px = x * this.tileSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, top);
      ctx.lineTo(px, bottom);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y += 1) {
      const py = y * this.tileSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(left, py);
      ctx.lineTo(right, py);
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
    const screenX = (tile.x - this.camera.x) * this.tileSize;
    const screenY = (tile.y - this.camera.y) * this.tileSize;
    if (screenX < -this.tileSize || screenY < -this.tileSize) {
      return;
    }
    if (screenX > this.canvas.width || screenY > this.canvas.height) {
      return;
    }
    const color = preview
      ? preview.valid
        ? 'rgba(74, 222, 128, 0.45)'
        : 'rgba(248, 113, 113, 0.45)'
      : 'rgba(153, 209, 255, 0.35)';
    ctx.fillStyle = color;
    ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
    ctx.strokeStyle = preview
      ? preview.valid
        ? '#4ade80'
        : '#f87171'
      : '#99d1ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX + 1, screenY + 1, this.tileSize - 2, this.tileSize - 2);
  }

  panCamera(dx, dy) {
    if (this.viewWidth >= this.width && this.viewHeight >= this.height) {
      return;
    }
    const maxX = Math.max(0, this.width - this.viewWidth);
    const maxY = Math.max(0, this.height - this.viewHeight);
    this.camera.x = Math.max(0, Math.min(maxX, this.camera.x + dx));
    this.camera.y = Math.max(0, Math.min(maxY, this.camera.y + dy));
  }

  computeResourceRates(elapsed) {
    if (!elapsed) {
      return;
    }
    const rates = {};
    const snapshot = this.lastInventorySnapshot || {};
    Object.keys(this.inventory).forEach((resource) => {
      const prev = snapshot[resource] ?? 0;
      const curr = this.inventory[resource] ?? 0;
      rates[resource] = (curr - prev) / elapsed;
      snapshot[resource] = curr;
    });
    this.resourceRates = rates;
  }

  getResourceRate(resource) {
    return this.resourceRates[resource] || 0;
  }
}
