export class DebugPanel {
  constructor(container) {
    this.container = container;
    this.title = document.createElement('h2');
    this.title.textContent = 'Debug';
    this.lines = document.createElement('div');
    this.lines.className = 'debug-lines';
    this.actions = document.createElement('div');
    this.actions.className = 'debug-actions';
    this.saveButton = document.createElement('button');
    this.saveButton.type = 'button';
    this.saveButton.textContent = 'Guardar';
    this.resetButton = document.createElement('button');
    this.resetButton.type = 'button';
    this.resetButton.textContent = 'Reset';
    this.actions.append(this.saveButton, this.resetButton);
    this.container.replaceChildren(this.title, this.lines, this.actions);
  }

  update({ fps = 0, entities = 0, conveyors = 0, items = 0 }) {
    this.lines.innerHTML = `
      <div>FPS: ${fps.toFixed(0)}</div>
      <div>Entitats: ${entities}</div>
      <div>Cintes: ${conveyors}</div>
      <div>Items: ${items}</div>
    `;
  }

  bindPersistenceControls({ onSave, onReset } = {}) {
    this.saveButton.onclick = () => {
      if (typeof onSave === 'function') {
        onSave();
      }
    };
    this.resetButton.onclick = () => {
      if (typeof onReset === 'function') {
        onReset();
      }
    };
  }
}
