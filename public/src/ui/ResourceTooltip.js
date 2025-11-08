import { resourceInfo } from '../data/recipes.js';
import { buildables } from '../data/buildables.js';

export class ResourceTooltip {
  constructor(element, wrapper) {
    this.element = element;
    this.wrapper = wrapper;
  }

  bind(state) {
    state.on('hover:resource', (payload) => this.update(payload));
  }

  update(payload) {
    if (!payload || !payload.tile) {
      this.hide();
      return;
    }
    const parts = [];
    if (payload.entity) {
      const def = buildables[payload.entity.buildId];
      parts.push(def?.label || this.getEntityFallback(payload.entity));
    }
    const resourceLabel = payload.resource
      ? resourceInfo[payload.resource]?.label || payload.resource
      : 'Sense veta';
    parts.push(`Veta: ${resourceLabel}`);
    this.element.textContent = parts.join(' • ');
    this.position(payload.offset);
    this.element.classList.remove('hidden');
  }

  getEntityFallback(entity) {
    if (!entity) {
      return '';
    }
    return entity.type.charAt(0).toUpperCase() + entity.type.slice(1);
  }

  position(offset = { x: 0, y: 0 }) {
    const maxX = Math.max(0, this.wrapper.clientWidth - 160);
    const maxY = Math.max(0, this.wrapper.clientHeight - 24);
    const left = Math.min(offset.x + 12, maxX);
    const top = Math.min(offset.y + 12, maxY);
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
