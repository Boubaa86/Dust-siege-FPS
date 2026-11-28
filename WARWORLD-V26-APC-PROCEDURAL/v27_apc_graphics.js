/* WARWORLD V27 — finition graphique additive de l’APC. */
(() => {
  if (!window.THREE || typeof jeep === 'undefined' || !jeep.isObject3D) return;

  const T = window.THREE;
  const vehicle = jeep;
  const seeded = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const random = seeded(2708);

  // Peinture de camouflage mate, générée localement et sans ressource externe.
  const paintCanvas = document.createElement('canvas');
  paintCanvas.width = paintCanvas.height = 512;
  const paintCtx = paintCanvas.getContext('2d');
  paintCtx.fillStyle = '#4b5a3d';
  paintCtx.fillRect(0, 0, 512, 512);
  const camoColors = ['#303b31', '#66704a', '#7a7657', '#3b4938', '#817b5b'];
  for (let patch = 0; patch < 38; patch++) {
    const cx = random() * 512, cy = random() * 512;
    const rx = 16 + random() * 46, ry = 9 + random() * 27;
    const points = 8 + (random() * 5 | 0);
    paintCtx.beginPath();
    for (let i = 0; i <= points; i++) {
      const a = i / points * Math.PI * 2;
      const wobble = .72 + random() * .48;
      const px = cx + Math.cos(a) * rx * wobble;
      const py = cy + Math.sin(a) * ry * wobble;
      if (i === 0) paintCtx.moveTo(px, py);
      else paintCtx.lineTo(px, py);
    }
    paintCtx.closePath();
    paintCtx.fillStyle = camoColors[random() * camoColors.length | 0];
    paintCtx.fill();
  }
  for (let i = 0; i < 1800; i++) {
    paintCtx.fillStyle = random() > .5 ? 'rgba(225,216,180,.10)' : 'rgba(20,26,22,.12)';
    paintCtx.fillRect(random() * 512, random() * 512, 1 + random() * 2, 1 + random() * 2);
  }
  const paint = new T.CanvasTexture(paintCanvas);
  paint.wrapS = paint.wrapT = T.RepeatWrapping;
  paint.repeat.set(1.35, 1.35);
  paint.anisotropy = typeof ren !== 'undefined' ? Math.min(6, ren.capabilities.getMaxAnisotropy()) : 1;
  if ('colorSpace' in paint && T.SRGBColorSpace) paint.colorSpace = T.SRGBColorSpace;
  else paint.encoding = T.sRGBEncoding;
  jm.map = paint;
  jm.color.set(0xffffff);
  jm.needsUpdate = true;

  const plateMat = new T.MeshStandardMaterial({ color: 0x687151, roughness: .84, metalness: .2 });
  const darkMat = new T.MeshStandardMaterial({ color: 0x252b27, roughness: .78, metalness: .38 });
  const edgeMat = new T.MeshStandardMaterial({ color: 0x879073, roughness: .8, metalness: .24 });
  const rubberMat = new T.MeshStandardMaterial({ color: 0x303331, roughness: .96, metalness: .02 });
  const addBox = (w, h, d, material, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = mesh.receiveShadow = true;
    vehicle.add(mesh);
    return mesh;
  };

  // Blocs de sculpture sur les huit pneus, réunis en un seul mesh instancié.
  const tireDetails = new T.InstancedMesh(new T.BoxGeometry(.36, .095, .16), rubberMat, 8 * 14);
  const wheel = new T.Object3D();
  let tireIndex = 0;
  for (const side of [-1, 1]) for (const z of [-1.68, -.58, .58, 1.68]) {
    for (let i = 0; i < 14; i++) {
      const angle = i / 14 * Math.PI * 2;
      wheel.position.set(side * 1.27, .48 + Math.cos(angle) * .46, z + Math.sin(angle) * .46);
      wheel.rotation.set(angle, 0, 0);
      wheel.updateMatrix();
      tireDetails.setMatrixAt(tireIndex++, wheel.matrix);
    }
  }
  tireDetails.instanceMatrix.needsUpdate = true;
  vehicle.add(tireDetails);

  // Plaques latérales boulonnées, rangements et marchepieds.
  const boltPoints = [];
  for (const side of [-1, 1]) {
    for (const z of [-1.42, -.48, .48, 1.36]) {
      addBox(.07, .43, .64, plateMat, side * 1.247, 1.28, z, 0, 0, side * -.035);
      for (const y of [1.11, 1.45]) for (const dz of [-.25, .25]) {
        boltPoints.push({ x: side * 1.287, y, z: z + dz });
      }
    }
    addBox(.15, .42, .7, darkMat, side * 1.3, 1.35, -1.43);
    addBox(.025, .31, .055, edgeMat, side * 1.383, 1.35, -1.43);
    addBox(.42, .075, .18, darkMat, side * 1.36, .7, .18);
    for (const z of [-1.68, -.58, .58, 1.68]) {
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        boltPoints.push({
          x: side * 1.46,
          y: .48 + Math.cos(a) * .17,
          z: z + Math.sin(a) * .17,
          wheel: true
        });
      }
    }
  }
  const bolts = new T.InstancedMesh(new T.CylinderGeometry(.027, .027, .028, 8), edgeMat, boltPoints.length);
  const bolt = new T.Object3D();
  boltPoints.forEach((p, i) => {
    bolt.position.set(p.x, p.y, p.z);
    bolt.rotation.set(0, 0, Math.PI / 2);
    bolt.scale.setScalar(p.wheel ? .9 : 1);
    bolt.updateMatrix();
    bolts.setMatrixAt(i, bolt.matrix);
  });
  bolts.instanceMatrix.needsUpdate = true;
  vehicle.add(bolts);

  // Calandre, prises d’air du capot et protections de phares.
  addBox(.82, .34, .035, darkMat, 0, 1.02, 2.397);
  for (let i = 0; i < 9; i++) addBox(.035, .27, .025, edgeMat, -.34 + i * .085, 1.02, 2.422);
  for (const x of [-.88, .88]) {
    addBox(.34, .045, .08, darkMat, x, 1.31, 2.43);
    addBox(.34, .045, .08, darkMat, x, 1.05, 2.43);
    addBox(.045, .22, .075, edgeMat, x - .16, 1.18, 2.43);
    addBox(.045, .22, .075, edgeMat, x + .16, 1.18, 2.43);
  }
  for (let i = 0; i < 6; i++) addBox(.65, .035, .09, darkMat, 0, 1.82, 1.42 + i * .12);

  // Trappe arrière, antenne radio et crochets de remorquage.
  addBox(.78, .055, .62, darkMat, 0, 2.405, -1.38);
  addBox(.62, .035, .48, plateMat, 0, 2.45, -1.38);
  addBox(.045, .13, .08, edgeMat, -.26, 2.53, -1.38);
  addBox(.045, .13, .08, edgeMat, .26, 2.53, -1.38);
  const antenna = new T.Mesh(new T.CylinderGeometry(.009, .026, 1.05, 7), darkMat);
  antenna.position.set(-.92, 2.92, -1.62);
  antenna.rotation.z = -.045;
  antenna.castShadow = true;
  vehicle.add(antenna);
  for (const z of [-2.5, 2.5]) for (const x of [-.72, .72]) {
    const hook = new T.Mesh(new T.TorusGeometry(.105, .027, 7, 12), steel);
    hook.position.set(x, .61, z);
    hook.rotation.x = Math.PI / 2;
    hook.castShadow = true;
    vehicle.add(hook);
  }

  // Marquage tactique discret sur les deux flancs.
  const decalCanvas = document.createElement('canvas');
  decalCanvas.width = 320; decalCanvas.height = 96;
  const decalCtx = decalCanvas.getContext('2d');
  decalCtx.fillStyle = 'rgba(27,34,28,.9)';
  decalCtx.fillRect(0, 8, 320, 80);
  decalCtx.strokeStyle = '#b7b99b'; decalCtx.lineWidth = 4;
  decalCtx.strokeRect(4, 12, 312, 72);
  decalCtx.fillStyle = '#d9d4b5';
  decalCtx.font = 'bold 48px Arial'; decalCtx.fillText('WW / 08', 18, 59);
  decalCtx.font = 'bold 15px Arial'; decalCtx.fillText('INFANTRY CARRIER', 184, 76);
  const decalTexture = new T.CanvasTexture(decalCanvas);
  if ('colorSpace' in decalTexture && T.SRGBColorSpace) decalTexture.colorSpace = T.SRGBColorSpace;
  else decalTexture.encoding = T.sRGBEncoding;
  const decalMat = new T.MeshBasicMaterial({ map: decalTexture, transparent: true, side: T.DoubleSide, depthWrite: false, toneMapped: false });
  for (const side of [-1, 1]) {
    const decal = new T.Mesh(new T.PlaneGeometry(.84, .25), decalMat);
    decal.position.set(side * 1.29, 1.62, -1.9);
    decal.rotation.y = side * Math.PI / 2;
    vehicle.add(decal);
  }

  window.dsBuildInfo = { ...(window.dsBuildInfo || {}), graphicsVersion: 'V27-APC' };
})();
