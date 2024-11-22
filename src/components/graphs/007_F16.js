// jet_animation.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function startJetAnimation(container) {
  let scene, camera, renderer, controls;
  let jets = [];
  const NUM_JETS = 150;

  // Use PUBLIC_URL for static asset paths
  const jetModelPath = `${process.env.PUBLIC_URL}/f16-c_falcon.glb`;
  const worldMapPath = `${process.env.PUBLIC_URL}/taiwan_gmap.png`;

  let animationFrameId;
  let startTime = Date.now();

  init();
  animate();

  function init() {
    // Scene Setup
    scene = new THREE.Scene();

    // Camera Setup
    camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
    camera.position.set(0, 200, 0); // Above the map
    camera.lookAt(0, 0, 0); // Center of the scene

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(container.clientWidth, container.clientWidth * 9 / 16);
    container.appendChild(renderer.domElement);

    // OrbitControls Setup (Optional)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false; // Fixed rotation
    controls.enableZoom = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    scene.add(directionalLight);

    // Load World Map
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(worldMapPath, (texture) => {
      const planeGeometry = new THREE.PlaneGeometry(400, 200);
      const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const worldMap = new THREE.Mesh(planeGeometry, planeMaterial);
      worldMap.rotation.x = -Math.PI / 2;
      scene.add(worldMap);
    });

    // Load Jet Model
    const loader = new GLTFLoader();
    loader.load(
      jetModelPath,
      (gltf) => {
        const jetModel = gltf.scene;
        jetModel.scale.set(0.2, 0.2, 0.2);

        for (let i = 0; i < NUM_JETS; i++) {
          const jet = jetModel.clone();
          const initialPosition = initializeJet(jet, i);
          scene.add(jet);
          jets.push({
            object: jet,
            index: i,
            landed: false,
            targetPosition: getLandingPosition(i),
            initialPosition: initialPosition.clone(),
            delay: i * 0.1, // Stagger jets
          });
        }
      },
      undefined,
      (error) => {
        console.error('Error loading jet model:', error);
      }
    );

    // Handle Resize
    window.addEventListener('resize', onWindowResize);
  }

  function initializeJet(jet, index) {
    const startX = -200 + (400 / NUM_JETS) * index;
    const startZ = -100; // Top edge of the map
    const startY = 10;
    const position = new THREE.Vector3(startX, startY, startZ);
    jet.position.copy(position);

    jet.lookAt(getLandingPosition(index));
    jet.rotateY(Math.PI);

    return position;
  }

  function getLandingPosition(index) {
    const startAngle = 255; // Starting angle in degrees
    const endAngle = 105;   // Ending angle in degrees
    const deltaAngle = (startAngle - endAngle) / (NUM_JETS - 1);

    const angleDegrees = startAngle - deltaAngle * index;
    const adjustedAngleDegrees = angleDegrees - 90;
    const angleRadians = THREE.MathUtils.degToRad(adjustedAngleDegrees);

    const landingRadius = 100;
    const centerX = 0;
    const centerZ = 28;

    const landingX = centerX + landingRadius * Math.cos(angleRadians);
    const landingZ = centerZ + landingRadius * Math.sin(angleRadians) * 0.5;

    return new THREE.Vector3(landingX, 0, landingZ);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const elapsedTime = (Date.now() - startTime) / 1000;

    jets.forEach((jetData) => {
      if (!jetData.landed && elapsedTime > jetData.delay) {
        const jet = jetData.object;
        const target = jetData.targetPosition;

        const direction = new THREE.Vector3().subVectors(target, jet.position).normalize();
        const speed = 1; // Movement speed
        jet.position.add(direction.multiplyScalar(speed));

        const totalDistance = jetData.initialPosition.distanceTo(target);
        const currentDistance = jet.position.distanceTo(target);
        const scale = 0.2 + 0.8 * (1 - currentDistance / totalDistance);
        jet.scale.set(scale, scale, scale);

        if (jet.position.distanceTo(target) < 1) {
          jetData.landed = true;
          jet.position.copy(target);

          const angleDegrees = 200 + ((255 - 105) / (NUM_JETS - 1)) * jetData.index;
          const adjustedAngleDegrees = angleDegrees - 90;
          const angleRadians = THREE.MathUtils.degToRad(adjustedAngleDegrees);
          jet.rotation.set(0, angleRadians, 0);
        }
      }
    });

    controls.update();
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = 16 / 9;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientWidth * 9 / 16);
  }

  // Cleanup
  return () => {
    window.removeEventListener('resize', onWindowResize);
    cancelAnimationFrame(animationFrameId);
    renderer.dispose();
    controls.dispose();
    container.removeChild(renderer.domElement);
  };
}
