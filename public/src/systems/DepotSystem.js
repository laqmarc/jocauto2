export class DepotSystem {
  constructor(state) {
    this.state = state;
  }

  init() {
    this.state.on('input:cycle-depot', (payload) => this.onCycleRequest(payload));
  }

  update(dt) {
    for (const depot of this.state.depots) {
      depot.update?.(dt);
    }
  }

  onCycleRequest({ tile }) {
    if (!tile) {
      return;
    }
    const entity = this.state.grid.get(tile.x, tile.y);
    if (!entity || entity.type !== 'depot') {
      return;
    }
    const available = Object.entries(this.state.inventory)
      .filter(([, amount]) => amount > 0)
      .map(([resource]) => resource);
    if (!available.length) {
      entity.outputResource = null;
      this.state.statusPanel?.showFeedback({
        valid: false,
        reason: 'Inventari buit',
      });
      return;
    }
    entity.cycleOutputResource(available);
    const label = entity.outputResource || 'Cap';
    this.state.statusPanel?.showFeedback({
      valid: true,
      action: 'depot',
      message: `Dipòsit set a ${label}`,
    });
  }
}
