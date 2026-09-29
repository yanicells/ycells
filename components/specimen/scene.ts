import {
  NeutralToneMapping,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SpotLight,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMineral } from "./mineral";

/** Studio softboxes: enough bright shapes for glass to show crisp, believable reflections. */
function createEnvironment(renderer: WebGLRenderer) {
  const studio = new Scene();
  studio.background = new Color("#0b0c10");
  const geometry = new PlaneGeometry(1, 1);
  const panels: { color: [number, number, number]; position: [number, number, number]; scale: [number, number] }[] = [
    { color: [7, 6.6, 6], position: [-3, 4.5, 4], scale: [3.5, 5] },
    { color: [2.2, 2.6, 3.4], position: [4.5, 1, -1.5], scale: [1.4, 6] },
    { color: [3.6, 2.6, 2.1], position: [3.5, -2, 3.5], scale: [4, 1.2] },
    { color: [5, 4.4, 4], position: [0, 6, -1], scale: [6, 2] },
    { color: [1.6, 1.8, 2.4], position: [-5, -1, -1], scale: [1.2, 5] },
    { color: [2.6, 1.7, 1.3], position: [0, -4, 1], scale: [7, 2] },
  ];
  const materials = panels.map(
    ({ color }) => new MeshBasicMaterial({ color: new Color().setRGB(...color) }),
  );
  panels.forEach(({ position, scale }, i) => {
    const panel = new Mesh(geometry, materials[i]);
    panel.position.set(...position);
    panel.scale.set(scale[0], scale[1], 1);
    panel.lookAt(0, 0, 0);
    studio.add(panel);
  });
  const generator = new PMREMGenerator(renderer);
  const environment = generator.fromScene(studio, 0.03, 0.1, 30);
  generator.dispose();
  geometry.dispose();
  materials.forEach((material) => material.dispose());
  return environment;
}

export function mountSpecimen(
  canvas: HTMLCanvasElement,
  onReady: () => void,
  onUnavailable: () => void,
) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000);
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7);
  const mineral = createMineral();
  scene.add(mineral.group);
  let environment = createEnvironment(renderer);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.36;

  // A spotlight, not a directional light: it falls off across the specimen like a real studio lamp.
  const key = new SpotLight(0xffe9d6, 300, 0, 0.42, 1, 2);
  key.position.set(-5, 4, 3.6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 3;
  key.shadow.camera.far = 14;
  key.shadow.normalBias = 0.02;
  key.shadow.bias = -0.0002;
  const fill = new DirectionalLight(0xc5d6ee, 0.3);
  fill.position.set(3, 0.5, 3);
  const rim = new DirectionalLight(0xffc6ba, 2.2);
  rim.position.set(1, 3, -4);
  scene.add(key, key.target, fill, rim, new HemisphereLight(0xd4d8ea, 0x2b211e, 0.12));

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = !motion.matches;
  controls.dampingFactor = 0.085;
  controls.rotateSpeed = 0.65;
  controls.zoomSpeed = 0.6;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI - 0.15;

  const radius = mineral.radius;
  const lightTarget = key.position.clone();
  const lightHome = key.position.clone();
  let frame = 0;
  let disposed = false;
  let contextLost = false;
  let ready = false;
  let baseDistance = 7;

  function requestRender() {
    if (!frame && !disposed && !document.hidden && !contextLost) {
      frame = requestAnimationFrame(render);
    }
  }

  // No perpetual animation loop: stop as soon as controls and light have settled.
  function render() {
    frame = 0;
    if (disposed || contextLost || document.hidden) return;
    const moving = controls.update();
    const lightMoving = key.position.distanceToSquared(lightTarget) > 0.00001;
    if (lightMoving) key.position.lerp(lightTarget, motion.matches ? 1 : 0.12);
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      onReady();
    }
    if (moving || lightMoving) requestRender();
  }

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const zoomRatio = camera.position.length() / baseDistance;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const vertical = (camera.fov * Math.PI) / 180;
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    baseDistance = (radius * 1.16) / Math.sin(Math.min(vertical, horizontal) / 2);
    camera.position.setLength(baseDistance * zoomRatio);
    controls.minDistance = baseDistance * 0.72;
    controls.maxDistance = baseDistance * 1.45;
    controls.position0.set(0, 0, baseDistance);
    // Keep high-DPI phones from rendering millions of unnecessary pixels.
    const pixelBudget = Math.sqrt(2_000_000 / (width * height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75, pixelBudget));
    renderer.setSize(width, height, false);
    requestRender();
  }

  function moveLight(event: PointerEvent) {
    if (event.pointerType !== "mouse" || event.buttons || motion.matches) return;
    const rect = canvas.getBoundingClientRect();
    lightTarget.set(
      lightHome.x + ((event.clientX - rect.left) / rect.width - 0.5) * 2.5,
      lightHome.y - ((event.clientY - rect.top) / rect.height - 0.5) * 1.5,
      lightHome.z,
    );
    requestRender();
  }

  function resetLight() {
    lightTarget.copy(lightHome);
    requestRender();
  }

  function reset() {
    // Flush residual inertia before restoring the original camera pose.
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    controls.reset();
    controls.enableDamping = damping;
    resetLight();
    requestRender();
  }

  function keyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft": controls.rotateLeft(0.12); break;
      case "ArrowRight": controls.rotateLeft(-0.12); break;
      case "ArrowUp": controls.rotateUp(0.12); break;
      case "ArrowDown": controls.rotateUp(-0.12); break;
      case "+":
      case "=": controls.dollyIn(0.9); break;
      case "-": controls.dollyOut(0.9); break;
      case "Home":
      case "Escape": reset(); break;
      default: return;
    }
    event.preventDefault();
    requestRender();
  }

  function start() {
    canvas.focus({ preventScroll: true });
    canvas.dataset.dragging = "true";
  }

  function end() {
    delete canvas.dataset.dragging;
  }

  function visibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      requestRender();
    }
  }

  function motionChange() {
    controls.enableDamping = !motion.matches;
    resetLight();
  }

  function loseContext(event: Event) {
    event.preventDefault();
    contextLost = true;
    ready = false;
    cancelAnimationFrame(frame);
    frame = 0;
    onUnavailable();
  }

  function restoreContext() {
    environment.dispose();
    environment = createEnvironment(renderer);
    scene.environment = environment.texture;
    contextLost = false;
    requestRender();
  }

  controls.addEventListener("change", requestRender);
  controls.addEventListener("start", start);
  controls.addEventListener("end", end);
  canvas.addEventListener("pointermove", moveLight);
  canvas.addEventListener("pointerleave", resetLight);
  canvas.addEventListener("dblclick", reset);
  canvas.addEventListener("keydown", keyDown);
  canvas.addEventListener("webglcontextlost", loseContext);
  canvas.addEventListener("webglcontextrestored", restoreContext);
  document.addEventListener("visibilitychange", visibilityChange);
  motion.addEventListener("change", motionChange);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    controls.removeEventListener("change", requestRender);
    controls.removeEventListener("start", start);
    controls.removeEventListener("end", end);
    controls.dispose();
    canvas.removeEventListener("pointermove", moveLight);
    canvas.removeEventListener("pointerleave", resetLight);
    canvas.removeEventListener("dblclick", reset);
    canvas.removeEventListener("keydown", keyDown);
    canvas.removeEventListener("webglcontextlost", loseContext);
    canvas.removeEventListener("webglcontextrestored", restoreContext);
    document.removeEventListener("visibilitychange", visibilityChange);
    motion.removeEventListener("change", motionChange);
    mineral.dispose();
    environment.dispose();
    key.shadow.dispose();
    renderer.dispose();
  };
}
