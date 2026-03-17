import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/layout/NavBar'

const FAQ = [
  {
    category: 'Compradores',
    items: [
      {
        q: '¿Cómo contacto a un vendedor?',
        a: 'Entra al booth del vendedor, elige el servicio que te interesa y presiona "Contactar". Se abrirá un chat directo con el vendedor.',
      },
      {
        q: '¿Cómo funciona el proceso de pago?',
        a: 'Cada vendedor define su método de pago preferido. Puedes acordar los detalles directamente en el chat. En futuras versiones de EliteMarket integraremos pagos en la plataforma.',
      },
      {
        q: '¿Cómo sé si un vendedor es confiable?',
        a: 'Los vendedores con el badge azul "Verificado" han pasado nuestro proceso de verificación de identidad y portafolio. También puedes revisar su rating y número de reseñas.',
      },
      {
        q: '¿Qué hago si hay un problema con un servicio?',
        a: 'Escríbenos desde esta sección de Ayuda. Nuestro equipo revisará el caso y te responderá en máximo 24 horas.',
      },
    ],
  },
  {
    category: 'Vendedores',
    items: [
      {
        q: '¿Cómo creo mi booth?',
        a: 'Regístrate como vendedor, completa el proceso de onboarding (4 pasos) y tu booth quedará visible en EliteMarket. Puedes personalizarlo desde tu panel.',
      },
      {
        q: '¿Cómo me verifico?',
        a: 'El proceso de verificación está disponible desde tu panel vendedor. Necesitarás subir un documento de identidad y mostrar muestras de tu trabajo. La revisión toma 1-2 días hábiles.',
      },
      {
        q: '¿Cuánto cobra EliteMarket?',
        a: 'EliteMarket es gratuito durante el período de lanzamiento. En el futuro aplicaremos una comisión por transacción completada, que comunicaremos con anticipación.',
      },
      {
        q: '¿Puedo ofrecer servicios en cualquier categoría?',
        a: 'Por ahora las categorías son UX/UI, Marketing y Audiovisual. Si tienes una especialidad diferente, escríbenos y la evaluaremos para una próxima actualización.',
      },
    ],
  },
  {
    category: 'Cuenta',
    items: [
      {
        q: '¿Puedo ser comprador y vendedor a la vez?',
        a: 'Sí. Desde tu perfil puedes acceder tanto al panel vendedor como al historial de pedidos como comprador.',
      },
      {
        q: '¿Cómo elimino mi cuenta?',
        a: 'Ve a Configuración → Cuenta → Eliminar cuenta. Este proceso es irreversible y eliminará todos tus datos de la plataforma.',
      },
    ],
  },
]

/**
 * Help — FAQ y soporte
 * Ruta: /help
 */
export default function Help() {
  const navigate = useNavigate()
  const [openItem, setOpenItem] = useState(null)

  function toggle(key) {
    setOpenItem(prev => prev === key ? null : key)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">

      {/* Header */}
      <header className="px-[var(--space-6)] pt-[var(--space-8)] pb-[var(--space-6)] border-b border-[var(--color-border-light)]">
        <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-1)]">
          <button onClick={() => navigate('/profile')} aria-label="Volver al perfil"
            className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-secondary)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Ayuda</h1>
        </div>
      </header>

      <main className="flex-1 pb-32">

        {/* Search hint */}
        <div className="px-[var(--space-6)] py-[var(--space-5)] border-b border-[var(--color-border-light)]">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Encuentra respuestas a las preguntas más frecuentes o escríbenos directamente.
          </p>
        </div>

        {/* FAQ sections */}
        {FAQ.map(section => (
          <section key={section.category} className="mb-[var(--space-2)]">
            <p className="px-[var(--space-6)] pt-[var(--space-6)] pb-[var(--space-3)] text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
              {section.category}
            </p>

            <dl>
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`
                const isOpen = openItem === key
                return (
                  <div key={key} className="border-b border-[var(--color-border-light)]">
                    <dt>
                      <button
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-5)] text-left hover:bg-[var(--color-bg-secondary)] transition-colors"
                      >
                        <span className="text-base font-medium text-[var(--color-text-primary)] flex-1">
                          {item.q}
                        </span>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          className={`flex-shrink-0 text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </dt>
                    {isOpen && (
                      <dd className="px-[var(--space-6)] pb-[var(--space-5)] text-sm text-[var(--color-text-secondary)] leading-relaxed animate-fade-in">
                        {item.a}
                      </dd>
                    )}
                  </div>
                )
              })}
            </dl>
          </section>
        ))}

        {/* Contact CTA */}
        <div className="mx-[var(--space-5)] mt-[var(--space-6)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] rounded-[var(--radius-2xl)] p-[var(--space-6)]">
          <p className="text-base font-bold text-[var(--color-text-primary)] mb-[var(--space-2)]">
            ¿No encontraste lo que buscabas?
          </p>
          <p className="text-sm text-[var(--color-text-tertiary)] mb-[var(--space-5)]">
            Escríbenos y te respondemos en menos de 24 horas.
          </p>
          <a
            href="mailto:soporte@elitemarket.co"
            className="inline-flex items-center gap-[var(--space-2)] bg-[var(--color-primary)] text-white text-2xs font-bold uppercase tracking-[0.15em] px-[var(--space-6)] py-[var(--space-4)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] active:scale-95 transition-transform"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Contactar soporte
          </a>
        </div>
      </main>

      <NavBar />
    </div>
  )
}
