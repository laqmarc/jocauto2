import { Engine } from './core/Engine.js';
import { WorldState } from './core/State.js';
import { ConveyorSystem } from './systems/ConveyorSystem.js';
import { ResourceSystem } from './systems/ResourceSystem.js';
import { BuildSystem } from './systems/BuildSystem.js';
import { InputSystem } from './systems/InputSystem.js';
import { PersistenceSystem } from './systems/PersistenceSystem.js';

const canvas = document.getElementById('game-canvas');

const worldState = new WorldState({
  canvas,
  width: 40,
  height: 22,
  tileSize: 32,
});

const engine = new Engine(worldState);

engine.registerSystem(new PersistenceSystem(worldState));
engine.registerSystem(new InputSystem(worldState));
engine.registerSystem(new BuildSystem(worldState));
engine.registerSystem(new ConveyorSystem(worldState));
engine.registerSystem(new ResourceSystem(worldState));

engine.start();
