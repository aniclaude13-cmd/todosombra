'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  lineaCm: number;
  salidaCm: number;
  colorTela?: string;
  colorAluminio?: string;
}

const CM = 0.01;

function useFabricTexture(colorHex: string, lineaCm: number, salidaCm: number): THREE.CanvasTexture | null {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);

    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 14) {
      ctx.fillStyle = `rgba(${Math.min(r + 22, 255)}, ${Math.min(g + 22, 255)}, ${Math.min(b + 22, 255)}, 0.38)`;
      ctx.fillRect(0, y, size, 6);
      ctx.fillStyle = `rgba(${Math.max(r - 18, 0)}, ${Math.max(g - 18, 0)}, ${Math.max(b - 18, 0)}, 0.22)`;
      ctx.fillRect(0, y + 6, size, 5);
    }
    for (let x = 0; x < size; x += 14) {
      ctx.fillStyle = `rgba(${Math.max(r - 8, 0)}, ${Math.max(g - 8, 0)}, ${Math.max(b - 8, 0)}, 0.12)`;
      ctx.fillRect(x, 0, 3, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(lineaCm / 45, salidaCm / 45);
    texture.needsUpdate = true;
    return texture;
  }, [colorHex, lineaCm, salidaCm]);
}

function PergolaPalilleria({ lineaCm, salidaCm, colorTela = '#dcd1b8', colorAluminio = '#f1f1ed' }: Props) {
  const linea = lineaCm * CM;
  const salida = salidaCm * CM;

  // Perfil 80×40 mm
  const palW = 0.08;
  const palH = 0.04;
  // Beam dimensions for the frame
  const beamH = 0.06;
  const beamD = 0.08;

  // Palillos: one every ~11 cm (80mm lath + ~30mm gap)
  const numPalillos = Math.max(3, Math.round(lineaCm / 11));
  const palilloPositions = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < numPalillos; i++) {
      pos.push(-linea / 2 + palW / 2 + (i / (numPalillos - 1)) * (linea - palW));
    }
    return pos;
  }, [linea, numPalillos, palW]);

  const telaGeom = useMemo(() => new THREE.PlaneGeometry(linea, salida), [linea, salida]);
  const telaTexture = useFabricTexture(colorTela, lineaCm, salidaCm);

  const aluProps = {
    color: colorAluminio,
    metalness: 0.55,
    roughness: 0.42,
    clearcoat: 0.45,
    clearcoatRoughness: 0.18,
  };

  const telaMapProps = {
    map: telaTexture ?? undefined,
    color: telaTexture ? '#ffffff' : colorTela,
    side: THREE.DoubleSide as THREE.Side,
    roughness: 0.95,
    metalness: 0,
  };

  return (
    <group position={[0, 2.4, 0]}>
      {/* Wall */}
      <mesh position={[0, -1.2, -0.12]} receiveShadow>
        <planeGeometry args={[linea + 2.5, 3.6]} />
        <meshStandardMaterial color="#dedad4" roughness={1} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, salida / 2]} receiveShadow>
        <planeGeometry args={[linea + 4, salida + 3]} />
        <meshStandardMaterial color="#b4ada5" roughness={0.88} />
      </mesh>

      {/* Left lateral beam */}
      <mesh position={[-linea / 2 + beamD / 2, 0, salida / 2]} castShadow receiveShadow>
        <boxGeometry args={[beamD, beamH, salida]} />
        <meshPhysicalMaterial {...aluProps} />
      </mesh>

      {/* Right lateral beam */}
      <mesh position={[linea / 2 - beamD / 2, 0, salida / 2]} castShadow receiveShadow>
        <boxGeometry args={[beamD, beamH, salida]} />
        <meshPhysicalMaterial {...aluProps} />
      </mesh>

      {/* Front beam */}
      <mesh position={[0, 0, salida - beamD / 2]} castShadow>
        <boxGeometry args={[linea, beamH, beamD]} />
        <meshPhysicalMaterial {...aluProps} />
      </mesh>

      {/* Back beam (wall side) */}
      <mesh position={[0, 0, beamD / 2]} castShadow>
        <boxGeometry args={[linea, beamH, beamD]} />
        <meshPhysicalMaterial {...aluProps} />
      </mesh>

      {/* Wall brackets */}
      {[-(linea / 2 - 0.22), linea / 2 - 0.22].map((x, i) => (
        <mesh key={i} position={[x, 0.01, 0]} castShadow>
          <boxGeometry args={[0.09, 0.14, 0.12]} />
          <meshPhysicalMaterial {...aluProps} />
        </mesh>
      ))}

      {/* Palillos (lamas 80×40) */}
      {palilloPositions.map((x, i) => (
        <mesh key={i} position={[x, palH / 2 + beamH / 2 - 0.005, salida / 2]} castShadow receiveShadow>
          <boxGeometry args={[palW, palH, salida - beamD * 2]} />
          <meshPhysicalMaterial {...aluProps} />
        </mesh>
      ))}

      {/* Tela debajo de los palillos */}
      <mesh
        position={[0, -beamH / 2 - 0.003, salida / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={telaGeom}
        receiveShadow
      >
        <meshStandardMaterial {...telaMapProps} />
      </mesh>
    </group>
  );
}

export default function Visor3DPalilleria(props: Props) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-50 to-sky-200 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [2.5, 4.5, 6], fov: 40 }}
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[5, 9, 4]}
            intensity={1.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={25}
            shadow-camera-left={-7}
            shadow-camera-right={7}
            shadow-camera-top={7}
            shadow-camera-bottom={-7}
          />
          <directionalLight position={[-4, 3, -1]} intensity={0.25} />
          <Environment preset="apartment" />
          <PergolaPalilleria {...props} />
          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={14}
            target={[0, 1.8, 2]}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
