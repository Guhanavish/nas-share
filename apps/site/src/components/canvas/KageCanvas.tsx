import { useEffect, useRef } from "react";
import * as THREE from "three";

export function KageCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.022);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      180
    );
    camera.position.set(0, 3, 22);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x93c5fd, 1.6);
    moonLight.position.set(-15, 25, -40);
    scene.add(moonLight);

    // --- 1. The Vermilion Moon (Celestial Anchor) ---
    const moonGroup = new THREE.Group();
    const moonGeo = new THREE.SphereGeometry(7, 36, 36);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xff3b30,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.position.set(0, 16, -55);
    moonGroup.add(moonMesh);

    // Moon Glow Halo ring
    const haloGeo = new THREE.RingGeometry(7.05, 11, 48);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xff3b30) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - vec2(0.5));
          float alpha = smoothstep(0.5, 0.1, dist) * 0.45;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    moonGroup.add(haloMesh);
    scene.add(moonGroup);

    // --- 2. The Grand Torii Gate (Procedural Wood & Vermilion Lacquer) ---
    const toriiGroup = new THREE.Group();
    const vermilionMat = new THREE.MeshStandardMaterial({
      color: 0xcf2f25,
      roughness: 0.45,
      metalness: 0.1,
    });
    const blackWoodMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.6,
    });

    // Main Columns (Hashira)
    const pillarGeo = new THREE.CylinderGeometry(0.52, 0.62, 14, 20);
    const leftPillar = new THREE.Mesh(pillarGeo, vermilionMat);
    leftPillar.position.set(-5.5, 7, 0);
    leftPillar.rotation.z = 0.025;
    toriiGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, vermilionMat);
    rightPillar.position.set(5.5, 7, 0);
    rightPillar.rotation.z = -0.025;
    toriiGroup.add(rightPillar);

    // Pillar stone bases (Kamebara)
    const stoneGeo = new THREE.CylinderGeometry(0.85, 0.95, 1.4, 16);
    const leftBase = new THREE.Mesh(stoneGeo, blackWoodMat);
    leftBase.position.set(-5.5, 0.7, 0);
    toriiGroup.add(leftBase);

    const rightBase = new THREE.Mesh(stoneGeo, blackWoodMat);
    rightBase.position.set(5.5, 0.7, 0);
    toriiGroup.add(rightBase);

    // Top curved lintel (Kasagi / Shimaki)
    const topBarGeo = new THREE.BoxGeometry(16, 0.9, 1.1);
    const topBar = new THREE.Mesh(topBarGeo, blackWoodMat);
    topBar.position.set(0, 14.2, 0);
    toriiGroup.add(topBar);

    // Main vermilion crossbeam (Kasagi upper)
    const mainBeamGeo = new THREE.BoxGeometry(15, 0.8, 0.9);
    const mainBeam = new THREE.Mesh(mainBeamGeo, vermilionMat);
    mainBeam.position.set(0, 13.4, 0);
    toriiGroup.add(mainBeam);

    // Tie beam (Nuki)
    const nukiGeo = new THREE.BoxGeometry(13.6, 0.65, 0.75);
    const nuki = new THREE.Mesh(nukiGeo, vermilionMat);
    nuki.position.set(0, 10.8, 0);
    toriiGroup.add(nuki);

    toriiGroup.position.set(0, 0, 4);
    scene.add(toriiGroup);

    // --- 3. Floating Peer Lanterns (Phone, TV, PC) ---
    const lanternGroup = new THREE.Group();
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.7,
    });

    const createLantern = (x: number, y: number, z: number, color: number) => {
      const g = new THREE.Group();
      // Wooden roof & base
      const roofGeo = new THREE.ConeGeometry(1.2, 0.7, 4);
      const roof = new THREE.Mesh(roofGeo, lanternMat);
      roof.position.y = 1.1;
      roof.rotation.y = Math.PI / 4;
      g.add(roof);

      const baseGeo = new THREE.BoxGeometry(1.1, 0.25, 1.1);
      const base = new THREE.Mesh(baseGeo, lanternMat);
      base.position.y = -0.9;
      g.add(base);

      // Glowing shoji core
      const coreGeo = new THREE.BoxGeometry(0.85, 1.5, 0.85);
      const customShoji = new THREE.MeshBasicMaterial({ color });
      const core = new THREE.Mesh(coreGeo, customShoji);
      g.add(core);

      // Point Light
      const pLight = new THREE.PointLight(color, 2.5, 18, 1.5);
      g.add(pLight);

      g.position.set(x, y, z);
      return g;
    };

    // Lantern A: Phone (Warm Amber, Left path)
    const lanternPhone = createLantern(-6.5, 3.2, -6, 0xf59e0b);
    lanternGroup.add(lanternPhone);

    // Lantern B: TV (Emerald / Sovereign Cyan, Center-Right elevated)
    const lanternTv = createLantern(5.8, 4.5, -14, 0x06b6d4);
    lanternGroup.add(lanternTv);

    // Lantern C: PC (Sapphire / Royal Azure, Deep Sanctuary)
    const lanternPc = createLantern(-3.2, 3.8, -24, 0x3b82f6);
    lanternGroup.add(lanternPc);

    scene.add(lanternGroup);

    // --- 4. Reflective Ground Stream (Water / Stone Pathway) ---
    const groundGeo = new THREE.PlaneGeometry(80, 120, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070a10,
      roughness: 0.35,
      metalness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Stream line indicator (Glowing center channel)
    const streamGeo = new THREE.PlaneGeometry(2.4, 120);
    const streamMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.12,
    });
    const stream = new THREE.Mesh(streamGeo, streamMat);
    stream.rotation.x = -Math.PI / 2;
    stream.position.set(0, 0.02, 0);
    scene.add(stream);

    // --- 5. Floating Fireflies & Sakura Embers ---
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 44;
      positions[i * 3 + 1] = Math.random() * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      speeds[i * 3] = (Math.random() - 0.5) * 0.015;
      speeds[i * 3 + 1] = 0.008 + Math.random() * 0.012;
      speeds[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Custom circular glow particle shader
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.32,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Camera Waypoints mapped to 5 chapters ---
    // [x, y, z, lookX, lookY, lookZ]
    const waypoints = [
      [0, 3.4, 20, 0, 3.8, 0],       // Ch 1: Outer Threshold looking up at Torii & Moon
      [0, 4.2, 8, 0, 3.5, -10],       // Ch 2: Crossing through the Torii gate into grove
      [-2, 3.6, -2, -1, 3.2, -14],    // Ch 3: Cryptographic altar flanked by lanterns
      [1.5, 2.5, -12, 0, 2.2, -26],   // Ch 4: Low sweeping shot along the river of bytes
      [0, 5.0, -20, 0, 6.0, -45],     // Ch 5: Sanctuary keep under the celestial moon
    ];

    let currentProgress = 0;
    let targetProgress = 0;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      targetProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Resize handling
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Rendering loop
    let clock = new THREE.Clock();
    let animId = 0;
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation
      if (!reducedMotion) {
        currentProgress += (targetProgress - currentProgress) * 0.055;
      } else {
        currentProgress = targetProgress;
      }

      // Map progress [0, 1] across waypoints
      const segment = currentProgress * (waypoints.length - 1);
      const index = Math.min(Math.floor(segment), waypoints.length - 2);
      const frac = segment - index;

      const p0 = waypoints[index];
      const p1 = waypoints[index + 1];

      // Interpolate camera position
      const cx = THREE.MathUtils.lerp(p0[0], p1[0], frac);
      const cy = THREE.MathUtils.lerp(p0[1], p1[1], frac);
      const cz = THREE.MathUtils.lerp(p0[2], p1[2], frac);

      // Subtle atmospheric sway
      const swayX = Math.sin(elapsed * 0.45) * 0.12;
      const swayY = Math.cos(elapsed * 0.6) * 0.08;

      camera.position.set(cx + swayX, cy + swayY, cz);

      // Interpolate camera look-at
      const lx = THREE.MathUtils.lerp(p0[3], p1[3], frac);
      const ly = THREE.MathUtils.lerp(p0[4], p1[4], frac);
      const lz = THREE.MathUtils.lerp(p0[5], p1[5], frac);
      camera.lookAt(lx, ly, lz);

      // Bobbing floating lanterns
      lanternPhone.position.y = 3.2 + Math.sin(elapsed * 1.4) * 0.15;
      lanternTv.position.y = 4.5 + Math.sin(elapsed * 1.2 + 1.2) * 0.18;
      lanternPc.position.y = 3.8 + Math.sin(elapsed * 1.3 + 2.5) * 0.14;

      // Rotate moon halo subtly
      haloMesh.rotation.z = elapsed * 0.05;

      // Update particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += speeds[i * 3];
        posArray[i * 3 + 1] += speeds[i * 3 + 1];
        posArray[i * 3 + 2] += speeds[i * 3 + 2];

        // Wrap around boundaries
        if (posArray[i * 3 + 1] > 20) {
          posArray[i * 3 + 1] = 0;
          posArray[i * 3] = (Math.random() - 0.5) * 44;
          posArray[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
