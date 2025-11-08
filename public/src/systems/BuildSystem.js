import {
  buildableList,
  buildables,
  directionOrder,
  directionLabels,
  rotateDirection,
  oppositeDirection,
} from '../data/buildables.js';
import { BuildMenu } from '../ui/BuildMenu.js';
import { createEntityFromId } from '../entities/EntityFactory.js';
import { resourceInfo } from '../data/recipes.js';

export class BuildSystem {
  constructor(state) {
    this.state = state;
    this.activeBuildId = buildableList[0]?.id ?? null;
    this.orientationIndex = 1;
    this.lastStatus = null;
    this.conveyorInputOffsets = [2, -1, 1]; // recte, esquerra, dreta
    this.conveyorInputIndex = 0;
  }

  init() {
    this.menu = new BuildMenu(this.state.panels.build, buildableList, {
      onSelect: (id) => this.setActiveBuild(id),
      getActive: () => this.activeBuildId,
      getStatus: (def) => this.getBuildStatus(def),
    });

    this.handlePlace = (payload) => this.placeAt(payload.tile);
    this.handleRemove = (payload) => this.removeAt(payload.tile);

    this.state.on('input:place', this.handlePlace);
    this.state.on('input:remove', this.handleRemove);
    this.state.on('input:rotate', () => this.rotate());
    this.state.on('input:cycle-conveyor', () => this.cycleConveyorInput());
    this.state.on('tier:changed', () => this.onTierChanged());
    this.state.on('input:rotate-entity', (payload) => this.rotateEntity(payload.tile));
    this.updateOrientationLabel();
  }

  update() {
    this.updatePlacementPreview();
  }

  updatePlacementPreview() {
    const tile = this.state.hoverTile;
    const def = buildables[this.activeBuildId];
    if (!tile || !def) {
      this.state.clearPlacementPreview();
      return;
    }
    const orientation = directionOrder[this.orientationIndex];
    const preview = this.evaluatePlacement(tile, def, orientation);
    this.state.setPlacementPreview(preview);
  }

  setActiveBuild(id) {
    this.activeBuildId = id;
    this.menu.highlightActive();
    this.updateOrientationLabel();
  }

  rotate() {
    this.orientationIndex = (this.orientationIndex + 1) % directionOrder.length;
    this.updateOrientationLabel();
  }

  cycleConveyorInput() {
    if (this.activeBuildId !== 'conveyor') {
      return;
    }
    this.conveyorInputIndex = (this.conveyorInputIndex + 1) % this.conveyorInputOffsets.length;
    this.updateOrientationLabel();
  }

  updateOrientationLabel() {
    const orientation = directionOrder[this.orientationIndex];
    let text = directionLabels[orientation] || orientation;
    if (this.activeBuildId === 'conveyor') {
      const inputDir = this.getConveyorInputDirection(orientation);
      text += ` - Entrada: ${directionLabels[inputDir] || inputDir}`;
    }
    this.menu.setOrientationLabel(text);
  }

  placeAt(tile) {
    if (!this.activeBuildId) {
      return;
    }
    const def = buildables[this.activeBuildId];
    if (!def) {
      return;
    }
    const orientation = directionOrder[this.orientationIndex];
    const overrides = {};
    if (def.type === 'conveyor') {
      overrides.inputDirection = this.getConveyorInputDirection(orientation);
    }
    const evaluation = this.evaluatePlacement(tile, def, orientation, overrides);
    this.state.setPlacementPreview(evaluation);
    if (!evaluation.valid) {
      this.lastStatus = evaluation;
      this.state.emit('build:feedback', evaluation);
      return;
    }
    const entity = createEntityFromId(def.id, tile, orientation, overrides);
    if (!entity) {
      return;
    }

    if (!this.state.addEntity(entity)) {
      return;
    }

    if (!this.state.spend(def.cost)) {
      this.state.removeEntity(entity);
      return;
    }

    this.lastStatus = {
      tile,
      def,
      valid: true,
      reason: null,
      cost: def.cost,
      orientation,
      overrides,
    };
    this.state.emit('build:feedback', this.lastStatus);
  }

  removeAt(tile) {
    const entity = this.state.removeEntityAt(tile);
    if (!entity) {
      this.state.emit('build:feedback', {
        tile,
        def: null,
        valid: false,
        reason: 'No hi ha cap estructura',
        action: 'remove',
      });
      return;
    }
    const def = buildables[entity.buildId];
    this.state.emit('build:feedback', {
      tile,
      def,
      valid: true,
      action: 'remove',
      message: `${def?.label || 'Estructura'} eliminada`,
    });
  }

  evaluatePlacement(tile, def, orientation, overrides = {}) {
    if (!tile || !def) {
      return null;
    }
    const result = {
      tile,
      def,
      orientation,
      cost: def.cost,
      valid: true,
      reason: null,
    };
    if (!this.state.grid.inBounds(tile.x, tile.y)) {
      result.valid = false;
      result.reason = 'Fora del mapa';
      return result;
    }
    if (this.state.grid.get(tile.x, tile.y)) {
      result.valid = false;
      result.reason = 'Casella ocupada';
      return result;
    }
    if (def.requiresResource) {
      const resource = this.state.getResourceAt(tile);
      if (resource !== def.requiresResource) {
        result.valid = false;
        const label = resourceInfo[def.requiresResource]?.label || def.requiresResource;
        result.reason = `Necessita veta de ${label}`;
        return result;
      }
    }
    if (!this.state.canAfford(def.cost)) {
      result.valid = false;
      result.reason = 'Recursos insuficients';
      return result;
    }
    const requiredTier = def.requiredTier || 1;
    if ((this.state.progression?.tier || 1) < requiredTier) {
      result.valid = false;
      result.reason = `Necessita Tier ${requiredTier}`;
      return result;
    }
    if (def.type === 'conveyor' && overrides.inputDirection) {
      result.inputDirection = overrides.inputDirection;
    }
    return result;
  }

  getConveyorInputDirection(orientation) {
    const offset = this.conveyorInputOffsets[this.conveyorInputIndex] ?? 2;
    return rotateDirection(orientation, offset);
  }

  getBuildStatus(def) {
    const requiredTier = def.requiredTier || 1;
    const unlocked = (this.state.progression?.tier || 1) >= requiredTier;
    return {
      unlocked,
      reason: unlocked ? null : `Necessita Tier ${requiredTier}`,
    };
  }

  onTierChanged() {
    this.menu.render();
    this.menu.highlightActive();
    this.updateOrientationLabel();
  }

  rotateEntity(tile) {
    if (!tile) {
      return;
    }
    const entity = this.state.grid.get(tile.x, tile.y);
    if (!entity) {
      this.state.statusPanel?.showFeedback({
        valid: false,
        reason: 'No hi ha cap edifici per girar',
      });
      return;
    }
    const def = buildables[entity.buildId];
    if (!def) {
      return;
    }
    const currentIndex = directionOrder.indexOf(entity.orientation || 'east');
    const nextOrientation = directionOrder[(currentIndex + 1) % directionOrder.length];
    entity.orientation = nextOrientation;
    if (entity.type === 'conveyor') {
      if (entity.manualInputDirection && entity.inputDirection) {
        entity.inputDirection = rotateDirection(entity.inputDirection, 1);
      } else {
        entity.inputDirection = oppositeDirection[nextOrientation];
      }
    }
    if (typeof entity.onRotated === 'function') {
      entity.onRotated();
    }
    this.state.statusPanel?.showFeedback({
      valid: true,
      action: 'rotate-entity',
      message: `${def.label} girat cap a ${directionLabels[nextOrientation] || nextOrientation}`,
    });
  }
}
