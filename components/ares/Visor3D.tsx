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
  extensionRatio?: number;
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

    // Horizontal weft threads (lighter bands)
    for (let y = 0; y < size; y += 14) {
      ctx.fillStyle = `rgba(${Math.min(r + 22, 255)}, ${Math.min(g + 22, 255)}, ${Math.min(b + 22, 255)}, 0.38)`;
      ctx.fillRect(0, y, size, 6);
      ctx.fillStyle = `rgba(${Math.max(r - 18, 0)}, ${Math.max(g - 18, 0)}, ${Math.max(b - 18, 0)}, 0.22)`;
      ctx.fillRect(0, y + 6, size, 5);
    }
    // Vertical warp threads (subtle cross-weave)
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

function useWallTexture(): THREE.CanvasTexture {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#e8ddd3';
    ctx.fillRect(0, 0, size, size);

    // Brick pattern
    const brickW = 64;
    const brickH = 32;
    for (let y = 0; y < size; y += brickH) {
      const offset = (y / brickH) % 2 ? brickW / 2 : 0;
      for (let x = offset - brickW; x < size; x += brickW) {
        // Brick outline
        ctx.strokeStyle = '#c4b5aa';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, brickW, brickH);

        // Slight color variation per brick
        const variation = Math.random() * 15;
        ctx.fillStyle = `rgba(200, 180, 160, ${0.1 + variation / 150})`;
        ctx.fillRect(x + 2, y + 2, brickW - 4, brickH - 4);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 3);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

function useFloorTexture(): THREE.CanvasTexture {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#b4ada5';
    ctx.fillRect(0, 0, size, size);

    // Tile pattern with grout
    const tileSize = 64;
    for (let y = 0; y < size; y += tileSize) {
      for (let x = 0; x < size; x += tileSize) {
        // Tile base
        ctx.fillStyle = `hsl(30, 8%, ${55 + Math.random() * 5}%)`;
        ctx.fillRect(x, y, tileSize, tileSize);

        // Subtle texture variations
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = `rgba(100, 90, 80, ${Math.random() * 0.15})`;
          ctx.fillRect(
            x + Math.random() * tileSize,
            y + Math.random() * tileSize,
            Math.random() * 20 + 10,
            Math.random() * 20 + 10
          );
        }

        // Grout lines
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 4);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

function ToldoAres({ lineaCm, salidaCm, colorTela = '#dcd1b8', colorAluminio = '#f1f1ed', extensionRatio = 1 }: Props) {
  const linea = lineaCm * CM;
  const salida = salidaCm * CM;
  const cofreAlto = 0.18;
  const cofreFondo = 0.19;
  // 0 = fully retracted, 1 = fully extended
  const brazoW = 0.058;
  const brazoH = 0.042;

  // Articulated arm segments
  const segmento1Largo = salida * 0.55;
  const segmento2Largo = salida * 0.45;

  // When extended (ratio = 1), arms align with fabric at ~14 degrees
  // When retracted (ratio = 0), arms fold inward
  const inclinacionExtendida = THREE.MathUtils.degToRad(14);
  const inclinacionSegmento1 = THREE.MathUtils.degToRad(
    7 * extensionRatio + (1 - extensionRatio) * 95
  );
  const inclinacionSegmento2 = THREE.MathUtils.degToRad(
    7 * extensionRatio - (1 - extensionRatio) * 85
  );

  const telaTexture = useFabricTexture(colorTela, lineaCm, salidaCm);
  const wallTexture = useWallTexture();
  const floorTexture = useFloorTexture();
  const lonaGeom = useMemo(() => new THREE.PlaneGeometry(linea, salida), [linea, salida]);

  const frontBarY = -Math.sin(inclinacionExtendida) * salida - cofreAlto / 2;
  const frontBarZ = cofreFondo + Math.cos(inclinacionExtendida) * salida;

  // Shared material props for spread
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
    <group position={[0, 2.5, 0]}>
      {/* Wall */}
      <mesh position={[0, -1.25, -0.13]} receiveShadow>
        <planeGeometry args={[linea + 2.5, 3.6]} />
        <meshStandardMaterial map={wallTexture} roughness={0.95} metalness={0} />
      </mesh>

      {/* Floor (terrace) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0.8]} receiveShadow>
        <planeGeometry args={[linea + 4, 8]} />
        <meshStandardMaterial map={floorTexture} roughness={0.8} metalness={0} />
      </mesh>

      {/* Cofre body */}
      <mesh position={[0, 0, cofreFondo / 2]} castShadow receiveShadow>
        <boxGeometry args={[linea, cofreAlto, cofreFondo]} />
        <meshPhysicalMaterial {...aluProps} />
      </mesh>

      {/* End caps */}
      {([-1, 1] as const).map((s, i) => (
        <mesh key={i} position={[s * (linea / 2 + 0.013), 0, cofreFondo / 2]} castShadow>
          <boxGeometry args={[0.026, cofreAlto, cofreFondo]} />
          <meshPhysicalMaterial {...aluProps} />
        </mesh>
      ))}

      {/* Wall brackets */}
      {[-(linea / 2 - 0.22), linea / 2 - 0.22].map((x, i) => (
        <mesh key={i} position={[x, -0.01, -0.05]} castShadow>
          <boxGeometry args={[0.09, 0.14, 0.13]} />
          <meshPhysicalMaterial {...aluProps} />
        </mesh>
      ))}

      {/* Articulated Arms */}
      {[-(linea / 2 - 0.22), linea / 2 - 0.22].map((x, i) => (
        <group key={i} position={[x, -cofreAlto / 2 - 0.035, cofreFondo / 2]}>
          {/* First arm segment */}
          <group rotation={[inclinacionSegmento1, 0, 0]}>
            <mesh position={[0, 0, segmento1Largo / 2]} castShadow>
              <boxGeometry args={[brazoW, brazoH, segmento1Largo]} />
              <meshPhysicalMaterial {...aluProps} />
            </mesh>
            {/* Second arm segment (articulated joint) */}
            <group position={[0, 0, segmento1Largo]} rotation={[inclinacionSegmento2, 0, 0]}>
              <mesh position={[0, 0, segmento2Largo / 2]} castShadow>
                <boxGeometry args={[brazoW, brazoH, segmento2Largo]} />
                <meshPhysicalMaterial {...aluProps} />
              </mesh>
            </group>
          </group>
        </group>
      ))}

      {/* Front bar */}
      <mesh position={[0, frontBarY, frontBarZ]} castShadow>
        <boxGeometry args={[linea + 0.05, 0.055, 0.04]} />
        <meshPhysicalMaterial {...aluProps} />
      </mesh>

      {/* Lona */}
      <group position={[0, -cofreAlto / 2, cofreFondo]} rotation={[Math.PI / 2 + inclinacionExtendida, 0, 0]}>
        <mesh position={[0, salida / 2, 0]} geometry={lonaGeom} castShadow receiveShadow>
          <meshStandardMaterial {...telaMapProps} />
        </mesh>
      </group>

      {/* Faldilla */}
      <mesh position={[0, frontBarY - 0.09, frontBarZ + 0.015]} castShadow>
        <planeGeometry args={[linea, 0.18]} />
        <meshStandardMaterial {...telaMapProps} />
      </mesh>
    </group>
  );
}

export default function Visor3D(props: Props) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-50 to-sky-200 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [3.5, 2.2, 6.5], fov: 38 }}
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
          <ToldoAres {...props} />
          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={14}
            target={[0, 1.8, 1.5]}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
