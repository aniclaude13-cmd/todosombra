export interface ProductDetail {
  id: string;
  nombre: string;
  tagline: string;
  descripcion: string;
  caracteristicas: string[];
  beneficios: string[];
  imagenHero: string;
  galeriaFotos: string[];
  precioDesde?: number;
  garantia: string;
}

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  BOX6100_ARES: {
    id: 'BOX6100_ARES',
    nombre: 'ARES',
    tagline: 'Toldo cofre motorizado de diseño elegante',
    descripcion: 'El toldo ARES es la solución premium para terrazas modernas. Cofre protector integrado, motorización Somfy, y materiales de primera calidad. Diseñado para máxima durabilidad y estética.',
    caracteristicas: [
      'Cofre protector de aluminio lacado',
      'Motorización Somfy RTS/iO opcional',
      'Tejido Sauleda 100% poliéster',
      '4 semanas de entrega',
      'Montaje sencillo sobre fachada o techo',
    ],
    beneficios: [
      'Protección total del tejido cuando está recogido',
      'Manejo motorizado con mando a distancia',
      'Colores RAL personalizables',
      'Silencioso y duradero',
      'Integración con domótica posible',
    ],
    imagenHero: '/box6100-ares-catalog.jpg',
    galeriaFotos: [
      '/box6100-ares-catalog.jpg',
      '/box6100-ares-1.jpg',
      '/box6100-ares-2.jpg',
    ],
    precioDesde: 1850,
    garantia: '10 años en estructura y motor',
  },
  BOX6000: {
    id: 'BOX6000',
    nombre: 'IRIS',
    tagline: 'Toldo cofre versátil para cualquier presupuesto',
    descripcion: 'El IRIS es el toldo cofre clásico de AWMA. Combinación perfecta de robustez, elegancia y precio accesible. Disponible en versión manual o motorizada.',
    caracteristicas: [
      'Cofre semicofre de aluminio',
      'Manual o motorizado',
      'Fácil instalación',
      'Amplia gama de colores',
      'Mantenimiento mínimo',
    ],
    beneficios: [
      'Larga duración bajo condiciones de playa',
      'Precio competitivo',
      'Soporte técnico directo de AWMA',
      'Repuestos disponibles',
      'Compatible con solaramas',
    ],
    imagenHero: '/box6000-iris-catalog.jpg',
    galeriaFotos: [
      '/box6000-iris-catalog.jpg',
      '/box6000-iris-1.jpg',
    ],
    precioDesde: 1400,
    garantia: '10 años',
  },
  BOX6100: {
    id: 'BOX6100',
    nombre: 'BOX6100',
    tagline: 'Cofre grande para proyectos comerciales',
    descripcion: 'Sistema profesional para espacios grandes. Robustez garantizada en entornos comerciales, hoteles y residencias. Motorización de serie.',
    caracteristicas: [
      'Cofre de gran capacidad',
      'Motor Somfy de potencia',
      'Refuerzo estructural',
      'Hasta 800 cm de línea',
      'Mantenimiento industrial',
    ],
    beneficios: [
      'Ideal para negocios',
      'Garantía extendida disponible',
      'Servicio técnico dedicado',
      'Accesorios avanzados',
      'Escalabilidad',
    ],
    imagenHero: '/box6100-catalog.jpg',
    galeriaFotos: [
      '/box6100-catalog.jpg',
    ],
    precioDesde: 2200,
    garantia: '10 años + opción extensión',
  },
  PL7000: {
    id: 'PL7000',
    nombre: 'Palillería 80×40',
    tagline: 'Pérgola de lamas fijas resistente',
    descripcion: 'Estructura de aluminio con palillería de madera tratada. Estética natural y moderna. Excelente resistencia al viento y durabilidad.',
    caracteristicas: [
      'Lamas de madera 80×40 mm',
      'Marco de aluminio anodizado',
      'Fácil instalación',
      'Sin motorización',
      'Mantenimiento bajo',
    ],
    beneficios: [
      'Aspecto natural y cálido',
      'Resistencia superior',
      'Bajo precio',
      'Sombra continua',
      'Compatible con plantas trepadoras',
    ],
    imagenHero: '/pl7000-catalog.jpg',
    galeriaFotos: [
      '/pl7000-catalog.jpg',
    ],
    precioDesde: 950,
    garantia: '5 años en estructura',
  },
  TX7900: {
    id: 'TX7900',
    nombre: 'TENXO',
    tagline: 'Pérgola motorizada con lamas orientables',
    descripcion: 'Lujo y funcionalidad. Pérgola moderna con lamas motorizadas orientables, tela enrollable y sistemas smart. Control total de la sombra y la ventilación.',
    caracteristicas: [
      'Lamas motorizadas y orientables',
      'Tela motorizada integrada',
      'Motor Somfy iO',
      'Diseño ultra moderno',
      'Control por aplicación móvil',
    ],
    beneficios: [
      'Máximo control de luz y ventilación',
      'Automatización inteligente',
      'Estética premium',
      'Resistencia a viento extremo',
      'Bajo mantenimiento',
    ],
    imagenHero: '/tenxo-catalog.png',
    galeriaFotos: [
      '/tenxo-catalog.png',
    ],
    precioDesde: 3200,
    garantia: '10 años en estructura, 5 en motor',
  },
  AV8400: {
    id: 'AV8400',
    nombre: 'NEXUS 80',
    tagline: 'Cortaviento vertical para terrazas',
    descripcion: 'Sistema vertical compacto. Protección contra viento lateral y privacidad. Cristal fijo, screen o tela enrollable.',
    caracteristicas: [
      'Cristal templado o screen',
      'Marco de aluminio anodizado',
      'Fácil desmontaje',
      'Instalación sin obras',
      'Opción tela motorizada',
    ],
    beneficios: [
      'Solución rápida y limpia',
      'Privacidad inmediata',
      'Luz natural preservada',
      'Precio accesible',
      'Ampliable',
    ],
    imagenHero: '/av8400-nexus80-catalog.jpg',
    galeriaFotos: [
      '/av8400-nexus80-catalog.jpg',
    ],
    precioDesde: 450,
    garantia: '5 años',
  },
  ART4100: {
    id: 'ART4100',
    nombre: 'ART 4100',
    tagline: 'Brazo articulado clásico retráctil',
    descripcion: 'El toldo de brazos retráctiles por excelencia. Fácil de instalar, máxima salida, y elegancia clásica. Manual o motorizado.',
    caracteristicas: [
      'Brazos retráctiles de aluminio',
      'Tejido Sauleda premium',
      'Manual o motorizado',
      'Hasta 500 cm de salida',
      'Instalación en fachada',
    ],
    beneficios: [
      'Clásico y funcional',
      'Bajo costo de instalación',
      'Máxima proyección horizontal',
      'Mantenimiento sencillo',
      'Gran variedad de colores',
    ],
    imagenHero: '/art4100-catalog.jpg',
    galeriaFotos: [
      '/art4100-catalog.jpg',
    ],
    precioDesde: 600,
    garantia: '10 años',
  },
};

export function obtenerProductoDetail(id: string): ProductDetail | null {
  return PRODUCT_DETAILS[id] || null;
}
