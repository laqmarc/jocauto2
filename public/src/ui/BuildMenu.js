import { resourceInfo } from '../data/recipes.js';

export class BuildMenu {
  constructor(container, buildables, { onSelect, getActive }) {
    this.container = container;
    this.buildables = buildables;
    this.onSelect = onSelect;
    this.getActive = getActive;
    this.buttons = new Map();
    this.orientationLabel = document.createElement('p');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    const title = document.createElement('h2');
    title.textContent = 'Construccio';
    this.orientationLabel.className = 'orientation-label';
    this.orientationLabel.textContent = 'Orientacio: Est';

    const list = document.createElement('div');
    list.className = 'build-list';

    this.buildables.forEach((def) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.buildId = def.id;
      button.className = 'build-option';
      const name = document.createElement('span');
      name.className = 'build-name';
      name.textContent = def.label;
      const cost = document.createElement('span');
      cost.className = 'build-cost';
      cost.textContent = this.formatCost(def.cost);
      button.append(name, cost);
      button.addEventListener('click', () => this.select(def.id));
      this.buttons.set(def.id, button);
      list.appendChild(button);
    });

    this.container.append(title, this.orientationLabel, list);
    this.highlightActive();
  }

  select(id) {
    if (typeof this.onSelect === 'function') {
      this.onSelect(id);
    }
    this.highlightActive();
  }

  highlightActive() {
    const active = this.getActive();
    this.buttons.forEach((button, id) => {
      button.classList.toggle('is-active', id === active);
    });
  }

  setOrientationLabel(text) {
    this.orientationLabel.textContent = `Orientacio: ${text}`;
  }

  formatCost(cost = null) {
    if (!cost || Object.keys(cost).length === 0) {
      return 'Cost: 0';
    }
    return Object.entries(cost)
      .map(([resource, amount]) => {
        const label = resourceInfo[resource]?.label || resource;
        return `${amount}× ${label}`;
      })
      .join(', ');
  }
}
