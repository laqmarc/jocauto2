export class Engine {
  constructor(state) {
    this.state = state;
    this.systems = [];
    this.running = false;
    this.lastTime = 0;
    this._tick = this._tick.bind(this);
  }

  registerSystem(system) {
    this.systems.push(system);
    if (typeof system.init === 'function') {
      system.init();
    }
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
  }

  _tick(now) {
    if (!this.running) {
      return;
    }

    const delta = Math.min((now - this.lastTime) / 1000, 0.25);
    this.lastTime = now;
    this.state.setDelta(delta);

    for (const system of this.systems) {
      if (typeof system.update === 'function') {
        system.update(delta);
      }
    }

    this.state.refreshPanels();
    this.state.render();
    requestAnimationFrame(this._tick);
  }
}
