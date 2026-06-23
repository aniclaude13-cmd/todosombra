'use client';

import { useReducer, useState } from 'react';
import { INITIAL_STATE, wizardReducer } from '@/lib/configurador/state';
import WizardHeader from './WizardHeader';
import StepMenu from './steps/StepMenu';
import StepBuscar from './steps/StepBuscar';
import StepTipo from './steps/StepTipo';
import StepMedidas from './steps/StepMedidas';
import StepElegirModelo from './steps/StepElegirModelo';
import StepVariantePL from './steps/StepVariantePL';
import StepColorAluminio from './steps/StepColorAluminio';
import StepMotor from './steps/StepMotor';
import StepTejido from './steps/StepTejido';
import StepResumen from './steps/StepResumen';
import StepComplementos from './steps/StepComplementos';
import StepDatosCliente from './steps/StepDatosCliente';
import StepCierre from './steps/StepCierre';

export default function ConfiguradorWizard() {
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  const renderStep = () => {
    switch (state.step) {
      case 'menu':
        return <StepMenu state={state} dispatch={dispatch} />;
      case 'buscar':
        return <StepBuscar state={state} dispatch={dispatch} />;
      case 'tipo':
        return <StepTipo state={state} dispatch={dispatch} />;
      case 'medidas':
        return <StepMedidas state={state} dispatch={dispatch} setLoading={setLoading} />;
      case 'elegir_modelo':
        return <StepElegirModelo state={state} dispatch={dispatch} setLoading={setLoading} />;
      case 'variante_pl':
        return <StepVariantePL state={state} dispatch={dispatch} />;
      case 'color_aluminio':
        return <StepColorAluminio state={state} dispatch={dispatch} />;
      case 'motor':
        return <StepMotor state={state} dispatch={dispatch} />;
      case 'tejido':
        return <StepTejido state={state} dispatch={dispatch} />;
      case 'resumen':
        return <StepResumen state={state} dispatch={dispatch} />;
      case 'complementos':
        return <StepComplementos state={state} dispatch={dispatch} />;
      case 'datos_cliente':
        return <StepDatosCliente state={state} dispatch={dispatch} setLoading={setLoading} />;
      case 'cierre':
        return <StepCierre state={state} />;
      default:
        return null;
    }
  };

  const showHeader = state.step !== 'menu' && state.step !== 'cierre';

  return (
    <div className="max-w-2xl px-4">
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin w-8 h-8 border-4 border-[#d4a034] border-t-transparent rounded-full" />
          </div>
        </div>
      )}
      {showHeader && <WizardHeader state={state} dispatch={dispatch} />}
      <div className={showHeader ? 'pb-8' : 'py-8'}>{renderStep()}</div>
    </div>
  );
}
