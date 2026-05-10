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

const CM = 0.01; // 1 cm = 0.01 m

function ToldoAres({ lineaCm, salidaCm, colorTela = '#dcd1b8', colorAluminio = '#e8e8e8' }: Props) {
  const linea = lineaCm * CM;
  const salida = salidaCm * CM;
  const cofreAlto = 0.16;
  const cofreFondo = 0.16;
  const inclinacion = THREE.MathUtils.degToRad(15);

  const lonaGeom = useMemo(() => new THREE.PlaneGeometry(linea, salida, 32, 32), [linea, salida]);

  return (
    <group position={[0, 2.4, 0]}>
      {/* Pared trasera (referencia) */}
      <mesh position={[0, -1.2, -0.1]}>
        <planeGeometry args={[linea + 1.5, 3]} />
        <meshStandardMaterial color="#cfcfcf" />
      </mesh>

      {/* Cofre */}
      <mesh position={[0, 0, cofreFondo / 2]}>
        <boxGeometry args={[linea, cofreAlto, cofreFondo]} />
        <meshStandardMaterial color={colorAluminio} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Brazos articulados (2) */}
      {[-(linea / 2 - 0.2), linea / 2 - 0.2].map((x, i) => (
        <group key={i} position={[x, -cofreAlto / 2, cofreFondo]} rotation={[-inclinacion, 0, 0]}>
          <mesh position={[0, 0, salida / 2]}>
            <boxGeometry args={[0.06, 0.05, salida]} />
            <meshStandardMaterial color={colorAluminio} metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Lona */}
      <group position={[0, 0, cofreFondo]} rotation={[-Math.PI / 2 - inclinacion, 0, 0]}>
        <mesh position={[0, salida / 2, 0]} geometry={lonaGeom}>
          <meshStandardMaterial color={colorTela} side={THREE.DoubleSide} roughness={0.95} />
        </mesh>
      </group>

      {/* Faldilla */}
      <mesh
        position={[
          0,
          -Math.sin(inclinacion) * salida - 0.075,
          cofreFondo + Math.cos(inclinacion) * salida,
        ]}
      >
        <planeGeometry args={[linea, 0.15]} />
        <meshStandardMaterial color={colorTela} side={THREE.DoubleSide} roughness={0.95} />
      </mesh>
    </group>
  );
}

export default function Visor3D(props: Props) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-100 to-sky-300 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [4.5, 2.5, 5], fov: 45 }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
          <Environment preset="park" />
          <Grid args={[20, 20]} cellColor="#9ca3af" sectionColor="#6b7280" infiniteGrid fadeDistance={20} />
          <ToldoAres {...props} />
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
