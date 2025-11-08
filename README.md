# Joc Auto 2D (HTML/JS)

Simulador 2D d’automatització inspirat en Satisfactory. Amb HTML, CSS i JavaScript modular controles una fàbrica que extreu recursos, els processa i desbloqueja nous tiers.

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
- **Client only**: tot viu a `public/` i es pot servir amb qualsevol servidor estàtic.
- **Mòduls ES6**: `core/` (engine, state, storage), `systems/`, `entities/`, `ui/`, `data/`.
- **Canvas 2D**: dibuix manual de graella, entitats i ports.
- **Event bus**: `WorldState` emet/rep esdeveniments (`input:*`, `tier:changed`, etc.).
- **Autoguardats**: `PersistenceSystem` serialitza inventari, vetes, entitats i progressió a `localStorage`.

## Instal·lació i execució
```bash
git clone <repo>
cd jocauto2/public
# Opció 1
python -m http.server 4173
# Opció 2
npx serve .
# O obre public/index.html directament al navegador
```

## Controls i HUD
- **Ratolí esquerre**: col·locar edifici
- **Ratolí dret**: eliminar edifici
- **R**: rotar orientació
- **F**: cintes – canviar l’entrada preferida
- **E**: girar un edifici ja col·locat
- **W / A / S / D**: moure la càmera
- **U**: millorar l’edifici seleccionat
- **Q**: dipòsits – ciclar recurs sortint
- **I**: inspeccionar casella (veta, entitat i configuració)

HUD:
1. **Recursos** (inventari + llegenda de vetes i productes).
2. **Construcció** + panell de controls.
3. **Receptes** (collapsible per defecte).
4. **Upgrades** (recordatori del cost de cada millora).
5. **Estat** i **Debug** (missatges, guardats, FPS…).
6. **Tutorial** (mini guia pas a pas amb botons “Anterior/Següent”).

## Flux de joc
1. **Explora**: identifica vetes de ferro/coure (tooltip i color).
2. **Extreu**: col·loca miners sobre la veta correcta.
3. **Transporta**: cintes + `R`/`F` per casar entrades i sortides.
4. **Processa**: forns → planxes, filadora, premsa d’engranatges, assembler de circuits.
5. **Recull**: finalitza en dipòsits (configura la sortida amb `Q`) o en noves màquines.
6. **Millora**: utilitza circuits avançats per fer upgrades (`U`).

## Milestones i Tiers
1. **Tier 1** – Vetes de ferro/coure + cadena bàsica fins a circuits.
2. **Milestone (100 circuits)** – Desbloqueja el **Tier 2** (veta de carbó + edificis nous).
3. **Tier 2** – Carbó + ferro = acer, circuits avançats, panell d’upgrades.
4. **Upgrades** – tecla `U` (els icones mostren: franja daurada per Tier 2 i badge verd “2” per edificis millorats):
   - Miners i forns: `cost = (2 × cost base) + 5 circuits avançats`.
   - Cintes: `cost = 1 planxa d’acer + 1 circuit avançat`.
   - Edificis Tier 2: `cost = (2 × cost base) + 10 circuits avançats`.

## Receptes i edificis
| Edifici | Tier | Cost base | Entrades | Sortides |
|---------|------|-----------|----------|----------|
| Cinta | 1 | 1× planxa de ferro | 1 direcció | 1 direcció |
| Dipòsit | 1 | 4× planxes de ferro | Qualsevol | Inventari / sortida configurada |
| Miner de ferro/coure | 1 | 12× planxes de ferro | — | Mineral |
| Forn de ferro/coure | 1 | 10× planxes de ferro | 2× mineral | 1× planxa |
| Filadora | 1 | 10× planxes de ferro, 6× planxes de coure | 1× planxa de coure | 2× fil de coure |
| Premsa d’engranatges | 1 | 14× planxes de ferro | 2× planxes de ferro | 1 engranatge |
| Assembler de circuits | 1 | 18× planxes de ferro, 6× fil de coure | 2× fil, 1× planxa | 1 circuit (inventari) |
| Miner de carbó | 2 | 18× planxes de ferro, 4× circuits | Veta de carbó | Carbó |
| Farga d’acer | 2 | 20× planxes de ferro, 5× carbó | 1× planxa de ferro, 1× carbó | 1× planxa d’acer |
| Assembler avançat | 2 | 10× planxes d’acer, 5× circuits | 1× planxa d’acer, 1× circuit | 1 circuit avançat |

Consulta `public/src/data/recipes.js` per afegir receptes o recursos nous.

## Persistència
- Autoguardat cada 30 s.
- Botons al panell de debug: *Guardar* i *Reset* (reinicia vetes i progressió).
- Es desa l’inventari, la escena (edificis, nivells, sortides), vetes i milestones.

## Estructura del projecte
```
public/
├─ index.html
├─ styles/
│  └─ main.css
└─ src/
   ├─ main.js
   ├─ core/        # Engine, State, Storage
   ├─ systems/     # Input, Build, Conveyor, Resource, Progression, Depot, Upgrade, Inspection…
   ├─ entities/    # BaseEntity, miners, forns, cintes, dipòsits…
   ├─ ui/          # Panells HUD (recursos, receptes, upgrades…)
   └─ data/        # buildables, receptes, generador de vetes
```

## Roadmap suggerit
- Tier 3 (oli, plàstic, circuits avançats extra).
- Sistema de missions/objectius i exportació/importació de guardats.
- Més upgrades (cintes LV3, beacons, logística avançada).
- UI específica per mòbil/tablet.
