import { buildables } from '../data/buildables.js';
import { recipes } from '../data/recipes.js';

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
      parts.push(`Tier: ${entity.tier || def?.requiredTier || 1}`);
      parts.push(`Nivell: ${entity.level || 1}`);
      parts.push(`Orientació: ${entity.orientation || 'est'}`);
      if (entity.type === 'conveyor') {
        parts.push(`Entrada actual: ${entity.inputDirection}`);
      }
      if (def?.recipe) {
        const recipe = recipes[def.recipe];
        if (recipe) {
          const inputText = Object.entries(recipe.input)
            .map(([res, amount]) => `${amount}× ${res}`)
            .join(', ');
          const outputText = Object.entries(recipe.output)
            .map(([res, amount]) => `${amount}× ${res}`)
            .join(', ');
          parts.push(`Consum: ${inputText}`);
          parts.push(`Producció: ${outputText}`);
          parts.push(`Durada: ${recipe.duration}s`);
        }
      } else if (def?.output) {
        parts.push(`Producció: ${def.output}`);
        parts.push(`Interval: ${entity.baseInterval || entity.interval || 'n/d'}s`);
      }
      if (def?.cost) {
        const costText = Object.entries(def.cost)
          .map(([res, amount]) => `${amount}× ${res}`)
          .join(', ');
        parts.push(`Cost construcció: ${costText}`);
      }
      if (entity.type === 'depot') {
        parts.push(`Dipòsit sortida: ${entity.outputResource || 'Inventari'}`);
      }
      if (def?.requiresResource) {
        parts.push(`Necessita veta: ${def.requiresResource}`);
      }
    } else {
      parts.push('Entitat: (buida)');
    }
    this.state.statusPanel?.showFeedback({
      valid: true,
      action: 'inspect',
      message: parts.join('\n'),
    });
  }
}
