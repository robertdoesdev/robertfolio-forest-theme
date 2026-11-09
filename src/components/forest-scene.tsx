"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useForestTheme } from "@/contexts/forest-theme";

function Tree({ x, z = -0.2, scale = 1, tint = 0 }: { x: number; z?: number; scale?: number; tint?: number }) {
  const greens = ["#183d35", "#214d3e", "#2b5944", "#315f48"];
  const color = greens[tint % greens.length];
  return (
    <group position={[x, -1.45, z]} scale={scale}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 1.3, 7]} />
        <meshStandardMaterial color="#604638" roughness={1} />
      </mesh>
      {[0, 0.48, 0.9].map((height, index) => (
        <mesh key={height} position={[0, 1.05 + height, 0]} castShadow>
          <coneGeometry args={[0.72 - index * 0.12, 1.12, 7]} />
          <meshStandardMaterial color={index === 0 ? color : greens[(tint + index) % greens.length]} roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Hills({ isDay }: { isDay: boolean }) {
  return (
    <group>
      <mesh position={[0, -3.35, -1.1]} scale={[8.8, 3.2, 1.7]} receiveShadow>
        <sphereGeometry args={[1, 64, 32]} />
        <meshStandardMaterial color={isDay ? "#5e9b55" : "#254e43"} roughness={1} flatShading />
      </mesh>
      <mesh position={[-5.2, -2.9, -0.8]} scale={[4.3, 2.2, 1.4]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial color={isDay ? "#4c854b" : "#193d37"} roughness={1} flatShading />
      </mesh>
      <mesh position={[5.2, -2.95, -0.7]} scale={[4.1, 2.1, 1.3]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial color={isDay ? "#6ca65a" : "#21463d"} roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function CelestialBody({ isDay }: { isDay: boolean }) {
  const sun = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);
  const sunMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const moonMaterial = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const speed = Math.min(1, delta * 1.7);
    if (sun.current) sun.current.position.y = THREE.MathUtils.damp(sun.current.position.y, isDay ? 3.25 : -2.8, 2.3, delta);
    if (moon.current) moon.current.position.y = THREE.MathUtils.damp(moon.current.position.y, isDay ? -2.8 : 3.25, 2.3, delta);
    if (sunMaterial.current) sunMaterial.current.opacity = THREE.MathUtils.damp(sunMaterial.current.opacity, isDay ? 1 : 0, 3, delta);
    if (moonMaterial.current) moonMaterial.current.opacity = THREE.MathUtils.damp(moonMaterial.current.opacity, isDay ? 0 : 1, 3, delta);
    if (sun.current) sun.current.rotation.z += speed * 0.012;
  });

  return (
    <>
      <group ref={sun} position={[2.8, -2.8, -2]}>
        <mesh>
          <sphereGeometry args={[0.47, 32, 24]} />
          <meshBasicMaterial ref={sunMaterial} color="#ffd987" transparent opacity={0} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.58, 0.62, 48]} />
          <meshBasicMaterial color="#ffd987" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={moon} position={[2.8, 3.25, -2]}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 24]} />
          <meshBasicMaterial ref={moonMaterial} color="#e3e9ff" transparent opacity={1} />
        </mesh>
        <mesh position={[0.15, 0.08, 0.16]}>
          <sphereGeometry args={[0.36, 24, 20]} />
          <meshBasicMaterial color="#15253d" transparent opacity={0.92} />
        </mesh>
      </group>
    </>
  );
}

function Stars({ isDay }: { isDay: boolean }) {
  const points = useMemo(() => {
    const values: number[] = [];
    let seed = 83;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 95; i++) values.push((random() - 0.5) * 15, random() * 5.6 - 0.1, -2.8);
    return new Float32Array(values);
  }, []);
  const material = useRef<THREE.PointsMaterial>(null);
  useFrame((_, delta) => {
    if (material.current) material.current.opacity = THREE.MathUtils.damp(material.current.opacity, isDay ? 0 : 0.85, 2.5, delta);
  });
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={material} color="#e9efff" size={0.035} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

function ForestWorld() {
  const { isDay } = useForestTheme();
  return (
    <>
      <ambientLight intensity={isDay ? 1.35 : 0.45} color={isDay ? "#fff0d2" : "#9fb8ef"} />
      <directionalLight position={[-3, 5, 5]} intensity={isDay ? 2.2 : 0.55} color={isDay ? "#fff0c9" : "#b4c9ff"} />
      <fog attach="fog" args={[isDay ? "#c9e8e8" : "#081522", 8, 22]} />
      <Stars isDay={isDay} />
      <CelestialBody isDay={isDay} />
      <Hills isDay={isDay} />
      <Tree x={-7.2} scale={1.45} tint={0} />
      <Tree x={-5.8} scale={1.08} tint={1} />
      <Tree x={-4.55} scale={0.78} tint={2} />
      <Tree x={7.1} scale={1.5} tint={1} />
      <Tree x={5.8} scale={1.05} tint={2} />
      <Tree x={4.75} scale={0.72} tint={3} />
    </>
  );
}

export default function ForestScene() {
  const { isDay } = useForestTheme();
  return (
    <div aria-hidden="true" className={`forest-scene ${isDay ? "forest-scene--day" : "forest-scene--night"}`}>
      <Canvas
        dpr={[1, 1.35]}
        camera={{ position: [0, 0.25, 10], fov: 38 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ForestWorld />
      </Canvas>
      <div className="forest-atmosphere" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => <span key={`firefly-${index}`} className={`forest-firefly forest-firefly-${index + 1}`} />)}
        {Array.from({ length: 3 }, (_, index) => <span key={`bird-${index}`} className={`forest-bird forest-bird-${index + 1}`} />)}
      </div>
    </div>
  );
}
