import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de privacidad · TodoSombra',
  description: 'Cómo trata TodoSombra los datos personales recogidos en su sitio web y configurador.',
};

export default function PrivacidadPage() {
  return (
    <>
      <h1>Política de privacidad</h1>
      <p className="text-sm text-[#7a756f]">Última actualización: 27 de junio de 2026</p>

      <p>
        En TodoSombra nos tomamos en serio la protección de tus datos. Esta política explica qué información
        recogemos, para qué la usamos y qué derechos tienes, conforme al Reglamento (UE) 2016/679 (RGPD) y a
        la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><strong>Responsable:</strong> [Pendiente · razón social]</li>
        <li><strong>NIF/CIF:</strong> [Pendiente · NIF/CIF]</li>
        <li><strong>Domicilio:</strong> [Pendiente · domicilio fiscal]</li>
        <li><strong>Correo de contacto:</strong> <a href="mailto:hola@todosombra.es">hola@todosombra.es</a></li>
      </ul>

      <h2>2. Datos que recogemos</h2>
      <p>Tratamos los datos que nos facilitas voluntariamente a través de:</p>
      <ul>
        <li><strong>Formulario de presupuesto / configurador:</strong> nombre, teléfono, correo electrónico, localidad y datos del producto configurado.</li>
        <li><strong>WhatsApp y correo:</strong> los datos que decidas compartir en la conversación.</li>
        <li><strong>Datos de navegación:</strong> dirección IP, navegador, dispositivo y páginas visitadas (ver política de cookies).</li>
      </ul>

      <h2>3. Finalidad y base legal</h2>
      <ul>
        <li><strong>Atender solicitudes de presupuesto y comunicación comercial directa</strong> — base legal: consentimiento del interesado y ejecución de medidas precontractuales.</li>
        <li><strong>Coordinar la instalación con nuestros Partners</strong>, cuando lo solicites — base legal: consentimiento del interesado.</li>
        <li><strong>Cumplir obligaciones legales</strong> (fiscales, contables) — base legal: obligación legal.</li>
        <li><strong>Mejorar el sitio y prevenir fraude</strong> — base legal: interés legítimo.</li>
      </ul>

      <h2>4. Destinatarios y cesiones</h2>
      <p>
        Tus datos podrán comunicarse a:
      </p>
      <ul>
        <li>Nuestros Partners instaladores en tu provincia, únicamente cuando solicites instalación.</li>
        <li>Proveedores tecnológicos que actúan como encargados del tratamiento (hosting, correo, mensajería, analítica), con los contratos de encargo correspondientes.</li>
        <li>Administraciones públicas cuando exista obligación legal.</li>
      </ul>
      <p>No vendemos tus datos a terceros y no realizamos transferencias internacionales fuera del marco UE/garantías adecuadas.</p>

      <h2>5. Conservación</h2>
      <p>
        Conservamos los datos mientras dure la relación comercial y, después, durante los plazos legales
        de prescripción aplicables (fiscal, contable). Los datos de leads no convertidos se eliminan a los 24 meses
        salvo que solicites su supresión antes.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad,
        así como revocar el consentimiento prestado, enviando un correo a
        {' '}<a href="mailto:hola@todosombra.es">hola@todosombra.es</a> con copia de un documento identificativo.
        Si consideras que tus derechos no han sido atendidos, puedes presentar reclamación ante la
        Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no
        autorizados, alteración, pérdida o destrucción.
      </p>
    </>
  );
}
