import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Three.js Fluid Constellation Canvas
 * Renders an interactive 3D peer constellation of Phone, PC, and TV nodes.
 * Features:
 * - Dynamic glowing connection beams that pulse with data packets
 * - Ambient stardust reacting smoothly to mouse velocity
 * - Camera trajectory gently coupled to page scroll
 * - Throttles and halts when tab is blurred or prefers-reduced-motion is enabled
 */
export function FluidConstellationCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060810, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Peer Device Nodes (Phone = Cyan, PC = Indigo, TV = Emerald)
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    interface PeerNode {
      mesh: THREE.Mesh;
      light: THREE.PointLight;
      pos: THREE.Vector3;
      basePos: THREE.Vector3;
      color: number;
      speed: number;
      phase: number;
    }

    const peerNodes: PeerNode[] = [
      {
        pos: new THREE.Vector3(-4.5, 2.2, 0),
        basePos: new THREE.Vector3(-4.5, 2.2, 0),
        color: 0x38bdf8, // Phone - Cyan
        speed: 0.8,
        phase: 0,
        mesh: null as unknown as THREE.Mesh,
        light: null as unknown as THREE.PointLight,
      },
      {
        pos: new THREE.Vector3(4.2, 1.5, -1),
        basePos: new THREE.Vector3(4.2, 1.5, -1),
        color: 0x818cf8, // PC Workstation - Indigo
        speed: 0.6,
        phase: Math.PI * 0.7,
        mesh: null as unknown as THREE.Mesh,
        light: null as unknown as THREE.PointLight,
      },
      {
        pos: new THREE.Vector3(0.5, -3.2, 1),
        basePos: new THREE.Vector3(0.5, -3.2, 1),
        color: 0x34d399, // Android TV - Emerald
        speed: 0.7,
        phase: Math.PI * 1.4,
        mesh: null as unknown as THREE.Mesh,
        light: null as unknown as THREE.PointLight,
      },
    ];

    peerNodes.forEach((node) => {
      // Outer wireframe crystalline sphere
      const geom = new THREE.IcosahedronGeometry(0.85, 1);
      const mat = new THREE.MeshBasicMaterial({
        color: node.color,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(node.pos);

      // Inner glowing core
      const coreGeom = new THREE.SphereGeometry(0.35, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      mesh.add(coreMesh);

      // Point light emitted by each node
      const light = new THREE.PointLight(node.color, 2.5, 12);
      mesh.add(light);

      node.mesh = mesh;
      node.light = light;
      nodeGroup.add(mesh);
    });

    // 3. Dynamic Beams connecting the 3 nodes
    const beamGeom = new THREE.BufferGeometry();
    const beamPositions = new Float32Array(3 * 2 * 3); // 3 edges, 2 vertices each, 3 floats (x,y,z)
    beamGeom.setAttribute("position", new THREE.BufferAttribute(beamPositions, 3));
    const beamMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const beamLines = new THREE.LineSegments(beamGeom, beamMat);
    scene.add(beamLines);

    // 4. Luminous Stardust Particles (250 particles)
    const particleCount = 220;
    const particleGeom = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    const palette = [
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x818cf8),
      new THREE.Color(0x34d399),
      new THREE.Color(0xfbbf24),
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 28;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 16;

      const c = palette[i % palette.length];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.005,
      });
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 5. Mouse tracking & Smooth Parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (e: PointerEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // 6. Scroll tracking for camera altitude
    let scrollProgress = 0;
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // 7. Render Loop
    let raf = 0;
    let clock = new THREE.Clock();
    let isTabVisible = true;

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) clock.start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!isTabVisible) return;

      const t = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Animate peer nodes gently in 3D orbit
      peerNodes.forEach((node, i) => {
        const floatOffset = Math.sin(t * node.speed + node.phase) * 0.45;
        const driftOffset = Math.cos(t * node.speed * 0.8 + node.phase) * 0.35;
        node.mesh.position.set(
          node.basePos.x + driftOffset + mouse.x * 0.6,
          node.basePos.y + floatOffset + mouse.y * 0.6,
          node.basePos.z + Math.sin(t * 0.5 + i) * 0.5
        );
        node.mesh.rotation.x = t * 0.25;
        node.mesh.rotation.y = t * 0.35;
      });

      // Update beam connection lines
      const positions = beamPositions;
      // Edge 1: Node 0 -> Node 1
      positions[0] = peerNodes[0].mesh.position.x;
      positions[1] = peerNodes[0].mesh.position.y;
      positions[2] = peerNodes[0].mesh.position.z;
      positions[3] = peerNodes[1].mesh.position.x;
      positions[4] = peerNodes[1].mesh.position.y;
      positions[5] = peerNodes[1].mesh.position.z;

      // Edge 2: Node 1 -> Node 2
      positions[6] = peerNodes[1].mesh.position.x;
      positions[7] = peerNodes[1].mesh.position.y;
      positions[8] = peerNodes[1].mesh.position.z;
      positions[9] = peerNodes[2].mesh.position.x;
      positions[10] = peerNodes[2].mesh.position.y;
      positions[11] = peerNodes[2].mesh.position.z;

      // Edge 3: Node 2 -> Node 0
      positions[12] = peerNodes[2].mesh.position.x;
      positions[13] = peerNodes[2].mesh.position.y;
      positions[14] = peerNodes[2].mesh.position.z;
      positions[15] = peerNodes[0].mesh.position.x;
      positions[16] = peerNodes[0].mesh.position.y;
      positions[17] = peerNodes[0].mesh.position.z;

      beamGeom.attributes.position.needsUpdate = true;

      // Drift stardust particles
      const posArr = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3] += particleVelocities[i].x;
        posArr[i * 3 + 1] += particleVelocities[i].y;
        posArr[i * 3 + 2] += particleVelocities[i].z;

        // Wrap around boundaries
        if (posArr[i * 3] > 14) posArr[i * 3] = -14;
        if (posArr[i * 3] < -14) posArr[i * 3] = 14;
        if (posArr[i * 3 + 1] > 10) posArr[i * 3 + 1] = -10;
        if (posArr[i * 3 + 1] < -10) posArr[i * 3 + 1] = 10;
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Gentle scroll-driven camera rotation
      camera.position.y = -scrollProgress * 4;
      camera.position.x = mouse.x * 0.8;
      camera.lookAt(0, -scrollProgress * 2, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
