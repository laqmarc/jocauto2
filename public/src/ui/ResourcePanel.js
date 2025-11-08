import { resourceInfo } from '../data/recipes.js';

export class ResourcePanel {
  constructor(container) {
    this.container = container;
    this.title = document.createElement('h2');
    this.title.textContent = 'Recursos';
    this.list = document.createElement('dl');
    this.list.className = 'resource-list';

    this.legendFieldTitle = document.createElement('h3');
    this.legendFieldTitle.textContent = 'Vetes';
    this.legendFieldList = document.createElement('ul');
    this.legendFieldList.className = 'resource-legend';

    this.legendProductTitle = document.createElement('h3');
    this.legendProductTitle.textContent = 'Productes';
    this.legendProductList = document.createElement('ul');
    this.legendProductList.className = 'resource-legend';

    this.container.replaceChildren(
      this.title,
      this.list,
      this.legendFieldTitle,
      this.legendFieldList,
      this.legendProductTitle,
      this.legendProductList,
    );
    this.renderLegend();
  }

  update(inventory) {
    this.list.innerHTML = '';
    Object.entries(inventory)
      .sort()
      .forEach(([resource, amount]) => {
        const term = document.createElement('dt');
        term.textContent = resourceInfo[resource]?.label || resource;
        const value = document.createElement('dd');
        value.textContent = amount.toFixed ? amount.toFixed(0) : String(amount);
        this.list.append(term, value);
      });
  }

  renderLegend() {
    const entries = Object.entries(resourceInfo);
    const fieldResources = entries.filter(([, info]) => info.isField);
    const productResources = entries.filter(([, info]) => !info.isField);

    this.renderLegendSection(this.legendFieldTitle, this.legendFieldList, fieldResources);
    this.renderLegendSection(this.legendProductTitle, this.legendProductList, productResources);
  }

  refreshLegend() {
    this.renderLegend();
  }

  renderLegendSection(titleEl, listEl, resources) {
    if (!resources.length) {
      titleEl.classList.add('hidden');
      listEl.classList.add('hidden');
      return;
    }
    titleEl.classList.remove('hidden');
    listEl.classList.remove('hidden');
    listEl.innerHTML = '';
    resources.forEach(([key, info]) => {
      const item = document.createElement('li');
      const swatch = document.createElement('span');
      swatch.className = 'resource-dot';
      swatch.style.background = info.color;
      item.append(swatch, info.label || key);
      listEl.appendChild(item);
    });
  }
}
