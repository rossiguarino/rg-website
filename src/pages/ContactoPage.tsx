import { useState, type FormEvent } from 'react'
import { Mail, MessageCircle, Phone, Send, CheckCircle } from 'lucide-react'

const EMAIL = 'rossiguarino.prop@gmail.com'
const PHONES = [
  { number: '11-6752-1620', wa: '541167521620' },
  { number: '11-4091-6878', wa: '541140916878' },
]

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSending(true)

    // Build mailto link with form data
    const subject = encodeURIComponent(`Consulta de ${form.nombre}`)
    const body = encodeURIComponent(
      `Nombre: ${form.nombre}\nEmail: ${form.email}\nTeléfono: ${form.telefono}\n\n${form.mensaje}`
    )
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`

    // Show success after a short delay
    setTimeout(() => {
      setSending(false)
      setSent(true)
    }, 1000)
  }

  const inputClass =
    'w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-colors'

  return (
    <div className="min-h-[70vh]">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-brand-gray-light to-white py-16 md:py-24 px-6 overflow-hidden">
        <img
          src="./elementos/rg-element-01.png"
          alt=""
          className="absolute -right-28 top-0 w-72 md:w-[24rem] opacity-[0.04] pointer-events-none select-none"
        />
        <img
          src="./elementos/rg-element-14.png"
          alt=""
          className="absolute -left-16 -bottom-8 w-80 md:w-[22rem] opacity-[0.15] md:opacity-[0.7] pointer-events-none select-none"
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-brand-black mb-4">Contacto</h1>
          <div className="w-12 h-px bg-brand-teal mx-auto mb-4" />
          <p className="text-brand-gray max-w-lg mx-auto text-base md:text-lg">
            Completá el formulario o escribinos directamente. Te respondemos a la brevedad.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle size={48} className="text-brand-teal mb-4" />
                <h3 className="text-xl font-display font-semibold text-brand-black mb-2">
                  ¡Mensaje enviado!
                </h3>
                <p className="text-brand-gray mb-6">
                  Se abrió tu cliente de email con los datos del formulario. Si no se abrió, podés escribirnos directamente a{' '}
                  <a href={`mailto:${EMAIL}`} className="text-brand-teal hover:underline">{EMAIL}</a>
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ nombre: '', email: '', telefono: '', mensaje: '' }) }}
                  className="text-sm text-brand-teal hover:text-brand-teal-dark underline"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nombre" className="block text-[11px] uppercase tracking-brand-wide text-brand-gray mb-1.5 font-display">
                      Nombre *
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      required
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[11px] uppercase tracking-brand-wide text-brand-gray mb-1.5 font-display">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-[11px] uppercase tracking-brand-wide text-brand-gray mb-1.5 font-display">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="11-1234-5678"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-[11px] uppercase tracking-brand-wide text-brand-gray mb-1.5 font-display">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    required
                    rows={5}
                    value={form.mensaje}
                    onChange={handleChange}
                    placeholder="Contanos en qué podemos ayudarte..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 bg-brand-teal text-white px-8 py-3 rounded-lg text-sm uppercase tracking-brand-wide font-display hover:bg-brand-teal-dark transition-colors disabled:opacity-60"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Enviar consulta
                </button>
              </form>
            )}
          </div>

          {/* Contact info sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-display font-semibold text-brand-black">
                Datos de contacto
              </h3>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal/10 flex-shrink-0">
                  <Mail size={18} className="text-brand-teal" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-brand-wide text-brand-gray font-display mb-1">Email</p>
                  <a href={`mailto:${EMAIL}`} className="text-sm text-brand-black hover:text-brand-teal transition-colors">
                    {EMAIL}
                  </a>
                </div>
              </div>

              {/* Phones */}
              {PHONES.map((phone) => (
                <div key={phone.wa} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal/10 flex-shrink-0">
                    <Phone size={18} className="text-brand-teal" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-brand-wide text-brand-gray font-display mb-1">Teléfono</p>
                    <p className="text-sm text-brand-black">{phone.number}</p>
                  </div>
                </div>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-[11px] uppercase tracking-brand-wide text-brand-gray font-display mb-4">
                  Escribinos por WhatsApp
                </p>
                <div className="flex flex-col gap-3">
                  {PHONES.map((phone) => (
                    <a
                      key={phone.wa}
                      href={`https://wa.me/${phone.wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-lg text-sm font-display hover:bg-[#1da851] transition-colors"
                    >
                      <MessageCircle size={16} />
                      {phone.number}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
