/* Architectural study: local GLB, slow rotation, screen-local point-cloud reveal. */
import * as THREE from './vendor/three/three.module.min.js';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { sampleSurfacePoints } from './spatial-sampling.js';

const host = document.querySelector('.spatial-header');
if (host) initialize(host).catch(error => {
  host.hidden = true;
  console.warn('Architectural header unavailable; profile remains accessible.', error);
});

async function initialize(host) {
  const viewport = host.querySelector('.spatial-viewport');
  const isGate = host.dataset.model !== 'mobius';
  const modelPath = isGate ? 'tsinghua-gate.glb' : 'mobius-metal.glb';
  const model = await new GLTFLoader().loadAsync(new URL('../models/' + modelPath, import.meta.url).href);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0xf8f8fa, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', "Slowly rotating architectural study of Tsinghua University's Second Gate. Hover to reveal local point clouds. Space pauses rotation; arrow keys move the reveal area.");
  canvas.style.touchAction = 'pan-y';
  viewport.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 50);
  camera.position.set(.3, 4.15, 11.5);
  camera.lookAt(0, 1.86, 0);
  const turntable = new THREE.Group();
  turntable.rotation.y = -.28;
  scene.add(turntable);
  const gate = model.scene;
  if (isGate) { gate.scale.setScalar(.56); gate.position.y = .22; }
  else gate.traverse(mesh => { if (mesh.isMesh) mesh.material.envMapIntensity = 1.7; });
  const description = isGate ? "Tsinghua University's Second Gate" : 'a metallic Möbius ribbon';
  canvas.setAttribute('aria-label', 'Slowly rotating ' + description + '. Hover to reveal local point clouds. Space pauses rotation; arrow keys move the reveal area.');
  turntable.add(gate);
  gate.updateMatrixWorld(true);

  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .03);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7a837b, 2));
  const sunlight = new THREE.DirectionalLight(0xfffcf4, 3.2);
  sunlight.position.set(-3, 7, 5);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);
  sunlight.shadow.camera.left = sunlight.shadow.camera.bottom = -4;
  sunlight.shadow.camera.right = sunlight.shadow.camera.top = 4;
  sunlight.shadow.normalBias = .015;
  scene.add(sunlight);
  const fill = new THREE.DirectionalLight(0xe7edf2, 1.4);
  fill.position.set(5, 3, -2); scene.add(fill);
  // A quiet coordinate stage stays fixed while the model and circular plinth rotate.
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(3.08, 3.14, .2, 96),
    new THREE.MeshStandardMaterial({ color: 0xdedfdc, roughness: .65, metalness: .12 })
  );
  pedestal.position.y = .1;
  pedestal.receiveShadow = true;
  pedestal.castShadow = true;
  turntable.add(pedestal);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(3.08, .013, 8, 96),
    new THREE.MeshStandardMaterial({ color: 0x929994, roughness: .5, metalness: .28 })
  );
  rim.rotation.x = -Math.PI / 2; rim.position.y = .196; turntable.add(rim);
  const grid = new THREE.GridHelper(10.8, 9, 0xb1b8bc, 0xc9ced1);
  grid.position.y = -.017;
  grid.material.transparent = true;
  grid.material.opacity = .37;
  grid.material.depthWrite = false;
  scene.add(grid);
  // Sparse vertical reference lines suggest a volume without enclosing the model.
  const gridSegments = [];
  for (const x of [-4.8,-2.4,0,2.4,4.8]) gridSegments.push(x,0,-3.6,x,5.2,-3.6);
  for (const y of [1.2,2.4,3.6,4.8]) gridSegments.push(-4.8,y,-3.6,4.8,y,-3.6);
  const gridBack = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(gridSegments,3)),
    new THREE.LineBasicMaterial({ color: 0xc6cccf, transparent: true, opacity: .21, depthWrite: false })
  );
  scene.add(gridBack);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: .12 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.018; ground.receiveShadow = true;
  scene.add(ground);

  // The same screen-space mask drives both surface dissolve and point visibility.
  const uniforms = {
    uPointer: { value: new THREE.Vector2(-10000, -10000) },
    uRadius: { value: 54 },
    uHover: { value: 0 },
    uPointSize: { value: 2.4 }
  };
  const maskSource = `
    uniform vec2 uPointer;
    uniform float uRadius;
    uniform float uHover;
    float localReveal() {
      return (1.0 - smoothstep(uRadius * 0.48, uRadius, distance(gl_FragCoord.xy, uPointer))) * uHover;
    }
  `;
  function applyReveal(material) {
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\n' + maskSource);
      shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', `
        #include <clipping_planes_fragment>
        float reveal = localReveal();
        float threshold = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453);
        if (reveal > threshold) discard;
      `);
    };
    material.customProgramCacheKey = () => 'spatial-local-reveal-v2';
  }

  // Uniform triangle-area sampling avoids concentrations around low-poly corners.
  const cloudMaterial = new THREE.ShaderMaterial({
    uniforms,
    transparent: true, depthWrite: false, depthTest: true,
    vertexShader: `
      uniform float uPointSize;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uPointSize;
      }
    `,
    fragmentShader: maskSource + `
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alpha = localReveal() * (1.0 - smoothstep(0.28, 0.5, d));
        if (alpha < 0.025) discard;
        gl_FragColor = vec4(0.065, 0.065, 0.065, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  });
  function prepareModel(root, outlined) {
    const meshes = [], materials = new Set();
    root.traverse(mesh => { if (mesh.isMesh) { meshes.push(mesh); materials.add(mesh.material); mesh.castShadow = true; mesh.receiveShadow = true; } });
    materials.forEach(material => {
      applyReveal(material);
      if (outlined) { material.polygonOffset = true; material.polygonOffsetFactor = 1; material.polygonOffsetUnits = 1; }
    });
    if (outlined) {
      const edgeMaterial = new THREE.LineBasicMaterial({color:0x101010,transparent:true,opacity:.64,depthWrite:false});
      applyReveal(edgeMaterial);
      for (const mesh of meshes) {
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,26),edgeMaterial);
        edges.name = mesh.name + '_outline'; mesh.add(edges);
      }
    }
    const cloud = new THREE.Points(sampleSurfacePoints(root,26000),cloudMaterial);
    cloud.renderOrder = 2; root.add(cloud);
  }
  prepareModel(gate,isGate);

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motionPreference.matches;
  let hovering = false, visible = true, lost = false, disposed = false;
  let frame = 0, previous = 0;
  const pointerUV = new THREE.Vector2(.5, .5);
  function updatePointer() {
    const width = canvas.width, height = canvas.height;
    uniforms.uPointer.value.set(pointerUV.x * width, (1 - pointerUV.y) * height);
    uniforms.uRadius.value = Math.min(56, viewport.clientWidth * .155) * renderer.getPixelRatio();
    uniforms.uPointSize.value = 1.7 * renderer.getPixelRatio();
  }
  function render() { if (!lost && !disposed) renderer.render(scene, camera); }
  function needsFrame() {
    return visible && !document.hidden && !lost && !disposed &&
      (!paused || Math.abs(uniforms.uHover.value - Number(hovering)) > .003);
  }
  function tick(time) {
    frame = 0;
    if (!needsFrame()) return;
    const dt = Math.min((time - previous) / 1000, .08);
    if (time - previous >= 1000 / 30) {
      previous = time;
      if (!paused) turntable.rotation.y += dt * .065;
      uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, Number(hovering), 9, dt);
      if (Math.abs(uniforms.uHover.value - Number(hovering)) <= .003) uniforms.uHover.value = Number(hovering);
      render();
    }
    if (needsFrame()) frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (frame) return;
    previous = performance.now();
    if (needsFrame()) frame = requestAnimationFrame(tick);
    else render();
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; }
  function movePointer(event) {
    const rect = viewport.getBoundingClientRect();
    pointerUV.set((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    hovering = true; updatePointer(); wake();
    if (paused && uniforms.uHover.value === 1) render();
  }
  function leavePointer() { hovering = false; wake(); }
  canvas.addEventListener('pointermove', movePointer);
  canvas.addEventListener('pointerenter', movePointer);
  canvas.addEventListener('pointerleave', leavePointer);
  canvas.addEventListener('pointercancel', leavePointer);
  canvas.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') leavePointer(); });
  canvas.addEventListener('blur', leavePointer);
  canvas.addEventListener('keydown', event => {
    if (event.code === 'Space') { event.preventDefault(); paused = !paused; stop(); wake(); return; }
    if (event.key === 'Escape') { leavePointer(); return; }
    const delta = {ArrowLeft:[-.07,0],ArrowRight:[.07,0],ArrowUp:[0,-.07],ArrowDown:[0,.07]}[event.key];
    if (!delta) return;
    event.preventDefault();
    pointerUV.x = THREE.MathUtils.clamp(pointerUV.x + delta[0], 0, 1);
    pointerUV.y = THREE.MathUtils.clamp(pointerUV.y + delta[1], 0, 1);
    hovering = true; updatePointer(); wake(); render();
  });
  const onVisibility = () => { stop(); if (!document.hidden) wake(); };
  const onMotion = () => { paused = motionPreference.matches; stop(); wake(); };
  document.addEventListener('visibilitychange', onVisibility);
  motionPreference.addEventListener('change', onMotion);
  const resize = new ResizeObserver(() => {
    const {width,height} = viewport.getBoundingClientRect();
    if (!width || !height || lost || disposed) return;
    camera.aspect = width / height;
    // Keep the full silhouette visible even in a narrow header column.
    camera.position.z = Math.max(11.5, 6.8 / (2 * Math.tan(THREE.MathUtils.degToRad(33 / 2)) * camera.aspect));
    camera.lookAt(0, 1.86, 0); camera.updateProjectionMatrix();
    renderer.setSize(width, height, false); updatePointer(); render();
  });
  resize.observe(viewport);
  const intersection = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; stop(); wake();
  }, {threshold:.02});
  intersection.observe(host);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; stop(); host.hidden = true; });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; host.hidden = false; render(); wake(); });
  host.hidden = false; wake();
  window.addEventListener('pagehide', event => {
    stop(); if (event.persisted) return;
    disposed = true; resize.disconnect(); intersection.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    motionPreference.removeEventListener('change', onMotion);
    const geometries = new Set(), allMaterials = new Set(), textures = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) {
        allMaterials.add(object.material);
        for (const value of Object.values(object.material)) if (value?.isTexture) textures.add(value);
      }
    });
    geometries.forEach(item => item.dispose()); allMaterials.forEach(item => item.dispose());
    textures.forEach(item => item.dispose());
    environment.dispose(); renderer.dispose();
  });
  window.addEventListener('pageshow', () => { if (!disposed) wake(); });
}
