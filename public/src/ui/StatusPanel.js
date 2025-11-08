export class StatusPanel {
  constructor(container) {
    this.container = container;
    this.title = document.createElement('h2');
    this.title.textContent = 'Estat';
    this.message = document.createElement('p');
    this.message.className = 'status-message';
    this.timestamp = document.createElement('span');
    this.timestamp.className = 'status-time';
    this.container.replaceChildren(this.title, this.message, this.timestamp);
    this.clearMessage();
  }

  showFeedback({ valid, def, reason, action, message }) {
    if (!def && !reason && !message) {
      this.clearMessage();
      return;
    }

    let text = message;
    if (!text) {
      if (action === 'remove' && valid) {
        text = `${def?.label ?? 'Estructura'} eliminada`;
      } else if (valid) {
        text = `${def?.label ?? 'Construccio'} creada`;
      } else {
        text = reason ?? 'No es pot colocar';
      }
    }

    this.message.textContent = text;
    this.message.classList.toggle('is-error', !valid);
    this.message.classList.toggle('is-success', !!valid && action !== 'remove');
    this.message.classList.toggle('is-remove', !!valid && action === 'remove');
    this.timestamp.textContent = new Date().toLocaleTimeString();
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.clearMessage(), 4000);
  }

  showText(text) {
    this.message.textContent = text;
    this.message.classList.remove('is-error', 'is-success', 'is-remove');
  }

  clearMessage() {
    this.message.textContent = 'Esperant accio...';
    this.message.classList.remove('is-error', 'is-success', 'is-remove');
    this.timestamp.textContent = '';
  }
}
