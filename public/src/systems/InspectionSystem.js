import { buildables } from '../data/buildables.js';

export class InspectionSystem {
  constructor(state) {
    this.state = state;
  }

  init() {
    this.state.on('input:inspect', ({ tile }) => this.inspect(tile));
  }

  update() {
    // Event-driven
  }

  inspect(tile) {
    if (!tile) {
      return;
    }
    const entity = this.state.grid.get(tile.x, tile.y);
    const parts = [`Casella (${tile.x}, ${tile.y})`];
    const resource = this.state.getResourceAt(tile);
    if (resource) {
      parts.push(`Veta: ${resource}`);
    }
    if (entity) {
      const def = entity.buildId ? buildables[entity.buildId] : null;
      const label = def?.label || entity.type;
      parts.push(`Entitat: ${label}`);
      if (entity.type === 'depot' && entity.outputResource) {
        parts.push(`Dipòsit sortida: ${entity.outputResource}`);
      }
      if (entity.type === 'conveyor') {
        parts.push(`Cinta entrada: ${entity.inputDirection}, sortida: ${entity.orientation}`);
      }
    } else {
      parts.push('Entitat: (buit)');
    }
    this.state.statusPanel?.showFeedback({
      valid: true,
      action: 'inspect',
      message: parts.join(' · '),
    });
  }
}
