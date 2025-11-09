export class ControlsPanel {
  constructor(container) {
    this.container = container;
    this.title = document.createElement('h2');
    this.title.textContent = 'Controls';
    this.list = document.createElement('ul');
    this.list.className = 'controls-list';
    this.container.replaceChildren(this.title, this.list);
    this.mediaQuery = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
    this.isTouch = this.mediaQuery?.matches ?? false;
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', (event) => {
        this.isTouch = event.matches;
        this.render();
      });
    }
    this.render();
  }

  render() {
    this.list.innerHTML = '';
    if (this.isTouch) {
      this.addEntry('Toc curt', 'Col·locar o fer acció del mode actiu');
      this.addEntry('Toc llarg', 'Eliminar ràpid sense canviar de mode');
      this.addEntry('Arrossega', 'Moure la càmera');
      this.addEntry('Barra tàctil', 'Botons per girar, cintes, dipòsits i upgrades');
    } else {
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
