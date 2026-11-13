import { useState } from 'react'
import { cargar, guardar } from '../data/store.js'

const VACIO = { empresa: '', contacto: '', email: '', mensaje: '', ok: false }

export default function PaginaPublica() {
  const [d, setD] = useState(cargar)
  const [sel, setSel] = useState(null)
  const [f, setF] = useState(VACIO)
  const [estado, setEstado] = useState('form') // form | enviada | duplicada | error
  const publicas = d.propuestas.filter(p => p.estado !== 'borrador')

  const enviar = e => {
    e.preventDefault()
    if (d.reservas.some(r => r.propuestaId === sel.id && r.email === f.email)) return setEstado('duplicada')
    try {
      const nuevo = { ...d, reservas: [...d.reservas, { id: Date.now(), propuestaId: sel.id, empresa: f.empresa, contacto: f.contacto, email: f.email, mensaje: f.mensaje, estado: 'recibida' }] }
      guardar(nuevo); setD(nuevo); setEstado('enviada')
    } catch { setEstado('error') }
  }
  const volver = () => { setSel(null); setF(VACIO); setEstado('form') }
  const campo = k => ({ value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }) })

  return (
    <div className="app">
      <header><strong className="logo">🌱 Reforesta</strong><span className="note" style={{ flex: 1 }}>Proyectos de reforestación · Comunidad de Madrid</span></header>
      <main>
        {!sel && (
          <section className="center">
            <span className="pill">Para empresas</span>
            <h1>Planta con nosotros</h1>
            <p>Elige un proyecto y reserva sin compromiso. Te responderemos en unos días.</p>
            {publicas.length === 0 && <p>Pronto habrá proyectos.</p>}
            <div className="grid3">
              {publicas.map(p => (
                <div key={p.id} className="card left">
                  <strong>{p.titulo}</strong><small>{p.zona} · {p.incluye}</small>
                  <div className="badges"><span className="badge gray">{p.plazas > 0 ? `${p.plazas} plazas libres` : 'Sin plazas'}</span><span className="badge example">A presupuestar</span></div>
                  {p.plazas > 0 ? <button className="primary" onClick={() => setSel(p)}>Reservar sin compromiso</button> : <button onClick={() => alert('Te avisaremos cuando haya plazas.')}>Avisarme</button>}
                </div>
              ))}
            </div>
          </section>
        )}
        {sel && estado === 'form' && (
          <form className="card col" onSubmit={enviar}>
            <small>RESERVAR · {sel.titulo.toUpperCase()}</small>
            <input required placeholder="Empresa" {...campo('empresa')} />
            <input required placeholder="Persona de contacto" {...campo('contacto')} />
            <input required type="email" placeholder="Email" {...campo('email')} />
            <textarea placeholder="Mensaje (opcional)" {...campo('mensaje')} />
            <label><input required type="checkbox" checked={f.ok} onChange={e => setF({ ...f, ok: e.target.checked })} /> Acepto el tratamiento de mis datos</label>
            <button className="primary" type="submit">Reservar sin compromiso</button>
            <small>No supone compromiso de pago.</small>
            <button type="button" onClick={volver}>‹ Volver a los proyectos</button>
          </form>
        )}
        {sel && estado === 'enviada' && <section className="center card"><div className="emoji">✅</div><h2>Reserva recibida</h2><p>Reforesta te responderá en unos días. No supone compromiso de pago.</p><button className="primary" onClick={volver}>Ver otros proyectos</button></section>}
        {sel && estado === 'duplicada' && <section className="center card"><h2>Ya has reservado esta propuesta</h2><button onClick={volver}>Ver otros proyectos</button></section>}
        {sel && estado === 'error' && <section className="center card"><h2>No se pudo enviar</h2><p>Tus datos siguen en el formulario.</p><button className="primary" onClick={() => setEstado('form')}>Volver a intentarlo</button></section>}
      </main>
    </div>
  )
}
