# Joc Auto 2D (HTML/JS)

Simulador 2D d’automatització inspirat en Satisfactory. Amb HTML, CSS i JavaScript modular es controla una fàbrica que extreu recursos, els processa i desbloqueja nous tiers.

## Taula de continguts
1. [Arquitectura i tecnologia](#arquitectura-i-tecnologia)
2. [Instal·lació i execució](#instal·lació-i-execució)
3. [Controls i HUD](#controls-i-hud)
4. [Flux de joc](#flux-de-joc)
5. [Milestones i Tiers](#milestones-i-tiers)
6. [Receptes i edificis](#receptes-i-edificis)
7. [Persistència](#persistència)
8. [Estructura del projecte](#estructura-del-projecte)
9. [Roadmap suggerit](#roadmap-sugerit)

## Arquitectura i tecnologia
- **Client only**: tot viu dins `public/` (serveix amb qualsevol servidor estàtic).
- **Mòduls ES6**: `core/` (motor + estat), `systems/`, `entities/`, `ui/`, `data/`.
- **Canvas 2D**: dibuix de graella, entitats i ports I/O manualment.
- **Event bus**: `WorldState` emet/rep esdeveniments (`input:*`, `tier:changed`, `inventory:add`...).
- **Autoguardats**: `PersistenceSystem` serialitza inventari, vetes, entitats i progressió a `localStorage`.

## Instal·lació i execució
```bash
git clone <repo>
cd jocauto2/public
# opcions
python -m http.server 4173   # o npx serve .
# o senzillament obre public/index.html al navegador
```

## Controls i HUD
- **Ratolí esquerre**: col·locar edifici.
- **Ratolí dret**: eliminar edifici.
- **R**: rotar l’orientació.
- **F**: (cintes) canviar l’entrada preferida (front / cantonades).
- **U**: millorar l’edifici sota el cursor (si hi ha recursos).
- **Q**: (dipòsits) cicla quin recurs de l’inventari expulsa el dipòsit.
- **I**: inspecciona la casella (veta, entitat, configuració) i ho mostra al panell d’estat.

HUD:
1. **Recursos** + llegenda de vetes i productes.
2. **Construcció** + panell de controls.
3. **Receptes** (collapsible per defecte).
4. **Upgrades** (recordatori del cost de cada millora).
5. **Estat** i **Debug** (missatges, guardats, FPS…).

## Flux de joc
1. **Explora**: identifica vetes de ferro/coure (tooltip, color de cel·les).
2. **Extreu**: col·loca miners a sobre de la veta correcta.
3. **Transporta**: cinta + `R`/`F` per connectar sortides/entrades.
4. **Processa**: forns → planxes, filadora, premsa d’engranatges, assembler de circuits.
5. **Recull**: finalitza en dipòsits o noves màquines (configura’n la sortida amb `Q`).
6. **Millora**: quan tinguis circuits avançats prem `U` per accelerar la cadena.

## Milestones i Tiers
1. **Tier 1** – Vetes de ferro/coure i tota la cadena bàsica fins a circuits.
2. **Milestone (100 circuits)** – El `ProgressionSystem` desbloqueja el **Tier 2**: noves vetes de carbó i edificis.
3. **Tier 2** – Carbó + ferro ⇒ acer, circuits avançats i panell d’upgrades.
4. **Upgrades** – Tecla `U` (els levels es veuen amb badge verd, i els edificis de Tier 2 porten una franja daurada):
   - **Miners/Forns**: `cost = (2 × cost base) + 5 circuits avançats`.
   - **Cintes**: `cost = 1 planxa d’acer + 1 circuit avançat`.
   - **Edificis Tier 2**: `cost = (2 × cost base) + 10 circuits avançats`.

## Receptes i edificis
| Edifici | Tier | Cost base | Entrades | Sortides |
|---------|------|-----------|----------|----------|
| Cinta | 1 | 1× planxa ferro | 1 direcció | 1 direcció |
| Dipòsit | 1 | 4× planxes ferro | Qualsevol | Inventari / sortida configurada |
| Miner ferro/coure | 1 | 12× planxes ferro | — | Mineral corresponent |
| Forn ferro/coure | 1 | 10× planxes ferro | 2× mineral | 1× planxa (cinta) |
| Filadora | 1 | 10× planxes ferro, 6× planxes coure | 1× planxa coure | 2× fil coure |
| Premsa engranatges | 1 | 14× planxes ferro | 2× planxes ferro | 1 engranatge |
| Assembler circuits | 1 | 18× planxes ferro, 6× fil coure | 2× fil, 1× planxa ferro | 1 circuit (inventari) |
| Miner carbó | 2 | 18× planxes ferro, 4× circuits | Veta carbó | Carbó |
| Farga d’acer | 2 | 20× planxes ferro, 5× carbó | 1 planxa ferro + 1 carbó | 1 planxa acer |
| Assembler avançat | 2 | 10× planxa acer, 5× circuits | 1 planxa acer + 1 circuit | 1 circuit avançat (inventari) |

Consulta `public/src/data/recipes.js` per afegir-ne de nous.

## Persistència
- Autoguardat cada 30 s (`PersistenceSystem`).
- Botons al panell de debug: *Guardar* i *Reset* (reinicia vetes i progressió).
- S’emmagatzema: inventari, entitats (amb nivell, tier, configuració), vetes i estat de milestones.

## Estructura del projecte
```
public/
├─ index.html
├─ styles/
│  └─ main.css
├─ src/
│  ├─ main.js
│  ├─ core/        # Engine, State, Storage
│  ├─ systems/     # Input, Build, Conveyor, Resource, Progression, Depot, Upgrade, etc.
│  ├─ entities/    # BaseEntity, miners, forns, cintes…
│  ├─ ui/          # Panells HUD (recursos, receptes, upgrades…)
│  └─ data/        # buildables, receptes, camp de recursos
└─ assets (imatges, sprites)
```

## Roadmap suggerit
- Tier 3 (oli, plàstic, circuits avançats extra).
- Sistema de missions/objectius i exportació de guardats.
- Més upgrades (cintes ràpides LV3, beacons, logística avançada).
- Versions mòbil/tablet amb UI específica.
