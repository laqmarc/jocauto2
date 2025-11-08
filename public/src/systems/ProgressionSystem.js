export class ProgressionSystem {
  constructor(state) {
    this.state = state;
    this.tier2Target = 100;
    this.unlocked = false;
  }

  init() {
    this.state.on('inventory:add', (payload) => this.onInventoryAdd(payload));
    this.checkMilestones();
  }

  update() {
    // progression is event-driven
  }

  onInventoryAdd({ resource }) {
    if (resource === 'circuit_board') {
      this.checkMilestones();
    }
  }

  checkMilestones() {
    if (this.state.progression?.milestones?.tier2Unlocked) {
      return;
    }
    const totalCircuits = this.state.inventory.circuit_board || 0;
    if (totalCircuits >= this.tier2Target) {
      this.state.unlockTier2?.();
    }
  }
}
