'use client';

import { Suspense } from 'react';
import ConfiguradorWizard from './ConfiguradorWizard';

export default function ConfiguradorWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-[#7a756f]">Cargando configurador...</div>}>
      <ConfiguradorWizard />
    </Suspense>
  );
}
