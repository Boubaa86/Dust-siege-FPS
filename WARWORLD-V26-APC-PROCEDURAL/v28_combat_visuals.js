/* WARWORLD V28 — équipement de combat visuel, sans changement de dégâts. */
(() => {
  if (!window.THREE) return;
  const T = window.THREE;

  // Finition du fusil à la première personne : rails, visée mécanique,
  // garde-main ventilé, chargeur et poignée avant. Les tirs restent inchangés.
  if (typeof vm !== 'undefined' && vm && typeof vp === 'function' && !vm.getObjectByName('DSV28WeaponFinish')) {
    const gun = new T.Group();
    gun.name = 'DSV28WeaponFinish';
    const polymer = new T.MeshStandardMaterial({ color: 0x343b36, roughness: .76, metalness: .2 });
    const railMetal = new T.MeshStandardMaterial({ color: 0x171d1d, roughness: .52, metalness: .62 });
    const ventMat = new T.MeshStandardMaterial({ color: 0x101514, roughness: .82, metalness: .18 });
    const add = (geometry, material, x, y, z, rx = 0, ry = 0, rz = 0, paintable = false) => {
      const mesh = new T.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      mesh.castShadow = true;
      if (paintable) mesh.userData.dsWeaponBase = true;
      gun.add(mesh);
      return mesh;
    };
    add(new T.BoxGeometry(.105, .09, .34), polymer, 0, -.002, -.31, 0, 0, 0, true);
    add(new T.BoxGeometry(.12, .022, .41), railMetal, 0, .064, -.285);
    add(new T.BoxGeometry(.10, .055, .09), polymer, 0, .005, .005, 0, 0, 0, true);
    add(new T.BoxGeometry(.078, .18, .12), polymer, 0, -.13, .105, .22, 0, 0, true);
    add(new T.BoxGeometry(.058, .14, .065), railMetal, .02, -.095, -.38, .12);
    add(new T.BoxGeometry(.085, .105, .2), polymer, 0, -.012, .30, 0, 0, 0, true);
    add(new T.BoxGeometry(.092, .12, .035), railMetal, 0, -.012, .414);

    // Relief des rails et évents latéraux regroupés par instanciation.
    const rail = new T.InstancedMesh(new T.BoxGeometry(.092, .018, .025), railMetal, 10);
    const railPart = new T.Object3D();
    for (let i = 0; i < 10; i++) {
      railPart.position.set(0, .079, -.47 + i * .041);
      railPart.updateMatrix();
      rail.setMatrixAt(i, railPart.matrix);
    }
    rail.instanceMatrix.needsUpdate = true;
    gun.add(rail);
    const vents = new T.InstancedMesh(new T.BoxGeometry(.012, .014, .052), ventMat, 12);
    const vent = new T.Object3D();
    let ventIndex = 0;
    for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
      vent.position.set(side * .057, .012, -.45 + i * .055);
      vent.rotation.y = side * .08;
      vent.updateMatrix();
      vents.setMatrixAt(ventIndex++, vent.matrix);
    }
    vents.instanceMatrix.needsUpdate = true;
    gun.add(vents);

    // Guidon et hausse visibles même sans lunette achetée.
    add(new T.BoxGeometry(.035, .075, .045), railMetal, 0, .106, -.52);
    add(new T.BoxGeometry(.012, .045, .018), polymer, 0, .163, -.52);
    add(new T.BoxGeometry(.07, .028, .035), railMetal, 0, .104, .035);
    add(new T.BoxGeometry(.018, .048, .02), polymer, 0, .14, .035);
    add(new T.CylinderGeometry(.024, .032, .1, 10), railMetal, 0, .015, -.675, Math.PI / 2);

    // Gravure de contrôle sur le boîtier, ton sur ton.
    add(new T.BoxGeometry(.032, .022, .09), railMetal, .055, .016, -.075);
    add(new T.CylinderGeometry(.012, .012, .012, 8), polymer, -.057, .014, .045, 0, 0, Math.PI / 2);
    vm.add(gun);
    if (typeof applyWeaponSkin === 'function') applyWeaponSkin();
  }

  // Kit de protection partagé par les ennemis. Les pièces décoratives ne
  // participent pas au raycast : les hitboxes et dégâts du jeu restent identiques.
  if (typeof mkEn === 'function' && typeof en !== 'undefined' && !mkEn.__wwV28) {
    const armorColors = [0x485b41, 0x625b45, 0x39464a];
    const gearMaterial = new T.MeshStandardMaterial({ vertexColors: true, roughness: .93, metalness: .035 });
    const vests = new T.BoxGeometry(.46, .43, .085);
    const pouches = new T.BoxGeometry(.12, .13, .07);
    const shoulders = new T.SphereGeometry(.12, 10, 8);
    const knees = new T.BoxGeometry(.22, .16, .085);
    const straps = new T.BoxGeometry(.045, .46, .035);
    const nvg = new T.BoxGeometry(.15, .055, .06);
    const radio = new T.BoxGeometry(.24, .34, .15);
    const antenna = new T.CylinderGeometry(.008, .014, .42, 6);
    const patch = new T.BoxGeometry(.105, .09, .018);
    const addPart = (parts, geometry, materialColor, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
      const object = new T.Object3D();
      object.position.set(x, y, z);
      object.rotation.set(rx, ry, rz);
      object.scale.set(sx, sy, sz);
      object.updateMatrix();
      const transformed = geometry.clone();
      transformed.applyMatrix4(object.matrix);
      const flat = transformed.index ? transformed.toNonIndexed() : transformed;
      const position = flat.getAttribute('position');
      const normal = flat.getAttribute('normal');
      const color = new T.Color(materialColor);
      for (let i = 0; i < position.count; i++) {
        parts.positions.push(position.getX(i), position.getY(i), position.getZ(i));
        parts.normals.push(normal.getX(i), normal.getY(i), normal.getZ(i));
        parts.colors.push(color.r, color.g, color.b);
      }
      transformed.dispose();
      if (flat !== transformed) flat.dispose();
    };
    const buildGearGeometry = (variant) => {
      const parts = { positions: [], normals: [], colors: [] };
      const vestColor = armorColors[variant];
      const darkColor = 0x292f2b;
      const trimColor = 0x171c1a;
      addPart(parts, vests, vestColor, 0, 1.37, .12);
      for (const x of [-.16, 0, .16]) addPart(parts, pouches, darkColor, x, 1.18, .205);
      for (const side of [-1, 1]) {
        addPart(parts, shoulders, vestColor, side * .27, 1.49, .075, 0, 0, 0, 1.08, .82, 1.05);
        addPart(parts, knees, trimColor, side * .11, .53, .13);
        addPart(parts, straps, trimColor, side * .145, 1.38, .208, 0, 0, side * -.15);
      }
      addPart(parts, radio, 0x303a32, -.2, 1.4, -.18);
      addPart(parts, antenna, trimColor, -.27, 1.77, -.19, 0, 0, -.1);
      addPart(parts, nvg, trimColor, 0, 1.81, .153);
      addPart(parts, patch, [0x9e4936, 0xb39350, 0x557b83][variant], .17, 1.48, .17);
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.Float32BufferAttribute(parts.positions, 3));
      geometry.setAttribute('normal', new T.Float32BufferAttribute(parts.normals, 3));
      geometry.setAttribute('color', new T.Float32BufferAttribute(parts.colors, 3));
      geometry.computeBoundingSphere();
      return geometry;
    };
    const gearGeometries = armorColors.map((_, variant) => buildGearGeometry(variant));
    const makeGear = (enemy) => {
      const mesh = new T.Mesh(gearGeometries[enemy.id % gearGeometries.length], gearMaterial);
      mesh.name = 'DSV28AssaultKit';
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.raycast = () => {};
      enemy.g.add(mesh);
    };

    const createEnemy = mkEn;
    const decorated = function(...args) {
      const count = en.length;
      const result = createEnemy.apply(this, args);
      if (en.length > count) makeGear(en[en.length - 1]);
      return result;
    };
    decorated.__wwV28 = true;
    mkEn = decorated;
  }

  window.dsBuildInfo = { ...(window.dsBuildInfo || {}), combatGraphicsVersion: 'V28' };
})();
