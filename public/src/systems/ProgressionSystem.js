export class ProgressionSystem {
  constructor(state) {
    this.state = state;
    this.tier2Target = 100;
    this.tier3Target = 100;
  }

  init() {
    this.state.on('inventory:add', (payload) => this.onInventoryAdd(payload));
    this.checkMilestones();
  }

  update() {
    // progression is event-driven
  }

  onInventoryAdd({ resource }) {
    if (resource === 'circuit_board' || resource === 'advanced_circuit') {
      this.checkMilestones();
    }
  }

  checkMilestones() {
    if (!this.state.progression?.milestones?.tier2Unlocked) {
      const totalCircuits = this.state.inventory.circuit_board || 0;
      if (totalCircuits >= this.tier2Target) {
        this.state.unlockTier2?.();
      }
      return;
    }
    if (!this.state.progression?.milestones?.tier3Unlocked) {
      const totalAdv = this.state.inventory.advanced_circuit || 0;
      if (totalAdv >= this.tier3Target) {
        this.state.unlockTier3?.();
      }
    }
  }
}
