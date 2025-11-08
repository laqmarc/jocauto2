import { Storage } from '../core/Storage.js';

export class PersistenceSystem {
  constructor(state, { autosaveInterval = 30 } = {}) {
    this.state = state;
    this.autosaveInterval = autosaveInterval;
    this.elapsed = 0;
  }

  init() {
    Storage.loadInto(this.state);
    if (this.state.debugPanel) {
      this.state.debugPanel.bindPersistenceControls({
        onSave: () => Storage.save(this.state),
        onReset: () => {
          Storage.clear();
          this.state.resetToDefaults();
        },
      });
    }
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.autosaveInterval) {
      this.elapsed = 0;
      Storage.save(this.state);
    }
  }
}
