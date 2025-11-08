import { buildables } from '../data/buildables.js';

function multiplyCost(cost = {}, factor = 1) {
  const result = {};
  Object.entries(cost).forEach(([resource, amount]) => {
    result[resource] = (result[resource] || 0) + amount * factor;
  });
  return result;
}

function mergeCosts(...costs) {
  const result = {};
  costs.forEach((cost) => {
    Object.entries(cost || {}).forEach(([resource, amount]) => {
      result[resource] = (result[resource] || 0) + amount;
    });
  });
  return result;
}

export class UpgradeSystem {
  constructor(state) {
    this.state = state;
  }

  init() {
    this.state.on('input:upgrade', ({ tile }) => this.upgradeAt(tile));
  }

  update() {
    // upgrades are event-driven
  }

  upgradeAt(tile) {
    if (!tile) {
      return;
    }
    const entity = this.state.grid.get(tile.x, tile.y);
    if (!entity) {
      this.notify(false, 'No hi ha cap edifici per millorar');
      return;
    }
    if (!entity.buildId) {
      this.notify(false, 'Aquest objecte no es pot millorar');
      return;
    }
    if ((entity.level || 1) >= 2) {
      this.notify(false, 'Ja és nivell 2');
      return;
    }

    const plan = this.getUpgradePlan(entity);
    if (!plan) {
      this.notify(false, 'Millora no disponible per a aquest edifici');
      return;
    }

    if (!this.state.canAfford(plan.cost)) {
      this.notify(false, 'Recursos insuficients per millorar');
      return;
    }

    this.state.spend(plan.cost);
    entity.level = 2;
    if (typeof entity.applyLevel === 'function') {
      entity.applyLevel();
    } else if (plan.apply) {
      plan.apply(entity);
    }
    this.notify(true, `${plan.label} millorat a nivell 2`);
  }

  getUpgradePlan(entity) {
    const def = buildables[entity.buildId];
    if (!def) {
      return null;
    }

    const label = def.label || entity.buildId;
    if (def.id === 'conveyor') {
      return {
        cost: { steel_plate: 1, advanced_circuit: 1 },
        label,
      };
    }

    if (['iron_miner', 'copper_miner'].includes(def.id)) {
      return {
        cost: mergeCosts(multiplyCost(def.cost, 2), { advanced_circuit: 5 }),
        label,
      };
    }

    if (['iron_furnace', 'copper_furnace'].includes(def.id)) {
      return {
        cost: mergeCosts(multiplyCost(def.cost, 2), { advanced_circuit: 5 }),
        label,
      };
    }

    if ((def.requiredTier || 1) >= 2) {
      return {
        cost: mergeCosts(multiplyCost(def.cost, 2), { advanced_circuit: 10 }),
        label,
      };
    }

    return null;
  }

  notify(success, message) {
    this.state.statusPanel?.showFeedback({
      valid: success,
      action: 'upgrade',
      reason: success ? null : message,
      message: success ? message : null,
    });
  }
}
