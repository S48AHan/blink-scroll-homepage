import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bounds,
  Center,
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/source/iphone_17_4.glb";

// If the imported GLB is ever sideways, change this to something like:
// [Math.PI / 2, 0, 0] or [0, Math.PI, 0]
const MODEL_BASE_ROTATION = [0, 0, 0];
const MODEL_Z_SLANT = -0.12;

export default function Phone3D({ rotationY = 0 }) {
  return (
    <div className="phone-canvas-shell" aria-label="3D iPhone model">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 28 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={1.45} />
        <directionalLight position={[4, 6, 6]} intensity={3.2} castShadow />
        <directionalLight position={[-4, 2, 4]} intensity={1.5} />
        <pointLight position={[0, 2, 5]} intensity={10} />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.42}>
            <Center>
              <RotatingPhone rotationY={rotationY} />
            </Center>
          </Bounds>

          <Environment preset="city" />
          <ContactShadows
            position={[0, -2.8, 0]}
            opacity={0.34}
            scale={8}
            blur={2.6}
            far={6}
          />
        </Suspense>

        <OrbitControls enabled={false} />
      </Canvas>
    </div>
  );
}

function RotatingPhone({ rotationY }) {
  const rotatingGroupRef = useRef(null);
  const { scene } = useGLTF(MODEL_PATH);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      if (!child.material) return;

      const materials = Array.isArray(child.material)
        ? child.material.map((material) => material.clone())
        : child.material.clone();

      child.material = materials;

      const materialList = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materialList.forEach((material) => {
        material.side = THREE.DoubleSide;
        material.needsUpdate = true;
      });
    });
  }, [clonedScene]);

  useFrame((_, delta) => {
    if (!rotatingGroupRef.current) return;

    rotatingGroupRef.current.rotation.y = THREE.MathUtils.damp(
      rotatingGroupRef.current.rotation.y,
      rotationY,
      8,
      delta
    );
  });

  return (
    <group rotation={MODEL_BASE_ROTATION}>
      <group ref={rotatingGroupRef} rotation={[0, 0, MODEL_Z_SLANT]}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
