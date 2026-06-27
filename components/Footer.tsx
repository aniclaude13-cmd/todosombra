import Link from 'next/link';

export default function Footer() {
  const whatsappLink = 'https://wa.me/34644592007?text=Hola%2C%20me%20interesa%20un%20toldo%20o%20p%C3%A9rgola';

  return (
    <footer className="bg-[#1a1917] text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Información */}
          <div>
            <h3 className="font-bold text-lg mb-4">TodoSombra</h3>
            <p className="text-[#a8a5a0] text-sm leading-relaxed">
              Toldos y pérgolas a medida, directos de fábrica. Instalación opcional con nuestros Partners.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold mb-4 text-[#d4a034]">Contacto</h4>
            <ul className="space-y-2 text-sm text-[#a8a5a0]">
              <li>
                <a href="tel:+34644592007" className="hover:text-[#d4a034] transition">
                  📞 +34 644 592 007
                </a>
              </li>
              <li className="text-[#7a7a7a]">Alicante · Valencia · Tarragona · Madrid · Murcia</li>
              <li className="text-[#7a7a7a] text-xs pt-2">Respuesta de lunes a viernes</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-[#d4a034]">Legal</h4>
            <ul className="space-y-2 text-sm text-[#a8a5a0]">
              <li><Link href="/legal/aviso-legal" className="hover:text-[#d4a034] transition">Aviso legal</Link></li>
              <li><Link href="/legal/privacidad" className="hover:text-[#d4a034] transition">Política de privacidad</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-[#d4a034] transition">Política de cookies</Link></li>
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div className="flex flex-col items-center md:items-end justify-center">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-[#25d366] hover:bg-[#20ba5a] transition px-6 py-3 rounded-lg font-semibold text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.707.732 5.34 2.122 7.651L2.883 22l8.268-2.635a9.844 9.844 0 004.736 1.204h.005c5.411 0 9.85-4.437 9.878-9.852.01-2.64-.757-5.123-2.191-7.263C20.261 4.566 17.062 2.9 13.651 2.9c-5.393 0-9.783 4.37-9.796 9.763" />
              </svg>
              <span>Contáctanos por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#3a3935] mt-8 pt-6 text-center text-sm text-[#7a7a7a]">
          <p>&copy; 2026 TodoSombra. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
