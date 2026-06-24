export type Step =
  | 'menu'
  | 'buscar'
  | 'tipo'
  | 'medidas'
  | 'elegir_modelo'
  | 'variante_pl'
  | 'color_aluminio'
  | 'motor'
  | 'tejido'
  | 'resumen'
  | 'complementos'
  | 'datos_cliente'
  | 'cierre';

export type Ruta = 'buscar' | 'tipo' | 'complementos';

export interface Complemento {
  nombre: string;
  linea?: number;
  precio?: number;
}

export interface ClienteData {
  nombre: string;
  telefono: string;
  localidad: string;
}

export interface WizardState {
  step: Step;
  ruta: Ruta | null;

  // Búsqueda / tipo
  tipoBusqueda: { tipo: string; subtipos: string[] | null } | null;
  productoSearchQuery: string;

  // Medidas
  linea: number | null;
  salida: number | null;

  // Modelos
  compatibles: Array<{ id: string; nombre: string; precio: number }>;
  productoId: string | null;

  // Configuración
  variantePL: string | null;
  colorAluminio: string | null;
  accionamiento: 'manual' | 'motor' | null;
  marcaMotor: 'somfy' | null;
  motor: string | null;
  colorCategoria: string | null;
  colorTela: string | null;

  // Complementos y datos
  complementos: Complemento[];
  cliente: Partial<ClienteData>;
  incluirInstalacion: boolean;

  // Metadata
  precioBase: number;
  precioTotal: number;
  desglose: Array<{ concepto: string; importe: number }>;
  avisos: Array<{ reglaId: string; mensaje: string }>;
}

export const INITIAL_STATE: WizardState = {
  step: 'menu',
  ruta: null,

  tipoBusqueda: null,
  productoSearchQuery: '',

  linea: null,
  salida: null,

  compatibles: [],
  productoId: null,

  variantePL: null,
  colorAluminio: null,
  accionamiento: null,
  marcaMotor: null,
  motor: null,
  colorCategoria: null,
  colorTela: null,

  complementos: [],
  cliente: {},
  incluirInstalacion: false,

  precioBase: 0,
  precioTotal: 0,
  desglose: [],
  avisos: [],
};

export type WizardAction =
  | { type: 'SET_STEP'; step: Step }
  | { type: 'SET_RUTA'; ruta: Ruta }
  | { type: 'SET_TIPO_BUSQUEDA'; tipo: string; subtipos: string[] | null }
  | { type: 'SET_PRODUCTO_QUERY'; query: string }
  | { type: 'SET_MEDIDAS'; linea: number; salida: number }
  | { type: 'SET_COMPATIBLES'; compatibles: Array<{ id: string; nombre: string; precio: number }> }
  | { type: 'SET_PRODUCTO_ID'; id: string }
  | { type: 'SET_VARIANTE_PL'; variante: string }
  | { type: 'SET_COLOR_ALUMINIO'; color: string }
  | { type: 'SET_ACCIONAMIENTO'; accionamiento: 'manual' | 'motor' }
  | { type: 'SET_MARCA_MOTOR'; marca: 'somfy' }
  | { type: 'SET_MOTOR'; motor: string }
  | { type: 'SET_COLOR_CATEGORIA'; categoria: string }
  | { type: 'SET_COLOR_TELA'; color: string }
  | { type: 'ADD_COMPLEMENTO'; complemento: Complemento }
  | { type: 'REMOVE_COMPLEMENTO'; index: number }
  | { type: 'SET_CLIENTE'; cliente: Partial<ClienteData> }
  | { type: 'SET_INSTALACION'; incluir: boolean }
  | { type: 'SET_PRECIO'; precioBase: number; precioTotal: number; desglose: Array<{ concepto: string; importe: number }>; avisos: Array<{ reglaId: string; mensaje: string }> }
  | { type: 'RESET' };

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_RUTA':
      return { ...state, ruta: action.ruta };
    case 'SET_TIPO_BUSQUEDA':
      return { ...state, tipoBusqueda: { tipo: action.tipo, subtipos: action.subtipos } };
    case 'SET_PRODUCTO_QUERY':
      return { ...state, productoSearchQuery: action.query };
    case 'SET_MEDIDAS':
      return { ...state, linea: action.linea, salida: action.salida };
    case 'SET_COMPATIBLES':
      return { ...state, compatibles: action.compatibles };
    case 'SET_PRODUCTO_ID':
      return { ...state, productoId: action.id };
    case 'SET_VARIANTE_PL':
      return { ...state, variantePL: action.variante };
    case 'SET_COLOR_ALUMINIO':
      return { ...state, colorAluminio: action.color };
    case 'SET_ACCIONAMIENTO':
      return { ...state, accionamiento: action.accionamiento };
    case 'SET_MARCA_MOTOR':
      return { ...state, marcaMotor: action.marca };
    case 'SET_MOTOR':
      return { ...state, motor: action.motor };
    case 'SET_COLOR_CATEGORIA':
      return { ...state, colorCategoria: action.categoria };
    case 'SET_COLOR_TELA':
      return { ...state, colorTela: action.color };
    case 'ADD_COMPLEMENTO':
      return { ...state, complementos: [...state.complementos, action.complemento] };
    case 'REMOVE_COMPLEMENTO':
      return { ...state, complementos: state.complementos.filter((_, i) => i !== action.index) };
    case 'SET_CLIENTE':
      return { ...state, cliente: action.cliente };
    case 'SET_INSTALACION':
      return { ...state, incluirInstalacion: action.incluir };
    case 'SET_PRECIO':
      return {
        ...state,
        precioBase: action.precioBase,
        precioTotal: action.precioTotal,
        desglose: action.desglose,
        avisos: action.avisos,
      };
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}
