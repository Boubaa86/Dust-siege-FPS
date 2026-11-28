/* WARWORLD V18 — nouvelle carte Base militaire.
   Ajout isolé : décor procédural de secours + modèle GLB CC0 chargé à la demande.
   Aucun changement aux règles de combat, dégâts, armes, économie, réseau ou HUD. */
(() => {
  'use strict';
  if (window.__dsV18BaseOutpostInstalled) return;
  window.__dsV18BaseOutpostInstalled = true;

  const state = { loading: false, loaded: false, failed: false, active: false, status: 'Carte prête à charger' };
  const palette = {
    sand: new T.MeshStandardMaterial({ color: 0x9a805b, roughness: 0.98 }),
    sandLight: new T.MeshStandardMaterial({ color: 0xb39a70, roughness: 0.96 }),
    olive: new T.MeshStandardMaterial({ color: 0x596044, roughness: 0.9 }),
    oliveDark: new T.MeshStandardMaterial({ color: 0x343b2d, roughness: 0.88, metalness: 0.08 }),
    metal: new T.MeshStandardMaterial({ color: 0x33383a, roughness: 0.62, metalness: 0.45 }),
    rubber: new T.MeshStandardMaterial({ color: 0x17191a, roughness: 0.98 }),
    canvas: new T.MeshStandardMaterial({ color: 0x77745b, roughness: 1 }),
    canvasLight: new T.MeshStandardMaterial({ color: 0xaaa080, roughness: 1 }),
    wood: new T.MeshStandardMaterial({ color: 0x59432e, roughness: 0.98 }),
    dark: new T.MeshStandardMaterial({ color: 0x242827, roughness: 0.85 }),
    glow: new T.MeshStandardMaterial({ color: 0xffbd58, emissive: 0x9d4d08, emissiveIntensity: 1.7, roughness: 0.35 })
  };

  // Index 3 is the existing city map; index 4 is this new desert-base map.
  // The city selector already worked through a special wrapper, but a metadata
  // entry also makes night mode and quality checks safe while the city is active.
  if (!MAPS[3]) MAPS[3] = { g: MAPS[1].g, f: [0x777b7e, 0x777b7e, 0x777b7e], fog: 0x777b7e, gr: false };
  if (!MAPS[4]) MAPS[4] = { g: MAPS[1].g, f: [0x9a8a3a, 0xb09a48, 0x7d6e2e], fog: 0xc4a477, gr: false };

  const base = new T.Group();
  base.name = 'dust-siege-v18-field-base';
  base.position.set(33, 0, 17);
  base.visible = false;
  scene.add(base);

  function addMesh(group, geometry, material, x, y, z, rx = 0, ry = 0, rz = 0) {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function addBox(group, x, y, z, w, h, d, material, ry = 0) {
    return addMesh(group, new T.BoxGeometry(w, h, d), material, x, y, z, 0, ry, 0);
  }

  function buildFallback() {
    const g = new T.Group();
    g.name = 'v18-base-local-fallback';
    addBox(g, 0, -0.09, 0, 39, 0.16, 48, palette.sand);
    // Road and parking apron.
    addBox(g, 1, 0.005, 0, 7.5, 0.025, 45, palette.dark);
    for (let z = -19; z <= 19; z += 5) addBox(g, 1, 0.025, z, 0.12, 0.012, 2.1, palette.sandLight);

    // Command hangar and radio mast.
    addBox(g, 11, 2.1, -11, 11, 4.2, 9, palette.oliveDark);
    addBox(g, 11, 4.35, -11, 11.8, 0.35, 9.8, palette.wood);
    addBox(g, 11, 1.25, -6.42, 3.1, 2.5, 0.16, palette.dark);
    addMesh(g, new T.CylinderGeometry(0.08, 0.12, 8, 8), palette.metal, 15, 4.1, -15);
    addMesh(g, new T.SphereGeometry(0.16, 10, 8), palette.glow, 15, 8.2, -15);
    const antenna = new T.Group();
    antenna.position.set(15, 7.8, -15);
    addMesh(antenna, new T.BoxGeometry(3.4, 0.08, 0.08), palette.metal, 0, 0, 0);
    g.add(antenna);

    // Two field tents.
    for (const [x, z, s] of [[-10, -12, 1], [-11, 2, 0.82]]) {
      addMesh(g, new T.ConeGeometry(2.7 * s, 3.1 * s, 4), palette.canvas, x, 1.52 * s, z, 0, Math.PI / 4, 0);
      addBox(g, x, 0.18, z, 4.6 * s, 0.22, 4.6 * s, palette.wood);
      addBox(g, x, 1.08 * s, z + 2.05 * s, 0.9 * s, 1.6 * s, 0.08, palette.canvasLight);
    }

    // Guard tower with platform, legs, rails and a turning radar bar.
    const tx = -13, tz = 15;
    for (const dx of [-1.45, 1.45]) for (const dz of [-1.45, 1.45]) {
      addBox(g, tx + dx, 2.5, tz + dz, 0.22, 5, 0.22, palette.wood);
    }
    addBox(g, tx, 5.05, tz, 3.4, 0.28, 3.4, palette.wood);
    addBox(g, tx, 6.35, tz, 2.8, 2.25, 2.8, palette.oliveDark);
    addMesh(g, new T.ConeGeometry(2.2, 1.25, 4), palette.wood, tx, 8.05, tz, 0, Math.PI / 4, 0);
    for (let j = -1; j <= 1; j += 2) {
      addBox(g, tx + j * 1.5, 5.75, tz, 0.1, 1.2, 0.1, palette.metal);
      addBox(g, tx, 5.75, tz + j * 1.5, 0.1, 1.2, 0.1, palette.metal);
    }
    const radar = new T.Group();
    radar.position.set(tx, 8.8, tz);
    addMesh(radar, new T.BoxGeometry(3.1, 0.09, 0.12), palette.metal, 0, 0, 0);
    addMesh(radar, new T.BoxGeometry(0.12, 0.09, 2.4), palette.metal, 0, 0, 0);
    g.add(radar);

    // Sandbag checkpoints and concrete barriers.
    for (let i = 0; i < 9; i++) {
      const x = -5 + i * 1.12;
      addBox(g, x, 0.23, 8.2, 1.05, 0.43, 0.56, palette.sandLight, (i % 2) * 0.04);
      addBox(g, x + 0.52, 0.62, 8.2, 1.05, 0.43, 0.56, palette.sand, (i % 2) * -0.04);
    }
    for (const [x, z] of [[-15, -3], [15, 6], [6, 17]]) {
      addBox(g, x, 0.62, z, 2.8, 1.22, 0.8, palette.sandLight, x * 0.02);
      addBox(g, x, 0.62, z + 1.2, 2.8, 1.22, 0.8, palette.sandLight, x * 0.02);
    }

    // Static armoured vehicle, truck and fuel drums for a readable military silhouette.
    const tank = new T.Group();
    tank.position.set(5.6, 0, 8.4);
    addBox(tank, 0, 0.72, 0, 3.4, 0.95, 5.1, palette.olive);
    addBox(tank, 0, 0.45, -0.08, 3.85, 0.52, 5.45, palette.rubber);
    for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
      addMesh(tank, new T.CylinderGeometry(0.31, 0.31, 0.16, 12), palette.metal, side * 1.83, 0.46, -2.05 + i * 0.82, 0, 0, Math.PI / 2);
    }
    const turret = new T.Group();
    turret.position.set(0, 1.38, -0.1);
    addMesh(turret, new T.CylinderGeometry(0.95, 1.12, 0.62, 12), palette.oliveDark, 0, 0, 0);
    addBox(turret, 0, 0.1, -1.25, 0.22, 0.22, 2.8, palette.metal);
    tank.add(turret);
    g.add(tank);

    const truck = new T.Group();
    truck.position.set(-5.8, 0, -1.8);
    addBox(truck, 0, 0.82, 0, 2.8, 1.45, 4.8, palette.olive);
    addBox(truck, 0, 1.52, 1.32, 2.55, 1.05, 1.55, palette.oliveDark);
    addBox(truck, 0, 1.45, -1.05, 2.5, 1.3, 2.2, palette.canvas);
    for (const side of [-1, 1]) for (const z of [-1.55, 1.55]) {
      addMesh(truck, new T.CylinderGeometry(0.48, 0.48, 0.24, 14), palette.rubber, side * 1.48, 0.48, z, 0, 0, Math.PI / 2);
    }
    g.add(truck);

    for (const [x, z] of [[-17, -10], [-16, -8.8], [-17, -7.6], [16, -2], [16, -0.8]]) {
      addMesh(g, new T.CylinderGeometry(0.38, 0.38, 1.05, 12), palette.oliveDark, x, 0.56, z);
      addMesh(g, new T.CylinderGeometry(0.39, 0.39, 0.06, 12), palette.metal, x, 1.12, z);
    }
    // Supply crates.
    for (let i = 0; i < 5; i++) addBox(g, -5 + (i % 3) * 1.15, 0.48 + Math.floor(i / 3) * 0.96, 13 + (i % 2) * 1.05, 0.9, 0.88, 0.9, palette.wood);

    g.userData.v18Radar = radar;
    g.userData.v18Antenna = antenna;
    base.add(g);
    return g;
  }

  const fallback = buildFallback();
  let loadedScene = null;

  function setStatus(message) {
    state.status = message;
    const node = document.getElementById('ds-v18-base-status');
    if (node) node.textContent = 'Base militaire : ' + message;
  }

  function loadRemoteScene() {
    if (state.loading || state.loaded || state.failed) return;
    if (!T.GLTFLoader) {
      state.failed = true;
      setStatus('décor local actif (chargeur 3D externe indisponible)');
      return;
    }
    state.loading = true;
    setStatus('décor local actif · chargement du pack 3D facultatif…');
    const loader = new T.GLTFLoader();
    loader.load(
      'https://cdn.3dassets.dev/assets/23739/v1/model.glb',
      gltf => {
        try {
          if (!gltf || !gltf.scene) throw new Error('Scène 3D absente');
          loadedScene = gltf.scene;
          loadedScene.name = 'v18-cc0-armoured-column-field-camp';
          loadedScene.scale.setScalar(0.88);
          loadedScene.traverse(node => {
            if (node.isMesh) {
              node.castShadow = false;
              node.receiveShadow = true;
              if (node.material && !Array.isArray(node.material)) node.material.side = T.DoubleSide;
            }
          });
          base.add(loadedScene);
          fallback.visible = false;
          state.loading = false;
          state.loaded = true;
          setStatus('pack 3D CC0 chargé · décor local conservé en secours');
        } catch (error) {
          state.loading = false;
          state.failed = true;
          fallback.visible = true;
          console.warn('[WARWORLD V18] Modèle distant invalide, décor local conservé.', error);
          setStatus('décor local actif · modèle distant invalide');
        }
      },
      undefined,
      error => {
        state.loading = false;
        state.failed = true;
        fallback.visible = true;
        console.warn('[WARWORLD V18] Pack 3D distant indisponible, décor local conservé.', error);
        setStatus('décor local actif · pack distant indisponible');
      }
    );
  }

  const previousSetMap = setMap;
  setMap = function (index) {
    if (index === 4) {
      // Reuse the existing desert terrain and biome. Only the outpost group is new.
      previousSetMap(1);
      mapI = 4;
      gr.material = MAPS[4].g;
      scene.fog.color.set(night ? 0x0a1020 : MAPS[4].fog);
      gm.visible = false;
      base.visible = true;
      state.active = true;
      loadRemoteScene();
      setStatus(state.loaded ? 'pack 3D CC0 chargé' : state.failed ? 'décor local actif' : 'décor local actif · pack 3D en option');
      return;
    }
    base.visible = false;
    state.active = false;
    return previousSetMap(index);
  };

  // Keep the advanced map diagnostic in sync. The settings dropdown already
  // contains the fifth option in index.html; do not touch the other selectors.
  const mapPanel = document.getElementById('dsu-maps');
  if (mapPanel && window.MutationObserver) {
    const labelMaps = () => {
      const city = mapPanel.querySelector('button[data-map="3"]');
      const outpost = mapPanel.querySelector('button[data-map="4"]');
      if (city) city.textContent = 'Ville';
      if (outpost) outpost.textContent = 'Base militaire';
    };
    new MutationObserver(labelMaps).observe(mapPanel, { childList: true, subtree: true });
    labelMaps();
  }

  // Add a status line to the existing diagnostic card only; never to the gameplay HUD.
  const diag = document.getElementById('ds-v17-integrity-card');
  if (diag && !document.getElementById('ds-v18-base-status')) {
    const line = document.createElement('p');
    line.id = 'ds-v18-base-status';
    line.style.margin = '7px 0';
    line.textContent = 'Base militaire : prête à charger';
    diag.appendChild(line);
  }

  window.addEventListener('online', () => {
    if (state.active && state.failed && !state.loaded) {
      state.failed = false;
      loadRemoteScene();
    }
  }, { passive: true });

  function animateBase() {
    if (base.visible && base.children.length) {
      const local = base.children.find(child => child.name === 'v18-base-local-fallback');
      const radar = local && local.userData && local.userData.v18Radar;
      const antenna = local && local.userData && local.userData.v18Antenna;
      if (radar) radar.rotation.y += 0.012;
      if (antenna) antenna.rotation.y -= 0.004;
    }
    requestAnimationFrame(animateBase);
  }
  requestAnimationFrame(animateBase);

  window.dsV18BaseOutpost = {
    version: 18,
    state,
    loadRemoteScene,
    get active() { return state.active; },
    get loaded() { return state.loaded; }
  };
  setStatus('prête à charger');
})();
