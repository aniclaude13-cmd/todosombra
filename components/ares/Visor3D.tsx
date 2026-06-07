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
  // Cofre fino y aerodinámico (BOX6100)
  const cofreAlto = 0.13;
  const cofreFondo = 0.16;
  const brazoRadius = 0.019;
  const jointRadius = 0.028;
  const tuboRadius = 0.032;
  const faldonAlto = 0.16;

  // Inclinación realista de la lona (13° hacia abajo: escurre agua)
  const slope = THREE.MathUtils.degToRad(13);

  // Brazos: dos segmentos iguales de longitud exacta salida/2.
  // Al estar el hombro desplazado 25mm en dirección normal-al-tejido (debajo de
  // la lona), la cuerda hombro→tip coincide con la dirección de la pendiente
  // y el brazo queda perfectamente recto al abrir (codo 0°).
  const L_arm = salida / 2;
  const segmento1Largo = L_arm;
  const segmento2Largo = L_arm;
  const shoulderX = linea / 2 - 0.16;
  const lonaStartY = -cofreAlto / 2;
  const lonaStartZ = cofreFondo;
  // Hombro: 25mm por debajo de la superficie inclinada de la lona, en el borde frontal del cofre
  const armOffsetNormal = 0.025;
  const shoulderY = lonaStartY - armOffsetNormal * Math.cos(slope);
  const shoulderZ = lonaStartZ - armOffsetNormal * Math.sin(slope);

  const r = THREE.MathUtils.clamp(extensionRatio, 0, 1);

  // Cinemática realista: el codo SIEMPRE se pliega HACIA ABAJO (por debajo del tejido),
  // nunca hacia arriba. Esto evita el efecto "muelle" y simula un brazo articulado real.
  //
  // - phi: ángulo de desviación del codo respecto a la línea recta hombro-tip.
  //   phi=0  → brazo totalmente recto (extendido).
  //   phi→90°→ brazo totalmente plegado (codo justo debajo del hombro).
  // - smoothstep mantiene el brazo casi recto hasta r~0.7 y empieza a plegar
  //   progresivamente, sin flexiones bruscas. Movimiento suave y natural.
  // - pitch1 = slope + phi: el primer segmento se inclina MÁS hacia abajo
  //   (codo desciende por debajo de la lona).
  // - elbowAngle = -2*phi: el segundo segmento gira en sentido contrario
  //   para alcanzar la barra frontal, formando una "V" invertida bajo el tejido.
  const phiMax = THREE.MathUtils.degToRad(82);
  const closeProgress = THREE.MathUtils.smoothstep(1 - r, 0.20, 0.96);
  const phi = closeProgress * phiMax;
  const pitch1 = slope + phi;
  const elbowAngle = -2 * phi;

  // Cinemática directa: posición del tip
  const seg1EndY = -L_arm * Math.sin(pitch1);
  const seg1EndZ = L_arm * Math.cos(pitch1);

  const pitch2 = pitch1 + elbowAngle; // = slope - phi
  const tipLocalY = seg1EndY - L_arm * Math.sin(pitch2);
  const tipLocalZ = seg1EndZ + L_arm * Math.cos(pitch2);

  // Yaw (cierre horizontal): solo en el último tramo del cierre, para que los brazos
  // se metan paralelos a la pared dentro del cofre.
  const yawProgress = THREE.MathUtils.clamp((0.10 - r) / 0.08, 0, 1);
  const yawMag = THREE.MathUtils.degToRad(85) * yawProgress;

  // Aplicar yaw al tip (rotación alrededor de Y). Brazo derecho yaw negativo, izquierdo positivo.
  // Por simetría ambos tips quedan a la misma Y/Z pero X simétrica.
  const cy = Math.cos(yawMag);
  const sy = Math.sin(yawMag);
  // tip del brazo derecho (lado +X): rotación de yaw negativo del vector (0, tipLocalY, tipLocalZ)
  // x_local rotado = tipLocalZ * sin(-yawMag) = -tipLocalZ * sy
  const tipX_der = shoulderX - tipLocalZ * sy;
  const tipY = shoulderY + tipLocalY;
  const tipZ = shoulderZ + tipLocalZ * cy;

  const frontBarLength = Math.max(0.04, 2 * tipX_der + 0.04);
  const frontBarVisible = r > 0.04;
  const armOpacity = r > 0.15 ? 1 : Math.max(0, (r - 0.04) / 0.11);
  const armVisible = r > 0.04;

  const telaTexture = useFabricTexture(colorTela, lineaCm, salidaCm);
  const wallTexture = useWallTexture();
  const floorTexture = useFloorTexture();

  // Lona: desde la base del cofre hasta el perfil de carga (cima de la barra)
  const lonaDY = (tipY + 0.020) - lonaStartY;
  const lonaDZ = Math.max(0.001, tipZ - lonaStartZ);
  const lonaLength = Math.sqrt(lonaDY * lonaDY + lonaDZ * lonaDZ);
  const lonaWidth = Math.max(0.05, frontBarLength - 0.04);
  const lonaTiltX = Math.atan2(-lonaDY, lonaDZ);
  const telaOpacity = r > 0.05 ? 1 : r * 20;
  const lonaVisible = r > 0.04 && lonaLength > 0.05;

  // Faldón frontal: cae vertical desde la barra
  const faldonVisible = r > 0.15;
  const faldonOpacity = r > 0.3 ? 1 : Math.max(0, (r - 0.15) / 0.15);

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

      {/* Tubo de enrollado dentro del cofre (visible cuando esta abriendo) */}
      {r > 0.05 && (
        <mesh position={[0, -cofreAlto / 4, cofreFondo / 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[tuboRadius, tuboRadius, linea - 0.04, 24]} />
          <meshPhysicalMaterial {...aluProps} metalness={0.7} roughness={0.35} />
        </mesh>
      )}

      {/* Brazos articulados: yaw (pliega hacia el centro) → pitch → codo */}
      {armVisible && ([-1, 1] as const).map((side, i) => {
        // Brazo derecho (side=+1): yaw negativo (rota hacia -X, el centro)
        // Brazo izquierdo (side=-1): yaw positivo
        const yawSigned = -side * yawMag;
        return (
          <group key={i} position={[side * shoulderX, shoulderY, shoulderZ]}>
            {/* Esfera del hombro */}
            <mesh castShadow>
              <sphereGeometry args={[jointRadius, 16, 16]} />
              <meshPhysicalMaterial {...aluProps} transparent opacity={armOpacity} />
            </mesh>
            {/* Rotación yaw (alrededor de Y) — pliega el brazo hacia el centro al cerrar */}
            <group rotation={[0, yawSigned, 0]}>
              {/* Pitch (inclinación vertical) */}
              <group rotation={[pitch1, 0, 0]}>
                {/* Segmento 1 */}
                <mesh position={[0, 0, segmento1Largo / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[brazoRadius, brazoRadius, segmento1Largo, 16]} />
                  <meshPhysicalMaterial {...aluProps} transparent opacity={armOpacity} />
                </mesh>
                {/* Codo articulado */}
                <group position={[0, 0, segmento1Largo]}>
                  <mesh castShadow>
                    <sphereGeometry args={[jointRadius, 16, 16]} />
                    <meshPhysicalMaterial {...aluProps} transparent opacity={armOpacity} />
                  </mesh>
                  <group rotation={[elbowAngle, 0, 0]}>
                    <mesh position={[0, 0, segmento2Largo / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                      <cylinderGeometry args={[brazoRadius, brazoRadius, segmento2Largo, 16]} />
                      <meshPhysicalMaterial {...aluProps} transparent opacity={armOpacity} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        );
      })}

      {/* Perfil de carga (barra frontal): conecta los tips de los dos brazos */}
      {frontBarVisible && (
        <mesh position={[0, tipY, tipZ]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.024, 0.024, frontBarLength, 24]} />
          <meshPhysicalMaterial {...aluProps} />
        </mesh>
      )}

      {/* Lona: del cofre al perfil de carga, inclinada hacia abajo */}
      {lonaVisible && (
        <group position={[0, lonaStartY, lonaStartZ]} rotation={[lonaTiltX, 0, 0]}>
          <mesh position={[0, 0, lonaLength / 2]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <planeGeometry args={[lonaWidth, lonaLength]} />
            <meshStandardMaterial {...telaMapProps} transparent opacity={telaOpacity} />
          </mesh>
        </group>
      )}

      {/* Faldón frontal: cae vertical desde el perfil de carga */}
      {faldonVisible && (
        <mesh
          position={[0, tipY - faldonAlto / 2, tipZ + 0.005]}
          castShadow
        >
          <planeGeometry args={[Math.max(0.05, frontBarLength - 0.08), faldonAlto]} />
          <meshStandardMaterial {...telaMapProps} transparent opacity={telaOpacity * faldonOpacity} />
        </mesh>
      )}

      {/* Sombra proyectada en el suelo */}
      {r > 0.15 && (
        <mesh position={[0, -2.48, tipZ - 0.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[Math.max(0.1, frontBarLength * 0.9), Math.max(0.1, lonaLength * 0.85)]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.15 * r} />
        </mesh>
      )}
    </group>
  );
}

export default function Visor3D(props: Props) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-50 to-sky-200 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [3.4, 4.6, 5.8], fov: 42 }}
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
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
            target={[0, 2.3, 1.3]}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
