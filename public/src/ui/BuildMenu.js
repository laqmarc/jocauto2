import { resourceInfo } from '../data/recipes.js';

export class BuildMenu {
  constructor(container, buildables, { onSelect, getActive, getStatus }) {
    this.container = container;
    this.buildables = buildables;
    this.onSelect = onSelect;
    this.getActive = getActive;
    this.getStatus = getStatus || (() => ({ unlocked: true }));
    this.buttons = new Map();
    this.orientationLabel = document.createElement('p');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.buttons.clear();
    const title = document.createElement('h2');
    title.textContent = 'Construccio';
    this.orientationLabel.className = 'orientation-label';
    this.orientationLabel.textContent = 'Orientacio: Est';

    const list = document.createElement('div');
    list.className = 'build-list';

    this.buildables.forEach((def) => {
      const status = this.getStatus(def);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.buildId = def.id;
      button.className = 'build-option';
      let icon;
      if (def.icon) {
        icon = document.createElement('img');
        icon.className = 'build-icon';
        icon.src = def.icon;
        icon.alt = def.label;
      } else {
        icon = document.createElement('span');
        icon.className = 'build-icon';
        icon.textContent = '⬜';
      }

      const name = document.createElement('span');
      name.className = 'build-name';
      name.textContent = def.label;
      const cost = document.createElement('span');
      cost.className = 'build-cost';
      cost.textContent = status.unlocked
        ? this.formatCost(def.cost)
        : status.reason || 'Bloquejat';
      button.append(icon, name, cost);
      button.addEventListener('click', () => {
        if (status.unlocked) {
          this.select(def.id);
        }
      });
      button.disabled = !status.unlocked;
      button.classList.toggle('is-locked', !status.unlocked);
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
