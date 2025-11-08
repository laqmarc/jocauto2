export class ControlsPanel {
  constructor(container) {
    this.container = container;
    this.title = document.createElement('h2');
    this.title.textContent = 'Controls';
    this.list = document.createElement('ul');
    this.list.className = 'controls-list';
    this.container.replaceChildren(this.title, this.list);
    this.render();
  }

  render() {
    this.list.innerHTML = '';
    this.addEntry('Ratolí esquerre', 'Col·locar edifici');
    this.addEntry('Ratolí dret', 'Eliminar edifici');
    this.addEntry('R', 'Rotar orientació');
    this.addEntry('F', 'Canviar entrada de cinta');
    this.addEntry('E', 'Girar edifici col·locat');
    this.addEntry('WASD', 'Moure la càmera');
    this.addEntry('U', 'Millorar edifici');
    this.addEntry('Q', 'Seleccionar recurs del dipòsit');
    this.addEntry('I', 'Inspeccionar casella');
  }

  addEntry(key, description) {
    const item = document.createElement('li');
    const keyCap = document.createElement('span');
    keyCap.className = 'key-cap';
    keyCap.textContent = key;
    const desc = document.createElement('span');
    desc.textContent = description;
    item.append(keyCap, desc);
    this.list.appendChild(item);
  }
}
