
/* SERVI TRAILER — 3D Viewer (Three.js) */
(function(){
  const BRAND = 0xF2C200;

  let overlay, canvas, renderer, scene, camera, controls;
  let groups = {};
  let activeModel = "plataforma";
  let animId = null;
  let startTs = 0;

  function el(tag, attrs={}, children=[]){
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else n.setAttribute(k, v);
    });
    children.forEach(c => n.appendChild(c));
    return n;
  }

  function ensureModal(){
    if (overlay) return;

    overlay = el("div", { class: "st3dOverlay", role:"dialog", "aria-modal":"true", "aria-label":"Vista 3D" });
    const modal = el("div", { class: "st3dModal" });

    const titleBox = el("div", { class:"st3dTitle" }, [
      el("h3", { html: "Vista 3D (interactiva)" }),
      el("p", { html: "Arrastra para girar • Scroll para zoom • Doble clic para reset" })
    ]);

    const chips = el("div", { class:"st3dChips" }, [
      el("button", { class:"st3dChip isActive", type:"button", "data-model":"plataforma", html:"Plataforma" }),
      el("button", { class:"st3dChip", type:"button", "data-model":"volco", html:"Volco" }),
      el("button", { class:"st3dChip", type:"button", "data-model":"tanque", html:"Tanque" })
    ]);

    const tools = el("div", { class:"st3dTools" }, [
      chips,
      el("button", { class:"btn btnGhost", type:"button", id:"st3dReset", html:"Reset" })
    ]);

    const closeBtn = el("button", { class:"st3dClose", type:"button", "aria-label":"Cerrar", html:"✕" });

    const header = el("div", { class:"st3dHeader" }, [
      titleBox,
      el("div", { style:"display:flex; gap:10px; align-items:center;" }, [ tools, closeBtn ])
    ]);

    const wrap = el("div", { class:"st3dCanvasWrap" });
    canvas = el("canvas", { class:"st3dCanvas", id:"st3dCanvas" });
    wrap.appendChild(canvas);

    const footer = el("div", { class:"st3dFooter" }, [
      el("div", { class:"st3dHint", html:"Tip: si tu PC va lenta, pausa el auto-rotar con el mouse encima." }),
      el("a", { class:"btn btnPrimary", href:"../../cotizar/index.html", html:"Cotizar" })
    ]);

    modal.appendChild(header);
    modal.appendChild(wrap);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Events
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("isOpen")) close();
    });

    chips.querySelectorAll(".st3dChip").forEach(btn => {
      btn.addEventListener("click", () => {
        chips.querySelectorAll(".st3dChip").forEach(b => b.classList.remove("isActive"));
        btn.classList.add("isActive");
        setActive(btn.getAttribute("data-model") || "plataforma");
      });
    });

    const reset = modal.querySelector("#st3dReset");
    reset.addEventListener("click", () => resetView());
    canvas.addEventListener("dblclick", () => resetView());
    canvas.addEventListener("mouseenter", () => { if (controls) controls.autoRotate = false; });
    canvas.addEventListener("mouseleave", () => { if (controls) controls.autoRotate = true; });

    // Guard if Three isn't available
    if (!window.THREE) {
      wrap.innerHTML = '<div style="height:100%; display:grid; place-items:center; padding:18px; color:#fff; text-align:center;">' +
        '<div><div style="font-weight:800; font-size:18px; margin-bottom:6px;">No se pudo cargar la vista 3D</div>' +
        '<div style="opacity:.85;">Revisa tu conexión a internet (cargamos Three.js desde CDN).</div></div></div>';
      return;
    }

    initThree();
  }

  function open(){
    ensureModal();
    overlay.classList.add("isOpen");
    if (renderer) {
      resize();
      start();
    }
  }

  function close(){
    if (!overlay) return;
    overlay.classList.remove("isOpen");
    stop();
  }

  function initThree(){
    const THREE = window.THREE;

    renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b1020, 10, 45);

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(10.5, 6.5, 14.5);

    // OrbitControls (legacy)
    try{
      controls = new THREE.OrbitControls(camera, renderer.domElement);
    }catch(err){
      // In some CDN combos OrbitControls attaches to window
      if (window.OrbitControls) controls = new window.OrbitControls(camera, renderer.domElement);
    }
    if (controls){
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 7;
      controls.maxDistance = 28;
      controls.maxPolarAngle = Math.PI * 0.48;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.7;
      controls.target.set(0, 2.0, 0);
      controls.update();
    }

    // Lights
    const hemi = new THREE.HemisphereLight(0xbfd3ff, 0x131a2f, 0.85);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(10, 18, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 60;
    key.shadow.camera.left = -22;
    key.shadow.camera.right = 22;
    key.shadow.camera.top = 22;
    key.shadow.camera.bottom = -22;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x9fc3ff, 0.55);
    rim.position.set(-16, 10, -14);
    scene.add(rim);

    const accent = new THREE.PointLight(BRAND, 0.55, 55, 2);
    accent.position.set(0, 9, 0);
    scene.add(accent);

    // Ground
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0c1326, roughness: 0.9, metalness: 0.05
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), groundMat);
    ground.rotation.x = -Math.PI/2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle grid lines
    const grid = new THREE.GridHelper(80, 40, 0x1a2a56, 0x121c3a);
    grid.position.y = 0.01;
    grid.material.opacity = 0.22;
    grid.material.transparent = true;
    scene.add(grid);

    // Models
    groups.plataforma = buildPlataforma();
    groups.volco = buildVolco();
    groups.tanque = buildTanque();

    Object.values(groups).forEach(g => scene.add(g));
    setActive(activeModel);

    // Resize
    window.addEventListener("resize", resize, { passive:true });
    resize();
  }

  function resize(){
    if (!renderer || !camera) return;
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function resetView(){
    if (!camera || !controls) return;
    camera.position.set(10.5, 6.5, 14.5);
    controls.target.set(0, 2.0, 0);
    controls.update();
  }

  function setActive(name){
    activeModel = name;
    Object.entries(groups).forEach(([k,g]) => { g.visible = (k === name); });
    // Slightly adjust target per model
    if (controls){
      if (name === "tanque") controls.target.set(0, 2.3, 0);
      else controls.target.set(0, 2.0, 0);
      controls.update();
    }
  }

  function start(){
    if (animId) return;
    startTs = performance.now();
    tick(startTs);
  }
  function stop(){
    if (!animId) return;
    cancelAnimationFrame(animId);
    animId = null;
  }

  function tick(ts){
    animId = requestAnimationFrame(tick);
    const t = (ts - startTs) / 1000;

    if (controls) controls.update();

    // Volco dumping animation
    const volco = groups.volco;
    if (volco && volco.visible){
      const bed = volco.userData && volco.userData.bedPivot;
      const bits = volco.userData && volco.userData.bits;
      const phase = (t % 8) / 8; // 0..1
      const up = phase < 0.45 ? easeInOut(phase/0.45) : (phase < 0.75 ? 1 : 1 - easeInOut((phase-0.75)/0.25));
      if (bed) bed.rotation.z = -up * 0.85;

      if (bits && bits.length){
        const spill = up > 0.55 ? (up - 0.55) / 0.45 : 0;
        bits.forEach((b,i) => {
          if (spill <= 0){
            b.position.set(b.userData.x0, b.userData.y0, b.userData.z0);
            b.visible = true;
            return;
          }
          // simple falling
          b.position.y = b.userData.y0 - spill * (2.2 + (i%5)*0.12);
          b.position.x = b.userData.x0 + spill * (0.9 + (i%3)*0.1);
          b.position.z = b.userData.z0 + Math.sin(t*2 + i)*0.06;
          if (b.position.y < 0.25) b.visible = false;
        });
      }
    }

    // Tank subtle inspection motion (people bob)
    const tanque = groups.tanque;
    if (tanque && tanque.visible){
      const people = tanque.userData && tanque.userData.people;
      if (people){
        people.forEach((p,i) => {
          p.position.y = 0.9 + Math.sin(t*1.3 + i)*0.05;
        });
      }
    }

    renderer.render(scene, camera);
  }

  function easeInOut(x){
    return x<0.5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2;
  }

  // --- Model builders ---
  function matStandard(color, metalness, roughness){
    const THREE = window.THREE;
    return new THREE.MeshStandardMaterial({ color, metalness, roughness });
  }

  function buildWheel(){
    const THREE = window.THREE;
    const g = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.62,0.38,28,1,true), matStandard(0x101010, 0.08, 0.92));
    tire.rotation.z = Math.PI/2;
    tire.castShadow = true;

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.40,24), matStandard(0xf0f0f0, 0.9, 0.18));
    rim.rotation.z = Math.PI/2;
    rim.castShadow = true;

    g.add(tire); g.add(rim);
    return g;
  }

  function buildPlataforma(){
    const THREE = window.THREE;
    const group = new THREE.Group();

    const paintBlue = matStandard(0x1b64d6, 0.55, 0.35);
    const steelDark = matStandard(0x1a1f2a, 0.65, 0.38);
    const steel = matStandard(0xd9dde4, 0.85, 0.28);
    const accent = matStandard(BRAND, 0.65, 0.32);

    // Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.18, 2.6), steelDark);
    deck.position.set(0, 2.25, 0);
    deck.castShadow = true; deck.receiveShadow = true;
    group.add(deck);

    // Side rails
    const railL = new THREE.Mesh(new THREE.BoxGeometry(12.1, 0.18, 0.12), steel);
    railL.position.set(0, 2.38, -1.26);
    const railR = railL.clone();
    railR.position.z = 1.26;
    railL.castShadow = railR.castShadow = true;
    group.add(railL); group.add(railR);

    // Chassis beams
    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.20, 0.16), paintBlue);
    beam1.position.set(0, 1.65, -0.65);
    const beam2 = beam1.clone();
    beam2.position.z = 0.65;
    group.add(beam1); group.add(beam2);

    // Landing legs
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 0.18), steelDark);
    leg.position.set(-2.2, 0.6, -0.9); leg.castShadow = true;
    const leg2 = leg.clone(); leg2.position.z = 0.9;
    group.add(leg); group.add(leg2);

    // Wheels: 3 axles
    const axZ = [ -1.05, 0, 1.05 ];
    const axleX = [ 3.9, 5.0, 6.1 ];
    axleX.forEach((x, ai) => {
      axZ.forEach(z => {
        const w = buildWheel();
        w.position.set(x, 0.62, z);
        group.add(w);
      });
      axZ.forEach(z => {
        const w = buildWheel();
        w.position.set(x, 0.62, z+0.75);
        group.add(w);
      });
    });

    // Rear bumper & lights
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 2.7), paintBlue);
    bumper.position.set(6.25, 1.45, 0);
    bumper.castShadow = true;
    group.add(bumper);

    const lightL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), accent);
    lightL.position.set(6.45, 1.55, -1.15);
    const lightR = lightL.clone(); lightR.position.z = 1.15;
    group.add(lightL); group.add(lightR);

    group.position.y = 0;
    group.rotation.y = Math.PI * 0.10;

    return group;
  }

  function buildVolco(){
    const THREE = window.THREE;
    const group = new THREE.Group();

    const paint = matStandard(0x0f2e55, 0.6, 0.35);
    const body = matStandard(0x2a2f3b, 0.55, 0.45);
    const steel = matStandard(0xd9dde4, 0.85, 0.28);
    const accent = matStandard(BRAND, 0.65, 0.32);

    // Base frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(11.3, 0.22, 2.6), paint);
    frame.position.set(0, 1.55, 0);
    frame.castShadow = true; frame.receiveShadow = true;
    group.add(frame);

    // Wheels: 3 axles
    const axleX = [ 3.4, 4.5, 5.6 ];
    const sideZ = [ -1.05, 1.05 ];
    axleX.forEach(x => {
      sideZ.forEach(z => {
        const w = buildWheel();
        w.position.set(x, 0.62, z);
        group.add(w);
      });
    });

    // Dump bed pivot at rear
    const bedPivot = new THREE.Group();
    bedPivot.position.set(4.9, 1.85, 0); // pivot point
    group.add(bedPivot);

    const bed = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.25, 2.45), body);
    bed.position.set(-2.7, 0.85, 0);
    bed.castShadow = true; bed.receiveShadow = true;
    bedPivot.add(bed);

    // Bed side ribs
    for (let i=0;i<6;i++){
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.05, 2.46), steel);
      rib.position.set(-5.55 + i*1.05, 0.85, 0);
      rib.castShadow = true;
      bedPivot.add(rib);
    }

    // Tailgate
    const gate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 2.25), steel);
    gate.position.set(0.35, 0.78, 0);
    gate.castShadow = true;
    bedPivot.add(gate);

    // Hydraulic cylinder
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 3.3, 18), steel);
    cyl.position.set(-4.4, 0.6, 0);
    cyl.rotation.z = Math.PI/2.4;
    cyl.castShadow = true;
    group.add(cyl);

    // Material bits (small cubes that "spill")
    const bits = [];
    const bitMat = new THREE.MeshStandardMaterial({ color: 0x8a6a3f, roughness: 0.95, metalness: 0.0 });
    for (let i=0;i<26;i++){
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.14), bitMat);
      const x0 = -4.9 + Math.random()*2.6;
      const y0 = 2.6 + Math.random()*0.35;
      const z0 = (-0.85 + Math.random()*1.7);
      b.userData = { x0, y0, z0 };
      b.position.set(x0, y0, z0);
      b.castShadow = true;
      group.add(b);
      bits.push(b);
    }

    // Accent lights
    const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), accent);
    l1.position.set(5.9, 1.65, -1.1);
    const l2 = l1.clone(); l2.position.z = 1.1;
    group.add(l1); group.add(l2);

    group.userData = { bedPivot, bits };
    group.rotation.y = -Math.PI * 0.08;

    return group;
  }

  function buildTanque(){
    const THREE = window.THREE;
    const group = new THREE.Group();

    const red = matStandard(0xc01c1c, 0.55, 0.35);
    const inox = matStandard(0xe7eaef, 0.95, 0.16);
    const dark = matStandard(0x161b26, 0.55, 0.55);
    const accent = matStandard(BRAND, 0.65, 0.32);

    // Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.22, 2.55), red);
    frame.position.set(0, 1.55, 0);
    frame.castShadow = true;
    group.add(frame);

    // Tank
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 9.8, 44, 1, false), inox);
    tank.rotation.z = Math.PI/2;
    tank.position.set(-0.3, 3.05, 0);
    tank.castShadow = true; tank.receiveShadow = true;
    group.add(tank);

    // End caps (slightly bulged)
    const capGeo = new THREE.SphereGeometry(1.26, 40, 26);
    const cap1 = new THREE.Mesh(capGeo, inox);
    cap1.position.set(-5.2, 3.05, 0);
    cap1.scale.set(0.65, 1.0, 1.0);
    cap1.castShadow = true;
    const cap2 = cap1.clone();
    cap2.position.x = 4.6;
    group.add(cap1); group.add(cap2);

    // Supports
    for (let i=0;i<4;i++){
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.0, 2.2), red);
      s.position.set(-3.8 + i*2.7, 1.95, 0);
      s.castShadow = true;
      group.add(s);
    }

    // Wheels
    const axleX = [ 3.1, 4.2, 5.3 ];
    const sideZ = [ -1.05, 1.05 ];
    axleX.forEach(x => {
      sideZ.forEach(z => {
        const w = buildWheel();
        w.position.set(x, 0.62, z);
        group.add(w);
      });
    });

    // Ladder
    const ladder = new THREE.Group();
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.6, 0.08), dark);
    const rail2 = rail.clone();
    rail.position.set(-5.2, 2.4, -0.45);
    rail2.position.set(-5.2, 2.4, -0.75);
    ladder.add(rail); ladder.add(rail2);
    for (let i=0;i<6;i++){
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.08), dark);
      step.position.set(-5.2, 1.3 + i*0.33, -0.6);
      ladder.add(step);
    }
    ladder.castShadow = true;
    group.add(ladder);

    // People silhouettes (inspection)
    const people = [];
    for (let i=0;i<3;i++){
      const p = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.75, 14), dark);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 14), dark);
      head.position.y = 0.52;
      body.castShadow = head.castShadow = true;
      p.add(body); p.add(head);
      p.position.set(-1.8 + i*1.15, 0.9, 1.65);
      p.rotation.y = Math.PI * (0.9 + i*0.06);
      group.add(p);
      people.push(p);
    }
    group.userData = { people };

    // Accent badge
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.02), accent);
    badge.position.set(-0.3, 3.05, 1.28);
    badge.castShadow = true;
    group.add(badge);

    group.rotation.y = Math.PI * 0.12;
    return group;
  }

  function wireButtons(){
    document.querySelectorAll("[data-open-3d]").forEach(btn => {
      if (btn.dataset.bound3d) return;
      btn.dataset.bound3d = "1";
      btn.addEventListener("click", () => open());
    });
  }

  function mount(){
    wireButtons();
  }

  window.addEventListener("load", mount);
})();
