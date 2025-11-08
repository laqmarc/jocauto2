export class UpgradePanel {
  constructor(container) {
    this.container = container;
    this.title = document.createElement('h2');
    this.title.textContent = 'Upgrades';
    this.list = document.createElement('ul');
    this.list.className = 'upgrade-list';
    this.container.replaceChildren(this.title, this.list);
    this.render();
  }

  render() {
    this.list.innerHTML = '';
    const data = [
      {
        label: 'Miners / Forns',
        description: 'Cost = 2× cost base + 5 circuits avançats',
      },
      {
        label: 'Cintes',
        description: 'Cost = 1 planxa d’acer + 1 circuit avançat',
      },
      {
        label: 'Edificis Tier 2',
        description: 'Cost = 2× cost base + 10 circuits avançats',
      },
      {
        label: 'Edificis Tier 3',
        description: 'Cost = 2× cost base + 8 unitats de processament',
      },
    ];
    data.forEach((entry) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.className = 'upgrade-name';
      name.textContent = entry.label;
      const desc = document.createElement('small');
      desc.textContent = entry.description;
      item.append(name, desc);
      this.list.appendChild(item);
    });
  }
}
