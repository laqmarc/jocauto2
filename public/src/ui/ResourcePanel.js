import { resourceInfo } from '../data/recipes.js';

export class ResourcePanel {
  constructor(state, container) {
    this.state = state;
    this.container = container;
    this.title = document.createElement('h2');
    this.title.textContent = 'Recursos';
    this.table = document.createElement('table');
    this.table.className = 'resource-table';
    const head = document.createElement('thead');
    head.innerHTML = '<tr><th>Recurs</th><th>Quantitat</th><th>Flux</th></tr>';
    this.table.append(head);
    this.tbody = document.createElement('tbody');
    this.table.append(this.tbody);

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
      this.table,
      this.legendFieldTitle,
      this.legendFieldList,
      this.legendProductTitle,
      this.legendProductList,
    );
    this.renderLegend();
  }

  update(inventory) {
    this.tbody.innerHTML = '';
    Object.entries(inventory)
      .sort()
      .forEach(([resource, amount]) => {
        const row = document.createElement('tr');
        const resourceCell = document.createElement('td');
        resourceCell.textContent = resourceInfo[resource]?.label || resource;
        const amountCell = document.createElement('td');
        const formattedAmount =
          typeof amount === 'number' && Number.isFinite(amount) ? amount.toFixed(0) : String(amount);
        const rate = this.state.getResourceRate(resource);
        const rateText = this.formatRate(rate);
        amountCell.textContent = formattedAmount;
        const rateCell = document.createElement('td');
        rateCell.textContent = rateText;
        rateCell.className = rate > 0 ? 'rate-positive' : rate < 0 ? 'rate-negative' : 'rate-neutral';
        row.append(resourceCell, amountCell, rateCell);
        this.tbody.appendChild(row);
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

  formatRate(rate) {
    if (!rate || Math.abs(rate) < 0.05) {
      return '';
    }
    const sign = rate > 0 ? '+' : '';
    return ` (${sign}${rate.toFixed(1)}/s)`;
  }
}
