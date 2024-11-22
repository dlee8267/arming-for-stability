// jet_animation.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function startJetAnimation(container) {
  let scene, camera, renderer, controls;
  let jets = [];
  const NUM_JETS = 150;
  const jetModelPath = `${process.env.PUBLIC_URL}/f16-c_falcon.glb`; // Adjust path if necessary
  const worldMapPath = `${process.env.PUBLIC_URL}/taiwan_gmap.png`;  // Adjust path if necessary

  let animationFrameId;
  let startTime = Date.now();

  init();
  animate();

  function init() {
    // Scene Setup
    scene = new THREE.Scene();

    // Camera Setup
    camera = new THREE.PerspectiveCamera(
      60, 16/9, 0.1, 1000
    );
    camera.position.set(0, 200, 0); // Position the camera above the map
    camera.lookAt(0, 0, 0); // Make the camera look at the center of the scene

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Enable alpha for transparency
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(container.clientWidth, container.clientWidth * 9 /16);
    container.appendChild(renderer.domElement);

    // OrbitControls Setup (Optional)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false; // Disable rotation to keep the camera fixed
    controls.enableZoom = false;   // Disable zoom if necessary

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
        jetModel.scale.set(0.2, 0.2, 0.2); // Initial scale

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
            delay: i * 0.1 // Stagger the jets by 0.1 seconds each
          });
        }
      },
      undefined,
      (error) => {
        console.error('Error loading the jet model:', error);
      }
    );

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize, false);
  }

  function initializeJet(jet, index) {
    // Position jets along the top edge from left to right
    const startX = -200 + (400 / NUM_JETS) * index;
    const startZ = -100; // Top edge of the map
    const startY = 10;   // Slightly above the map
    const position = new THREE.Vector3(startX, startY, startZ);
    jet.position.copy(position);

    // Initial rotation towards landing position
    jet.lookAt(getLandingPosition(index));

    // Rotate the jet 180 degrees around Y-axis to face forward
    jet.rotateY(Math.PI);

    // Return the initial position for scaling calculations
    return position;
  }

  function getLandingPosition(index) {
    // Define landing area parameters
    const startAngle = 255; // Starting angle in degrees
    const endAngle = 105;   // Ending angle in degrees
    const totalSpread = startAngle - endAngle; // Should be 150 degrees
    const deltaAngle = totalSpread / (NUM_JETS - 1); // Degrees per jet

    // Calculate the angle for the current jet
    const angleDegrees = startAngle - deltaAngle * index;

    // Adjust the angle to rotate the arc by 90 degrees counterclockwise
    const adjustedAngleDegrees = angleDegrees - 90; // Subtract 90 degrees
    const angleRadians = THREE.MathUtils.degToRad(adjustedAngleDegrees);

    // Landing radius and center position
    const landingRadius = 100; // Adjust as needed
    const centerX = 0;         // Center X-coordinate
    const centerZ = 28;         // last was 21

    // Calculate landing position along the arc
    const landingX = centerX + landingRadius * Math.cos(angleRadians);
    const landingZ = centerZ + (landingRadius * Math.sin(angleRadians)) * 0.5; // Flattened vertically

    return new THREE.Vector3(landingX, 0, landingZ);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const elapsedTime = (Date.now() - startTime) / 1000; // In seconds

    jets.forEach((jetData) => {
      if (!jetData.landed) {
        if (elapsedTime > jetData.delay) {
          const jet = jetData.object;
          const target = jetData.targetPosition;

          // Move jet towards the target
          const direction = new THREE.Vector3().subVectors(target, jet.position).normalize();
          const speed = 1; // Adjust speed if necessary
          jet.position.add(direction.multiplyScalar(speed));

          // Adjust the jet's scale based on distance to target
          const totalDistance = jetData.initialPosition.distanceTo(target);
          const currentDistance = jet.position.distanceTo(target);
          const scale = 0.2 + 0.8 * (1 - currentDistance / totalDistance); // Scale from 0.2 to 1
          jet.scale.set(scale, scale, scale);

          // Check if the jet has "landed"
          if (jet.position.distanceTo(target) < 1) {
            jetData.landed = true;
            jet.position.copy(target);

            // Set the jet's rotation to match the adjusted angle
            const angleDegrees = 200 + ((255 - 105) / (NUM_JETS - 1)) * jetData.index;
            const adjustedAngleDegrees = angleDegrees - 90; // Subtract 90 degrees
            const angleRadians = THREE.MathUtils.degToRad(adjustedAngleDegrees);
            jet.rotation.set(0, angleRadians, 0);
          }
        }
      }
    });

    // Update controls if you keep OrbitControls
    controls.update();
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = 16 / 9; // fixed ratio
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientWidth * 9 / 16);
  }

  // Return a clean-up function to stop the animation and remove event listeners
  return () => {
    window.removeEventListener('resize', onWindowResize, false);
    cancelAnimationFrame(animationFrameId);

    // Clean up Three.js scene
    renderer.dispose();
    controls.dispose();

    // Remove the renderer's canvas from the container
    container.removeChild(renderer.domElement);
  };
}
