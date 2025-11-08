const steps = [
  {
    title: '1- Benvingut a la fàbrica',
    body: 'Fes servir WASD per moure la càmera i localitzar vetes de ferro/coure. Amb el ratolí esquerre col·loca miners sobre cada veta.',
  },
  {
    title: '2- Extreu i transporta',
    body: 'Construeix cintes des dels miners fins als forns. Prem R per girar la sortida i F per decidir per on entra el material a la cinta.',
  },
  {
    title: '3- Processa els recursos',
    body: 'Els forns converteixen mineral en planxes. Combina planxes de coure amb la filadora i la premsa per fabricar circuits bàsics.',
  },
  {
    title: '4- Automatitza l’inventari',
    body: 'Els dipòsits accepten recursos pels quatre costats. Amb Q pots triar quin recurs expulsen per alimentar altres màquines.',
  },
  {
    title: 'FI - Desbloqueja el Tier 2',
    body: 'Arriba als 100 circuits per generar vetes de carbó i nous edificis. Recorda millorar la teva maquinària amb la tecla U.',
  },
];

export class TutorialPanel {
  constructor(container) {
    this.container = container;
    this.title = document.createElement('h2');
    this.title.textContent = 'Tutorial';
    this.body = document.createElement('p');
    this.body.className = 'tutorial-body';
    this.nav = document.createElement('div');
    this.nav.className = 'tutorial-nav';
    this.prevBtn = document.createElement('button');
    this.prevBtn.type = 'button';
    this.prevBtn.textContent = 'Anterior';
    this.nextBtn = document.createElement('button');
    this.nextBtn.type = 'button';
    this.nextBtn.textContent = 'Següent';
    this.nav.append(this.prevBtn, this.nextBtn);
    this.container.replaceChildren(this.title, this.body, this.nav);
    this.index = 0;
    this.update();
    this.prevBtn.addEventListener('click', () => this.go(-1));
    this.nextBtn.addEventListener('click', () => this.go(1));
  }

  go(delta) {
    this.index = (this.index + delta + steps.length) % steps.length;
    this.update();
  }

  update() {
    const step = steps[this.index];
    this.title.textContent = `Tutorial · ${step.title}`;
    this.body.textContent = step.body;
  }
}
