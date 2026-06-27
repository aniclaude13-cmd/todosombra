import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="bg-[#faf9f6] text-[#1a1917] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <Link
            href="/"
            className="text-sm text-[#7a756f] hover:text-[#1a1917] transition inline-flex items-center gap-1 mb-8"
          >
            ← Volver al inicio
          </Link>
          <article className="legal-article">
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
