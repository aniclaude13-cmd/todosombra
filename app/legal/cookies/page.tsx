import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de cookies · TodoSombra',
  description: 'Información sobre las cookies y tecnologías similares utilizadas en TodoSombra.',
};

export default function CookiesPage() {
  return (
    <>
      <h1>Política de cookies</h1>
      <p className="text-sm text-[#7a756f]">Última actualización: 27 de junio de 2026</p>

      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos que se descargan en tu dispositivo al visitar un sitio web. Permiten
        almacenar y recuperar información sobre la navegación para distintas finalidades (técnicas, de
        personalización, analíticas, etc.).
      </p>

      <h2>2. Cookies que utiliza este sitio</h2>
      <p>
        Actualmente <strong>todosombra.es</strong> utiliza únicamente cookies técnicas estrictamente necesarias
        para el funcionamiento del sitio (sesión, preferencias del configurador, seguridad). Estas cookies están
        exentas del deber de informar y obtener consentimiento conforme al artículo 22.2 de la LSSI.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Finalidad</th>
            <th>Duración</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>__session</td>
            <td>Mantener la sesión y los pasos del configurador</td>
            <td>Sesión</td>
            <td>Técnica · propia</td>
          </tr>
        </tbody>
      </table>
      <p>
        Si en el futuro incorporamos cookies analíticas o de marketing (por ejemplo, Plausible, Google Analytics
        o Meta Pixel), actualizaremos esta política y solicitaremos tu consentimiento previo mediante el banner
        de cookies.
      </p>

      <h2>3. Cómo gestionar las cookies</h2>
      <p>
        Puedes configurar tu navegador para aceptar, rechazar o eliminar las cookies instaladas en tu
        dispositivo. Te dejamos los enlaces de los navegadores más habituales:
      </p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
        <li><a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      </ul>

      <h2>4. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política de cookies en cualquier momento. Te recomendamos revisarla
        periódicamente.
      </p>

      <h2>5. Contacto</h2>
      <p>
        Si tienes dudas sobre el uso de cookies, escríbenos a
        {' '}<a href="mailto:hola@todosombra.es">hola@todosombra.es</a>.
      </p>
    </>
  );
}
