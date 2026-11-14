import { useState } from 'react'
import { cargar, guardar } from '../data/store.js'
import Icon from './Icon.jsx'
import { island, tree } from './lp.js'
import { ACTUACIONES } from '../data/actuaciones.js'
import './isla.css'

const VACIO = { empresa: '', contacto: '', email: '', mensaje: '', ok: false }
const Svg = ({ html, ...p }) => <span {...p} dangerouslySetInnerHTML={{ __html: html }} />

export default function Publica() {
  const [d, setD] = useState(cargar)
  const [sel, setSel] = useState(null)
  const [f, setF] = useState(VACIO)
  const [estado, setEstado] = useState('form')
  const publicas = d.propuestas.filter(p => p.estado !== 'borrador')
  const ha = ACTUACIONES.reduce((s, a) => s + a.ha, 0)
  const enviar = e => {
    e.preventDefault()
    if (d.reservas.some(r => r.propuestaId === sel.id && r.email === f.email)) return setEstado('duplicada')
    try {
      const n = { ...d, reservas: [...d.reservas, { id: Date.now(), propuestaId: sel.id, empresa: f.empresa, contacto: f.contacto, email: f.email, mensaje: f.mensaje, estado: 'recibida' }] }
      guardar(n); setD(n); setEstado('enviada')
    } catch { setEstado('error') }
  }
  const volver = () => { setSel(null); setF(VACIO); setEstado('form') }
  const campo = k => ({ value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }) })
  return (
    <div className="isla i-pub">
      <div className="phead"><span className="brand"><Svg className="mk" html={tree(34, 34, 28, '#79C08A')} />Reforesta</span><span style={{ color: 'var(--mut)', fontWeight: 600 }}>Proyectos de reforestación · Madrid</span><a className="i-btn n sm" href="mailto:hola@reforesta.es">Hablar con nosotros</a></div>
      {!sel && (<>
        <section className="hero">
          <div><span className="i-tag" style={{ background: '#F7E3D4', color: '#9A5B2E' }}>Para empresas</span>
            <h1>Planta un bosque <span>con Reforesta</span></h1>
            <p>Elegid un proyecto y reservad sin compromiso. Os contactamos en unos días con el presupuesto.</p>
            <div className="nums"><div><b>{publicas.length}</b>proyectos abiertos</div><div><b>{ha.toLocaleString('es-ES')} ha</b>plantadas</div><div><b>{ACTUACIONES.length}</b>sitios en Madrid</div></div>
            <span className="i-ej" style={{ marginTop: 14, display: 'inline-block' }}>Datos de ejemplo</span></div>
          <Svg html={island(480, 320, 7, 7, 31)} />
        </section>
        <section className="i-grid3 cards">
          {publicas.length === 0 && <p>Pronto habrá proyectos.</p>}
          {publicas.map(p => (
            <div key={p.id} className="i-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
              <span className="i-tag" style={{ alignSelf: 'flex-start' }}>{p.plazas > 0 ? `${p.plazas} plazas libres` : 'Sin plazas'}</span>
              <b style={{ fontSize: 20, margin: '8px 0 2px' }}>{p.titulo}</b>
              <div style={{ color: 'var(--mut)', fontSize: 14.5, minHeight: 40 }}>{p.zona} · {p.incluye}</div>
              {p.plazas > 0
                ? <button className="i-btn p sm" style={{ marginTop: 12 }} onClick={() => setSel(p)}>Reservar sin compromiso</button>
                : <button className="i-btn sm" style={{ marginTop: 12 }} onClick={() => alert('Os avisaremos cuando haya plazas.')}>Avisadme si hay plazas</button>}
            </div>
          ))}
        </section>
      </>)}
      {sel && estado === 'form' && (
        <form className="i-card i-form box" onSubmit={enviar}>
          <button type="button" className="i-link" onClick={volver}><Icon n="back" s={15} w={2.4} />Volver a los proyectos</button>
          <h2>Reservar · {sel.titulo}</h2>
          <input className="i-in" required placeholder="Empresa" {...campo('empresa')} />
          <input className="i-in" required placeholder="Persona de contacto" {...campo('contacto')} />
          <input className="i-in" required type="email" placeholder="Email" {...campo('email')} />
          <textarea className="i-in" placeholder="Mensaje (opcional)" {...campo('mensaje')} />
          <label className="cb"><input required type="checkbox" checked={f.ok} onChange={e => setF({ ...f, ok: e.target.checked })} />Acepto el tratamiento de mis datos</label>
          <button className="i-btn p" type="submit">Reservar sin compromiso</button>
          <small style={{ color: 'var(--mut)' }}>No supone compromiso de pago.</small>
        </form>
      )}
      {sel && estado !== 'form' && (
        <section className="i-card box" style={{ textAlign: 'center' }}>
          <h2>{estado === 'enviada' ? 'Reserva recibida' : estado === 'duplicada' ? 'Ya habéis reservado esta propuesta' : 'No se pudo enviar'}</h2>
          <p className="i-sub">{estado === 'enviada' ? 'Reforesta os responderá en unos días. No supone compromiso de pago.' : estado === 'error' ? 'Vuestros datos siguen en el formulario.' : 'Os escribiremos pronto.'}</p>
          <button className="i-btn p" style={{ margin: '0 auto' }} onClick={estado === 'error' ? () => setEstado('form') : volver}>{estado === 'error' ? 'Volver a intentarlo' : 'Ver otros proyectos'}</button>
        </section>
      )}
    </div>
  )
}
