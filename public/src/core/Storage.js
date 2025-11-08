import { createEntityFromId, entityToSnapshot } from '../entities/EntityFactory.js';

const STORAGE_KEY = 'jocauto2-save';

export class Storage {
  static save(state) {
    const payload = {
      inventory: JSON.parse(JSON.stringify(state.inventory)),
      entities: Array.from(state.entities)
        .map((entity) => entityToSnapshot(entity))
        .filter(Boolean),
      resources: state.getResourceSnapshot(),
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('No es pot guardar la partida', error);
    }
  }

  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return null;
      }
      return JSON.parse(data);
    } catch (error) {
      console.warn('No es pot carregar la partida', error);
      return null;
    }
  }

  static loadInto(state) {
    const data = Storage.load();
    if (!data) {
      return false;
    }
    state.setInventory(data.inventory || {});
    state.clearEntities();
    state.initializeResourceField(data.resources);
    if (Array.isArray(data.entities)) {
      data.entities.forEach((snapshot) => {
        const entity = createEntityFromId(
          snapshot.id,
          { x: snapshot.x, y: snapshot.y },
          snapshot.orientation,
          snapshot,
        );
        if (entity) {
          state.addEntity(entity);
        }
      });
    }
    state.refreshPanels();
    return true;
  }

  static clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
