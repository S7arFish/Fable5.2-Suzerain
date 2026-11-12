// The 3D stage: lamp-lit desk with a lacquered relief map of the Reich, and the Reichstag chamber.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { REGIONS, CITIES, RIVERS, PARTY_ORDER, PARTIES } from '../engine/data.js';
import { proj, roughRing, pointInRing, grainTexture, woodTexture, paperMapTexture, makeLabel, glowTexture, beamTexture, flagTexture } from './textures.js';

const H = 1.5; // height of the map pieces
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

const FinalShader = {
  uniforms: { tDiffuse: { value: null }, res: { value: new THREE.Vector2(1, 1) }, time: { value: 0 }, fade: { value: 0 }, blur: { value: 4 }, focus: { value: 0.5 },
    vig: { value: 0.62 }, grain: { value: 0.055 }, sat: { value: 1 }, tint: { value: new THREE.Vector3(1, 1, 1) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 res; uniform float time, fade, blur, focus, vig, grain, sat; uniform vec3 tint; varying vec2 vUv;
    float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 uv = vUv; vec2 dc = uv - 0.5;
      float r = smoothstep(0.16, 0.6, abs(uv.y - focus)) * blur + smoothstep(0.3, 0.75, abs(dc.x)) * blur * 0.5;
      vec3 c;
      if (r < 0.35) c = texture2D(tDiffuse, uv).rgb;
      else { c = vec3(0.0); for (int i = 0; i < 20; i++) { float a = float(i) * 2.39996; float rr = sqrt((float(i) + 0.5) / 20.0) * r; c += texture2D(tDiffuse, uv + vec2(cos(a), sin(a)) * rr / res).rgb; } c /= 20.0; }
      float ca = dot(dc, dc) * 0.006;
      c.r = mix(c.r, texture2D(tDiffuse, uv + dc * ca).r, 0.7); c.b = mix(c.b, texture2D(tDiffuse, uv - dc * ca).b, 0.7);
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, sat) * tint;
      c = mix(c, c * c * (3.0 - 2.0 * c), 0.25);
      float v = smoothstep(0.95, 0.2, length(dc * vec2(1.0, 1.2)));
      c *= mix(1.0 - vig, 1.0, v);
      c += (rnd(uv * res + fract(time) * 91.7) - 0.5) * grain;
      gl_FragColor = vec4(c * fade, 1.0);
    }`,
};

export class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    this.clock = new THREE.Clock();
    this.view = 'map'; this.time = 0;
    this.pointer = new THREE.Vector2(-9, -9); this.raycaster = new THREE.Raycaster();
    this.hoverId = null; this.selectedId = null; this.interactive = false;
    this.onHover = () => {}; this.onSelect = () => {};
    this.cam = { tx: 8, tz: 2, dist: 168, tilt: 0.66, az: 0, offX: 0 }; this.insets = [0, 0];
    this.camT = { ...this.cam };
    this.drift = 0; this.fadeT = 1; this.fade = 0; this.tweens = [];

    this.buildMap(); this.buildChamber(); this.buildPost(); this.bindInput();
    this.resize(); window.addEventListener('resize', () => this.resize());
    r.setAnimationLoop(() => this.frame());
  }

  // ---------------------------------------------------------------- map --
  buildMap() {
    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color('#070605');
    const pm = new THREE.PMREMGenerator(this.renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.22;
    this.camera = new THREE.PerspectiveCamera(30, 1, 1, 900);

    scene.add(new THREE.HemisphereLight(0x8ea4c4, 0x2a1c10, 0.24));
    const key = (this.key = new THREE.SpotLight(0xffd6a0, 5.2, 0, 0.5, 1, 0));
    key.position.set(-70, 150, 70); key.target.position.set(8, 0, 0); key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.05; key.shadow.radius = 5; key.shadow.camera.near = 40; key.shadow.camera.far = 420;
    scene.add(key, key.target);
    const rim = new THREE.DirectionalLight(0x6f8fc0, 0.75); rim.position.set(90, 60, -110); scene.add(rim);

    const grain = (this.grain = grainTexture()); grain.repeat.set(0.045, 0.045);
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(900, 700), new THREE.MeshPhysicalMaterial({ map: woodTexture(), roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.35 }));
    desk.rotation.x = -Math.PI / 2; desk.position.y = -0.25; desk.receiveShadow = true; scene.add(desk);

    const paper = paperMapTexture();
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(paper.width, 0.24, paper.height), [
      ...Array(2).fill(new THREE.MeshStandardMaterial({ color: '#c9b78e', roughness: 0.95 })),
      new THREE.MeshPhysicalMaterial({ map: paper.texture, roughness: 1, metalness: 0, specularIntensity: 0.12, envMapIntensity: 0.2 }),
      ...Array(3).fill(new THREE.MeshStandardMaterial({ color: '#c9b78e', roughness: 0.95 })),
    ]);
    sheet.position.set(paper.cx, -0.12, -paper.cy); sheet.receiveShadow = true; sheet.castShadow = true; scene.add(sheet);

    // Regions
    this.regions = {}; this.pickables = [];
    const sideMat = new THREE.MeshPhysicalMaterial({ color: '#20140b', roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3 });
    const brass = (this.brass = new THREE.MeshStandardMaterial({ color: '#c9a45a', metalness: 1, roughness: 0.28 }));
    for (const reg of REGIONS) {
      const group = new THREE.Group();
      const top = new THREE.MeshPhysicalMaterial({ color: '#888', map: grain, roughness: 0.58, clearcoat: 0.35, clearcoatRoughness: 0.42, emissive: '#000' });
      const rings = reg.rings.map((ring) => roughRing(ring));
      const holes = (reg.holes || []).map((ring) => roughRing(ring));
      const outline = [];
      rings.forEach((ring, i) => {
        const shape = new THREE.Shape(ring.map(([x, y]) => new THREE.Vector2(x, y)));
        if (i === 0) for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
        const bev = reg.small ? 0.1 : 0.2;
        const geo = new THREE.ExtrudeGeometry(shape, { depth: H - bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelOffset: -bev, bevelSegments: 3, steps: 1, curveSegments: 1 });
        geo.rotateX(-Math.PI / 2);
        const mesh = new THREE.Mesh(geo, [top, sideMat]);
        mesh.castShadow = mesh.receiveShadow = true; mesh.userData.id = reg.id;
        group.add(mesh); this.pickables.push(mesh);
        const pts = ring.map(([x, y]) => new THREE.Vector3(x, H + 0.04, -y));
        const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(3.2, 2.3, 1.0), transparent: true, opacity: 0, toneMapped: false }));
        group.add(line); outline.push(line);
      });
      const [lx, ly] = proj(reg.label);
      if (!reg.small) {
        const label = makeLabel(reg.name.toUpperCase(), { px: 60, spacing: 14, height: reg.pop > 6 ? 2.9 : 2.4, color: 'rgba(250,242,222,0.92)' });
        label.position.set(lx, H + 0.03, -ly); group.add(label);
      }
      scene.add(group);
      this.regions[reg.id] = { reg, group, top, outline, rings, lift: 0, glow: 0, color: new THREE.Color('#777'), target: new THREE.Color('#777') };
    }

    // Rivers
    const riverMat = new THREE.MeshBasicMaterial({ color: '#cfe0e6', transparent: true, opacity: 0.34, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (const rv of RIVERS) {
      const curve = new THREE.CatmullRomCurve3(rv.map((p) => { const [x, y] = proj(p); return new THREE.Vector3(x, 0, -y); }), false, 'catmullrom', 0.5);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, rv.length * 10, 0.16, 5, false), riverMat);
      tube.scale.y = 0.06; tube.position.y = H + 0.02; scene.add(tube);
    }

    // Cities
    this.cityPos = {};
    const stemGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.5, 6), headGeo = new THREE.SphereGeometry(0.3, 16, 12);
    const red = new THREE.MeshPhysicalMaterial({ color: '#a8221a', roughness: 0.25, clearcoat: 1 });
    for (const c of CITIES) {
      const [x, y] = proj(c.at);
      const host = Object.values(this.regions).find((r) => r.rings.some((ring) => pointInRing([x, y], ring)));
      const pin = new THREE.Group();
      const stem = new THREE.Mesh(stemGeo, brass); stem.position.y = 0.75; stem.castShadow = true;
      const head = new THREE.Mesh(headGeo, c.cap ? red : brass); head.position.y = 1.55; head.castShadow = true; if (c.cap) head.scale.setScalar(1.5);
      pin.add(stem, head); pin.position.set(x, H, -y); pin.rotation.z = (Math.random() - 0.5) * 0.14; pin.rotation.x = (Math.random() - 0.5) * 0.14;
      const lab = makeLabel(c.n, { px: 48, font: '500 PXpx Jost', height: c.cap ? 1.5 : 1.15, spacing: 1, color: 'rgba(255,250,236,0.95)' });
      lab.position.set(x + lab.geometry.parameters.width / 2 + 0.25, H + 0.035, -y + 0.25);
      (host ? host.group : scene).add(pin, lab);
      this.cityPos[c.n] = [x, y];
    }

    // Desk props
    const glassMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, transmission: 1, thickness: 1.2, ior: 1.5, transparent: true, opacity: 0.35 });
    const mag = new THREE.Group();
    const rimM = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.45, 12, 48), brass); rimM.rotation.x = Math.PI / 2; rimM.castShadow = true;
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.4, 0.25, 48), glassMat);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.75, 11, 16), new THREE.MeshPhysicalMaterial({ color: '#1a0f08', roughness: 0.3, clearcoat: 1 })); handle.rotation.z = Math.PI / 2; handle.position.x = 12.4; handle.castShadow = true;
    mag.add(rimM, lens, handle); mag.position.set(-58, 0.75, 46); mag.rotation.y = 0.7; scene.add(mag);
    const pen = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 13, 16), new THREE.MeshPhysicalMaterial({ color: '#0d1420', roughness: 0.2, clearcoat: 1 })); body.rotation.z = Math.PI / 2; body.castShadow = true;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.5, 16), brass); band.rotation.z = Math.PI / 2; band.position.x = 2;
    const nib = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.2, 12), brass); nib.rotation.z = -Math.PI / 2; nib.position.x = 7.6;
    pen.add(body, band, nib); pen.position.set(74, 0.55, 50); pen.rotation.y = -0.5; scene.add(pen);
    const ink = new THREE.Group();
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 4.6, 8), new THREE.MeshPhysicalMaterial({ color: '#0a1424', roughness: 0.08, clearcoat: 1, metalness: 0.2 })); bottle.position.y = 2.3; bottle.castShadow = true;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 1.6, 20), brass); cap.position.y = 5.3; cap.castShadow = true;
    ink.add(bottle, cap); ink.position.set(-66, 0, -44); scene.add(ink);
    const folderCols = ['#7b6a48', '#5c2a22', '#3b4a45'];
    folderCols.forEach((col, i) => {
      const f = new THREE.Mesh(new THREE.BoxGeometry(34, 0.7, 46), new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 }));
      f.position.set(118 + i * 1.5, 0.35 + i * 0.72, -22 + i * 2); f.rotation.y = 0.12 - i * 0.09; f.castShadow = f.receiveShadow = true; scene.add(f);
    });

    // Beacon for event locations
    const beacon = (this.beacon = new THREE.Group());
    const glowT = glowTexture();
    this.beaconRing = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.42, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.2, 0.8), transparent: true, opacity: 0.9, toneMapped: false, depthTest: false, side: THREE.DoubleSide }));
    this.beaconRing.rotation.x = -Math.PI / 2; this.beaconRing.position.y = H + 0.12; this.beaconRing.renderOrder = 9;
    this.beaconRing2 = this.beaconRing.clone(); this.beaconRing2.material = this.beaconRing.material.clone();
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.5, 22, 20, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.35, 0.6), map: beamTexture(), transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    beam.position.y = H + 11;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: new THREE.Color(3, 1.8, 0.7), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false }));
    spr.scale.setScalar(5); spr.position.y = H + 0.6;
    beacon.add(this.beaconRing, this.beaconRing2, beam, spr); beacon.visible = false; scene.add(beacon);

    // Dust in the lamplight
    const N = 420, pos = new Float32Array(N * 3); this.dustSeed = [];
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 220; pos[i * 3 + 1] = 4 + Math.random() * 70; pos[i * 3 + 2] = (Math.random() - 0.5) * 170; this.dustSeed.push(Math.random() * 100); }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(dg, new THREE.PointsMaterial({ map: glowT, size: 0.9, color: new THREE.Color(1.6, 1.25, 0.8), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, toneMapped: false }));
    scene.add(this.dust);
  }

  // ------------------------------------------------------------ chamber --
  buildChamber() {
    const scene = (this.chamber = new THREE.Scene());
    scene.background = new THREE.Color('#060504'); scene.fog = new THREE.Fog('#060504', 80, 190);
    scene.environment = this.scene.environment; scene.environmentIntensity = 0.25;
    const cam = (this.chamberCam = new THREE.PerspectiveCamera(34, 1, 1, 400));
    cam.position.set(0, 30, 46); cam.lookAt(0, 0, 7);
    scene.add(new THREE.HemisphereLight(0x8090b0, 0x20140c, 0.3));
    const spot = new THREE.SpotLight(0xffe0b0, 5, 0, 0.7, 0.8, 0); spot.position.set(0, 60, 22); spot.target.position.set(0, 0, 10); spot.castShadow = true;
    spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0005; spot.shadow.radius = 4; scene.add(spot, spot.target);
    const back = new THREE.SpotLight(0xffc890, 7, 0, 0.55, 0.9, 0); back.position.set(0, 30, 16); back.target.position.set(0, 9, -12); scene.add(back, back.target);
    const cool = new THREE.DirectionalLight(0x6f8fc0, 0.6); cool.position.set(-40, 30, 40); scene.add(cool);

    const wood = woodTexture(); wood.repeat.set(6, 6);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(120, 96), new THREE.MeshPhysicalMaterial({ map: wood, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.25 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const brass = this.brass;
    for (const rr of [7.2, 24.6]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.09, 8, 128, Math.PI), brass); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.03, 3); ring.rotation.z = Math.PI; ring.scale.z = 1; scene.add(ring); }
    // Tiered rostrum
    const dark = new THREE.MeshPhysicalMaterial({ color: '#b98a5a', map: wood, roughness: 0.4, clearcoat: 0.7 });
    const mk = (w, h, d, x, y, z, m = dark) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; scene.add(b); return b; };
    mk(26, 1.2, 7, 0, 0.6, -3); mk(16, 2.6, 4, 0, 2.5, -4); mk(7, 2.2, 2.2, 0, 2.3, 0.2); mk(8, 4.6, 2.4, 0, 3.5, -6.4);
    mk(26.2, 0.12, 7.2, 0, 1.24, -3, brass); mk(16.2, 0.1, 4.2, 0, 3.84, -4, brass);
    // Back wall and the flag of the Republic
    mk(120, 44, 2, 0, 22, -14, new THREE.MeshStandardMaterial({ color: '#1b120b', roughness: 0.9 }));
    for (const x of [-22, -11, 11, 22]) mk(1.6, 40, 1.2, x, 20, -12.7, new THREE.MeshPhysicalMaterial({ color: '#3a2413', roughness: 0.5, clearcoat: 0.4 }));
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(8, 15, 12, 24), new THREE.MeshStandardMaterial({ map: flagTexture(), roughness: 0.85, side: THREE.DoubleSide }));
    flag.position.set(0, 12.5, -12.6); scene.add(flag);
    mk(11, 18.5, 0.3, 0, 12.5, -12.95, new THREE.MeshStandardMaterial({ color: '#6b5236', roughness: 0.8 })); mk(11.6, 0.35, 0.5, 0, 21.9, -12.8, brass); mk(11.6, 0.35, 0.5, 0, 3.1, -12.8, brass); this.flag = flag; this.flagBase = flag.geometry.attributes.position.array.slice();

    // Seats
    const MAX = 640;
    const geo = new THREE.CylinderGeometry(0.36, 0.42, 0.5, 14);
    const mat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.3 });
    const seats = (this.seatMesh = new THREE.InstancedMesh(geo, mat, MAX));
    seats.castShadow = true; seats.receiveShadow = true; seats.count = 0; seats.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(seats);
    this.seatData = [];
  }

  /** Lay out the hemicycle for a seat distribution. */
  setSeats(seats, total) {
    const rows = 11, r0 = 8.4, dr = 1.52;
    const radii = Array.from({ length: rows }, (_, i) => r0 + i * dr);
    const sumR = radii.reduce((a, b) => a + b, 0);
    let counts = radii.map((r) => Math.round((total * r) / sumR));
    let diff = total - counts.reduce((a, b) => a + b, 0);
    for (let i = rows - 1; diff !== 0; i = (i - 1 + rows) % rows) { counts[i] += Math.sign(diff); diff -= Math.sign(diff); }
    const slots = [];
    radii.forEach((r, i) => { for (let j = 0; j < counts[i]; j++) { const th = ((j + 0.5) / counts[i]) * Math.PI; slots.push({ r, th, x: -r * Math.cos(th), z: 3 + r * Math.sin(th) * 0.92, y: 0.25 + i * 0.16 }); } });
    slots.sort((a, b) => a.th - b.th || a.r - b.r);
    let k = 0; const old = this.seatData; this.seatData = [];
    for (const p of PARTY_ORDER) {
      for (let n = 0; n < seats[p]; n++, k++) {
        const s = slots[k]; if (!s) break;
        const col = new THREE.Color(PARTIES[p].color);
        this.seatData.push({ ...s, party: p, base: col, color: old[k] ? old[k].color.clone() : new THREE.Color('#222'), target: col.clone(), pop: 0, popT: 0, delay: 0 });
      }
    }
    this.seatMesh.count = this.seatData.length;
    this.seatData.forEach((s, i) => { s.delay = this.time + (s.th / Math.PI) * 1.4; });
  }

  /** Animate a division: by[party] = {yes, no, abstain}. */
  showVote(by) {
    const idx = {}; const colors = { yes: new THREE.Color(0.2, 0.85, 0.32), no: new THREE.Color(1.15, 0.13, 0.08), abstain: new THREE.Color(0.14, 0.14, 0.15) };
    this.seatData.forEach((s) => {
      const n = (idx[s.party] = (idx[s.party] || 0) + 1); const v = by[s.party];
      const kind = n <= v.yes ? 'yes' : n <= v.yes + v.abstain ? 'abstain' : 'no';
      s.target = colors[kind].clone(); s.delay = this.time + 0.3 + (s.th / Math.PI) * 2.6; s.popT = kind === 'abstain' ? 0 : 1;
    });
  }
  clearVote() { this.seatData.forEach((s) => { s.target = s.base.clone(); s.delay = this.time + (s.th / Math.PI) * 0.8; s.popT = 0; }); }

  // --------------------------------------------------------------- post --
  buildPost() {
    const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
    const c = (this.composer = new EffectComposer(this.renderer, rt));
    this.renderPass = new RenderPass(this.scene, this.camera); c.addPass(this.renderPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(4, 4), 0.3, 0.6, 1.0); c.addPass(this.bloom);
    c.addPass(new OutputPass());
    this.final = new ShaderPass(FinalShader); c.addPass(this.final);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false); this.composer.setSize(w, h);
    const pr = this.renderer.getPixelRatio();
    this.final.uniforms.res.value.set(w * pr, h * pr);
    this.camera.aspect = this.chamberCam.aspect = w / h; this.camera.updateProjectionMatrix(); this.chamberCam.updateProjectionMatrix();
    this.w = w; this.h = h;
  }

  // -------------------------------------------------------------- input --
  bindInput() {
    const el = this.canvas; let drag = null, moved = 0;
    el.addEventListener('pointerdown', (e) => { if (!this.interactive || this.view !== 'map') return; drag = { x: e.clientX, y: e.clientY, btn: e.button, shift: e.shiftKey || e.ctrlKey }; moved = 0; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => {
      this.pointer.set((e.clientX / this.w) * 2 - 1, -(e.clientY / this.h) * 2 + 1);
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      if (drag.btn === 2 || drag.shift) { this.camT.az = THREE.MathUtils.clamp(this.camT.az - dx * 0.004, -0.7, 0.7); this.camT.tilt = THREE.MathUtils.clamp(this.camT.tilt + dy * 0.003, 0.3, 1.12); }
      else {
        const k = this.camT.dist * 0.0011; const ca = Math.cos(this.camT.az), sa = Math.sin(this.camT.az);
        this.camT.tx = THREE.MathUtils.clamp(this.camT.tx - (dx * ca + dy * sa) * k, -55, 75);
        this.camT.tz = THREE.MathUtils.clamp(this.camT.tz - (dy * ca - dx * sa) * k * 1.3, -50, 50);
      }
    });
    el.addEventListener('pointerup', (e) => {
      if (drag && moved < 6 && drag.btn === 0 && this.interactive && this.view === 'map') this.onSelect(this.hoverId);
      drag = null;
    });
    el.addEventListener('pointerleave', () => this.pointer.set(-9, -9));
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('wheel', (e) => { if (!this.interactive || this.view !== 'map') return; e.preventDefault(); this.camT.dist = THREE.MathUtils.clamp(this.camT.dist * (1 + Math.sign(e.deltaY) * 0.09), 48, 250); }, { passive: false });
  }

  // ---------------------------------------------------------------- API --
  setRegionColors(colors, instant = false) { for (const id in colors) { const r = this.regions[id]; if (!r) continue; r.target.set(colors[id]); if (instant) r.color.copy(r.target); } }
  selectRegion(id) { this.selectedId = id; }
  flyTo(lonlat, dist = 78, opts = {}) { const [x, y] = proj(lonlat); this.camT.tx = THREE.MathUtils.clamp(x, -70, 90); this.camT.tz = THREE.MathUtils.clamp(-y, -55, 55); this.camT.dist = dist; if (opts.tilt != null) this.camT.tilt = opts.tilt; if (opts.az != null) this.camT.az = opts.az; }
  setInsets(l, r) { this.insets = [l, r]; }
  overview() {
    const [l, r] = this.insets; const avail = Math.max(0.35, (this.w - l - r) / this.w);
    const dist = THREE.MathUtils.clamp(101 / avail / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * this.camera.aspect), 150, 250);
    Object.assign(this.camT, { tx: 9, tz: 3, dist, tilt: 0.62, az: 0, offX: (r - l) / 2 });
  }
  focusRegion(id) { const r = this.regions[id]; if (!r) return; this.flyTo(r.reg.label, THREE.MathUtils.clamp(60 + r.reg.pop * 3.5, 70, 110)); }
  setOffset(px) { this.camT.offX = px; }
  setBeacon(lonlat) { if (!lonlat) { this.beacon.visible = false; return; } const [x, y] = proj(lonlat); this.beacon.position.set(x, 0, -y); this.beacon.visible = true; this.beaconT0 = this.time; }
  setMood({ sat = 1, tint = [1, 1, 1], blur = 4, vig = 0.62 } = {}) { this.mood = { sat, tint, blur, vig }; }
  titleCam() { Object.assign(this.camT, { tx: 6, tz: 12, dist: 92, tilt: 1.05, az: -0.35 }); Object.assign(this.cam, { tx: -10, tz: 24, dist: 120, tilt: 1.1, az: -0.6 }); this.drift = 1; }
  stopDrift() { this.drift = 0; }
  fadeIn(d = 1.4) { this.fadeT = 1; this.fadeSpeed = 1 / d; }
  async switchView(view) {
    if (view === this.view) return;
    this.fadeT = 0; this.fadeSpeed = 4; await new Promise((r) => setTimeout(r, 300));
    this.view = view;
    this.renderPass.scene = view === 'map' ? this.scene : this.chamber; this.renderPass.camera = view === 'map' ? this.camera : this.chamberCam;
    this.fadeT = 1; this.fadeSpeed = 2.2;
  }

  // -------------------------------------------------------------- frame --
  frame() {
    const dt = Math.min(this.clock.getDelta(), 1); this.time += dt; const t = this.time;
    this.fade = THREE.MathUtils.clamp(this.fade + Math.sign(this.fadeT - this.fade) * dt * (this.fadeSpeed || 1), 0, 1);
    const u = this.final.uniforms; u.time.value = t; u.fade.value = ease(this.fade);
    const mood = this.mood || { sat: 1, tint: [1, 1, 1], blur: 4, vig: 0.62 };
    u.sat.value = damp(u.sat.value, mood.sat, 2, dt); u.vig.value = damp(u.vig.value, mood.vig, 2, dt);
    u.blur.value = damp(u.blur.value, (this.view === 'map' ? mood.blur : 3.5) * this.renderer.getPixelRatio(), 2.5, dt);
    u.tint.value.set(damp(u.tint.value.x, mood.tint[0], 2, dt), damp(u.tint.value.y, mood.tint[1], 2, dt), damp(u.tint.value.z, mood.tint[2], 2, dt));

    if (this.view === 'map') this.frameMap(dt, t); else this.frameChamber(dt, t);
    this.composer.render(dt);
  }

  frameMap(dt, t) {
    const c = this.cam, T = this.camT;
    if (this.drift) { T.az += dt * 0.012; T.tx += Math.sin(t * 0.05) * dt * 0.6; }
    const k = this.drift ? 0.35 : 3.2;
    c.tx = damp(c.tx, T.tx, k, dt); c.tz = damp(c.tz, T.tz, k, dt); c.dist = damp(c.dist, T.dist, k, dt); c.tilt = damp(c.tilt, T.tilt, k, dt); c.az = damp(c.az, T.az, k, dt); c.offX = damp(c.offX, T.offX, 3, dt);
    const sway = Math.sin(t * 0.21) * 0.006, sway2 = Math.cos(t * 0.17) * 0.004;
    const tilt = c.tilt + sway2, az = c.az + sway;
    const cam = this.camera;
    cam.position.set(c.tx + Math.sin(az) * Math.sin(tilt) * c.dist, Math.cos(tilt) * c.dist, c.tz + Math.cos(az) * Math.sin(tilt) * c.dist);
    cam.lookAt(c.tx, 0, c.tz);
    if (Math.abs(c.offX) > 0.5) cam.setViewOffset(this.w, this.h, c.offX, 0, this.w, this.h); else cam.clearViewOffset();

    // Picking
    let hover = null;
    if (this.interactive && this.pointer.x > -2) {
      this.raycaster.setFromCamera(this.pointer, cam);
      const hit = this.raycaster.intersectObjects(this.pickables, false)[0];
      if (hit) hover = hit.object.userData.id;
    }
    if (hover !== this.hoverId) { this.hoverId = hover; this.onHover(hover); this.canvas.style.cursor = hover ? 'pointer' : 'default'; }

    for (const id in this.regions) {
      const r = this.regions[id];
      const sel = id === this.selectedId, hov = id === this.hoverId;
      r.lift = damp(r.lift, sel ? 0.95 : hov ? 0.45 : 0, 9, dt); r.glow = damp(r.glow, sel ? 1 : hov ? 0.45 : 0, 8, dt);
      r.group.position.y = r.lift;
      r.color.lerp(r.target, 1 - Math.exp(-3.2 * dt));
      r.top.color.copy(r.color); r.top.emissive.copy(r.color).multiplyScalar(r.glow * 0.22);
      for (const l of r.outline) l.material.opacity = r.glow;
    }
    if (this.beacon.visible) {
      const p = ((t - this.beaconT0) % 2.2) / 2.2, p2 = ((t - this.beaconT0 + 1.1) % 2.2) / 2.2;
      this.beaconRing.scale.setScalar(0.4 + p * 3.2); this.beaconRing.material.opacity = (1 - p) * 0.9;
      this.beaconRing2.scale.setScalar(0.4 + p2 * 3.2); this.beaconRing2.material.opacity = (1 - p2) * 0.9;
    }
    const pos = this.dust.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) { const s = this.dustSeed[i]; pos.array[i * 3] += Math.sin(t * 0.21 + s) * dt * 0.5; pos.array[i * 3 + 1] += Math.cos(t * 0.17 + s * 1.7) * dt * 0.35; pos.array[i * 3 + 2] += Math.sin(t * 0.13 + s * 0.6) * dt * 0.4; }
    pos.needsUpdate = true;
    this.key.intensity = 5.2 + Math.sin(t * 7.3) * 0.02 + Math.sin(t * 2.1) * 0.04;
  }

  frameChamber(dt, t) {
    const cam = this.chamberCam; const a = Math.sin(t * 0.11) * 0.16;
    cam.position.set(Math.sin(a) * 66, 44 + Math.sin(t * 0.07) * 1.2, 2 + Math.cos(a) * 64); cam.lookAt(0, 6, 2);
    if (Math.abs(this.camT.offX) > 0.5) cam.setViewOffset(this.w, this.h, this.camT.offX, 0, this.w, this.h); else cam.clearViewOffset();
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    const mesh = this.seatMesh;
    this.seatData.forEach((s, i) => {
      if (t >= s.delay) { s.color.lerp(s.target, 1 - Math.exp(-7 * dt)); s.pop = damp(s.pop, s.popT, 7, dt); }
      const yS = 1 + s.pop * 0.9;
      p.set(s.x, s.y + 0.25 * yS, s.z); sc.set(1, yS, 1); m.compose(p, q, sc); mesh.setMatrixAt(i, m); mesh.setColorAt(i, s.color);
    });
    mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    const arr = this.flag.geometry.attributes.position.array, base = this.flagBase;
    for (let i = 0; i < arr.length; i += 3) arr[i + 2] = Math.sin(base[i] * 0.9 + t * 0.9 + base[i + 1] * 0.25) * 0.16 * (1 - (base[i + 1] + 7.5) / 22);
    this.flag.geometry.attributes.position.needsUpdate = true; this.flag.geometry.computeVertexNormals();
  }
}
