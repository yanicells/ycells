import {
  ACESFilmicToneMapping,
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
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createMineral } from "./mineral";

/** Small studio softboxes provide reflections without fetching a large HDR image. */
function createEnvironment(renderer: WebGLRenderer) {
  const studio = new Scene();
  studio.background = new Color("#111318");
  const geometry = new PlaneGeometry(1, 1);
  const materials = [
    new MeshBasicMaterial({ color: new Color().setRGB(6, 5.7, 5.3) }),
    new MeshBasicMaterial({ color: new Color().setRGB(2, 2.3, 3) }),
  ];
  const softbox = new Mesh(geometry, materials[0]);
  softbox.position.set(-3, 4, 4);
  softbox.scale.set(3, 5, 1);
  softbox.lookAt(0, 0, 0);
  studio.add(softbox);
  const strip = new Mesh(geometry, materials[1]);
  strip.position.set(4, 1, -2);
  strip.scale.set(1.5, 6, 1);
  strip.lookAt(0, 0, 0);
  studio.add(strip);
  const generator = new PMREMGenerator(renderer);
  const environment = generator.fromScene(studio, 0.04, 0.1, 30);
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
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7);
  const mineral = createMineral();
  scene.add(mineral.group);
  let environment = createEnvironment(renderer);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.65;

  const key = new DirectionalLight(0xffeee0, 3.6);
  key.position.set(-3.5, 4.5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -2;
  key.shadow.camera.right = key.shadow.camera.top = 2;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 15;
  key.shadow.normalBias = 0.018;
  key.shadow.bias = -0.0002;
  const fill = new DirectionalLight(0xc5d6ee, 1.05);
  fill.position.set(3, 0.5, 3);
  const rim = new DirectionalLight(0xffc6ba, 2.2);
  rim.position.set(1, 3, -4);
  scene.add(key, fill, rim, new HemisphereLight(0xd4d8ea, 0x2b211e, 0.6));

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
