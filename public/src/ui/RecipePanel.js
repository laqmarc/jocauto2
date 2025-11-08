import { recipes, resourceInfo } from '../data/recipes.js';

export class RecipePanel {
  constructor(container) {
    this.container = container;
    this.collapsed = true;
    this.header = document.createElement('div');
    this.header.className = 'panel-header';
    this.title = document.createElement('h2');
    this.title.textContent = 'Receptes';
    this.toggleButton = document.createElement('button');
    this.toggleButton.type = 'button';
    this.toggleButton.className = 'panel-toggle';
    this.toggleButton.addEventListener('click', () => this.toggle());
    this.header.append(this.title, this.toggleButton);

    this.content = document.createElement('div');
    this.content.className = 'recipe-content';
    this.list = document.createElement('div');
    this.list.className = 'recipe-list';
    this.content.appendChild(this.list);

    this.container.classList.add('collapsible-panel');
    this.container.replaceChildren(this.header, this.content);
    this.render();
    this.applyCollapseState();
  }

  toggle() {
    this.collapsed = !this.collapsed;
    this.applyCollapseState();
  }

  applyCollapseState() {
    this.container.classList.toggle('is-collapsed', this.collapsed);
    this.content.hidden = this.collapsed;
    this.toggleButton.textContent = this.collapsed ? 'Mostrar' : 'Amagar';
  }

  render() {
    this.list.innerHTML = '';
    Object.entries(recipes).forEach(([id, recipe]) => {
      const item = document.createElement('article');
      item.className = 'recipe-item';

      const recipeTitle = document.createElement('h3');
      recipeTitle.textContent = resourceInfo[id]?.label || id;
      item.appendChild(recipeTitle);

      const body = document.createElement('div');
      body.className = 'recipe-item-body';

      const inputs = document.createElement('ul');
      inputs.className = 'recipe-side';
      inputs.appendChild(this.createSideTitle('Entrada'));
      this.fillResourceList(inputs, recipe.input);

      const outputs = document.createElement('ul');
      outputs.className = 'recipe-side';
      outputs.appendChild(this.createSideTitle('Sortida'));
      this.fillResourceList(outputs, recipe.output);

      const arrow = document.createElement('div');
      arrow.className = 'recipe-arrow';
      arrow.textContent = '→';

      body.append(inputs, arrow, outputs);
      item.appendChild(body);
      this.list.appendChild(item);
    });
  }

  fillResourceList(list, resources) {
    Object.entries(resources).forEach(([resource, amount]) => {
      const li = document.createElement('li');
      const label = resourceInfo[resource]?.label || resource;
      li.textContent = `${amount} × ${label}`;
      list.appendChild(li);
    });
  }

  createSideTitle(text) {
    const title = document.createElement('li');
    title.className = 'recipe-side-title';
    title.textContent = text;
    return title;
  }
}
