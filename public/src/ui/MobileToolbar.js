export class MobileToolbar {
  constructor(state, container) {
    this.state = state;
    this.container = container;
    if (!this.container) {
      return;
    }
    this.modes = [
      { id: 'build', label: 'Construir', mode: 'build' },
      { id: 'remove', label: 'Eliminar', mode: 'remove' },
      { id: 'inspect', label: 'Info', mode: 'inspect' },
    ];
    this.actions = [
      {
        id: 'rotate',
        label: 'Orientació',
        handler: () => this.state.emit('input:rotate'),
      },
      {
        id: 'belt',
        label: 'Entrada cinta',
        handler: () => this.state.emit('input:cycle-conveyor'),
      },
      {
        id: 'rotate-entity',
        label: 'Gira edifici',
        handler: () => this.emitWithTile('input:rotate-entity'),
      },
      {
        id: 'depot',
        label: 'Dipòsit',
        handler: () => this.emitWithTile('input:cycle-depot'),
      },
      {
        id: 'upgrade',
        label: 'Millora',
        handler: () => this.emitWithTile('input:upgrade'),
      },
    ];
    this.render();
  }

  render() {
    this.container.classList.add('mobile-toolbar');
    const modeRow = document.createElement('div');
    modeRow.className = 'toolbar-row toolbar-row--modes';
    this.modeButtons = new Map();
    this.modes.forEach((modeDef) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = modeDef.label;
      button.dataset.mode = modeDef.mode;
      button.addEventListener('click', () => this.setMode(modeDef.mode));
      this.modeButtons.set(modeDef.mode, button);
      modeRow.appendChild(button);
    });

    const actionRow = document.createElement('div');
    actionRow.className = 'toolbar-row toolbar-row--actions';
    this.actions.forEach((action) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action.label;
      button.addEventListener('click', () => action.handler());
      actionRow.appendChild(button);
    });

    this.container.replaceChildren(modeRow, actionRow);
    this.setMode('build');
  }

  setMode(mode) {
    this.state.emit('touch:mode', { mode });
    this.modeButtons.forEach((button, id) => {
      button.classList.toggle('is-active', id === mode);
    });
  }

  emitWithTile(eventName) {
    const tile = this.state.hoverTile;
    if (!tile) {
      this.state.statusPanel?.showFeedback({
        valid: false,
        reason: 'Toca una casella per seleccionar-la',
      });
      return;
    }
    this.state.emit(eventName, { tile });
  }
}
