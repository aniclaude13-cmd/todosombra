'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  lineaCm: number;
  salidaCm: number;
  colorTela?: string;
  colorAluminio?: string;
}

const CM = 0.01;

function PergolaPalilleria({ lineaCm, salidaCm, colorTela = '#dcd1b8', colorAluminio = '#e8e8e8' }: Props) {
  const linea = lineaCm * CM;
  const salida = salidaCm * CM;
  const perfilAncho = 0.08;
  const perfilAlto = 0.04;

  const numPalillos = Math.max(2, Math.round(linea / 0.5));
  const palilloPositions = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < numPalillos; i++) {
      positions.push(-linea / 2 + (i / (numPalillos - 1)) * linea);
    }
    return positions;
  }, [linea, numPalillos]);

  const telaGeom = useMemo(() => new THREE.PlaneGeometry(linea, salida), [linea, salida]);

  return (
    <group position={[0, 2.4, 0]}>
      {/* Perfil longitudinal izquierdo */}
      <mesh position={[-linea / 2 + perfilAncho / 2, 0, salida / 2]}>
        <boxGeometry args={[perfilAncho, perfilAlto, salida]} />
        <meshStandardMaterial color={colorAluminio} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Perfil longitudinal derecho */}
      <mesh position={[linea / 2 - perfilAncho / 2, 0, salida / 2]}>
        <boxGeometry args={[perfilAncho, perfilAlto, salida]} />
        <meshStandardMaterial color={colorAluminio} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Palillos transversales */}
      {palilloPositions.map((x, i) => (
        <mesh key={i} position={[x, 0, salida / 2]}>
          <boxGeometry args={[0.04, 0.04, salida]} />
          <meshStandardMaterial color={colorAluminio} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Tela horizontal */}
      <mesh position={[0, -perfilAlto / 2 - 0.005, salida / 2]} rotation={[-Math.PI / 2, 0, 0]} geometry={telaGeom}>
        <meshStandardMaterial color={colorTela} side={THREE.DoubleSide} roughness={0.95} />
      </mesh>
    </group>
  );
}

export default function Visor3DPalilleria(props: Props) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-200 to-sky-400 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [4.5, 2.5, 5], fov: 45 }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
          <Environment preset="city" />
          <Grid args={[20, 20]} cellColor="#9ca3af" sectionColor="#6b7280" infiniteGrid fadeDistance={20} />
          <PergolaPalilleria {...props} />
          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={12}
            target={[0, 1.8, 1]}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
