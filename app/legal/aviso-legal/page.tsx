import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso legal · TodoSombra',
  description: 'Información legal del sitio web TodoSombra y de su titular.',
};

export default function AvisoLegalPage() {
  return (
    <>
      <h1>Aviso legal</h1>
      <p className="text-sm text-[#7a756f]">Última actualización: 27 de junio de 2026</p>

      <h2>1. Titularidad del sitio</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
        Información y Comercio Electrónico (LSSICE), se informa de los siguientes datos del titular del sitio web:
      </p>
      <ul>
        <li><strong>Denominación social:</strong> [Pendiente · razón social]</li>
        <li><strong>NIF/CIF:</strong> [Pendiente · NIF/CIF]</li>
        <li><strong>Domicilio:</strong> [Pendiente · domicilio fiscal]</li>
        <li><strong>Correo electrónico de contacto:</strong> <a href="mailto:hola@todosombra.es">hola@todosombra.es</a></li>
        <li><strong>Teléfono:</strong> <a href="tel:+34644592007">+34 644 592 007</a></li>
        <li><strong>Sitio web:</strong> https://todosombra.es</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        El presente aviso legal regula el uso del sitio web <strong>todosombra.es</strong> y de sus subdominios
        (en adelante, &quot;el Sitio&quot;), a través del cual TodoSombra ofrece información comercial sobre toldos,
        pérgolas y estructuras de sombra, permite configurar productos a medida y solicitar presupuestos.
        La instalación de los productos es opcional y se coordina con instaladores colaboradores
        (&quot;Partners&quot;) en las provincias indicadas en el Sitio.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso al Sitio es gratuito y no requiere registro previo. El usuario se compromete a utilizar
        el Sitio de forma diligente, conforme a la ley, la buena fe y el orden público, y a no emplearlo
        para fines ilícitos o lesivos para los derechos del titular o de terceros.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Todos los contenidos del Sitio (textos, imágenes, configurador 3D, logotipos, marcas y código fuente)
        son propiedad del titular o de sus legítimos licenciantes. Queda prohibida su reproducción, distribución,
        comunicación pública o transformación sin autorización expresa, salvo cuando legalmente esté permitido.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        Los precios mostrados por el configurador son orientativos y están sujetos a confirmación tras visita
        técnica cuando corresponda. El titular no se responsabiliza de los daños derivados del uso indebido
        del Sitio ni de interrupciones técnicas ajenas a su control. Tampoco responde de los servicios prestados
        por los Partners instaladores, que son profesionales independientes con responsabilidad propia.
      </p>

      <h2>6. Enlaces externos</h2>
      <p>
        El Sitio puede incluir enlaces a sitios de terceros (por ejemplo, WhatsApp). El titular no controla ni
        se responsabiliza del contenido de dichos sitios.
      </p>

      <h2>7. Legislación aplicable y jurisdicción</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier controversia derivada del uso del
        Sitio, las partes se someten a los Juzgados y Tribunales del domicilio del titular, salvo que la ley
        aplicable disponga otra cosa.
      </p>
    </>
  );
}
