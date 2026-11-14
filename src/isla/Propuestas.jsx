import { useEffect, useState } from 'react'
import { cargar, guardar } from '../data/store.js'
import Icon from './Icon.jsx'
import { island } from './lp.js'

const VACIA = { titulo: '', zona: '', incluye: '', plazas: 3 }
const Svg = ({ html, ...p }) => <span {...p} dangerouslySetInnerHTML={{ __html: html }} />
const ESTADO = { recibida: ['Nueva', 'var(--co-l)', '#B2432A'], contestada: ['Contestada', 'var(--am-l)', '#8A5300'], confirmada: ['Confirmada', 'var(--gr-l)', 'var(--gr-d)'] }

export default function Propuestas({ top, setToast }) {
  const [d, setD] = useState(cargar)
  const [form, setForm] = useState(null)
  useEffect(() => { const r = () => setD(cargar()); addEventListener('focus', r); addEventListener('storage', r); return () => { removeEventListener('focus', r); removeEventListener('storage', r) } }, [])
  const set = n => { setD(n); guardar(n) }
  const updP = (id, c) => set({ ...d, propuestas: d.propuestas.map(p => (p.id === id ? { ...p, ...c } : p)) })
  const updR = (id, c) => set({ ...d, reservas: d.reservas.map(r => (r.id === id ? { ...r, ...c } : r)) })
  const guardarForm = e => {
    e.preventDefault()
    const p = { ...form, plazas: Number(form.plazas) || 0 }
    if (p.id) updP(p.id, p)
    else set({ ...d, propuestas: [...d.propuestas, { ...p, id: Date.now(), estado: 'borrador' }] })
    setToast({ texto: p.id ? 'Propuesta guardada' : 'Propuesta creada como borrador' }); setForm(null)
  }
  const pendientes = d.reservas.filter(r => r.estado === 'recibida').length
  const campo = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })
  return (
    <>
      {top('Propuestas')}
      <div className="i-head">
        <div><h2>Lo que ofrecéis a las empresas</h2><p className="i-sub" style={{ margin: '2px 0 0' }}>Publicad propuestas; las empresas las ven en vuestra página y reservan sin compromiso.</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="i-btn sm" href="#/propuestas" target="_blank" rel="noreferrer"><Icon n="ext" s={17} />Ver página pública</a>
          <button className="i-btn p sm" onClick={() => setForm(VACIA)}><Icon n="plus" s={17} w={2.4} />Nueva propuesta</button>
        </div>
      </div>
      {form && (
        <form className="i-card i-form" onSubmit={guardarForm}>
          <b>{form.id ? 'Editar propuesta' : 'Nueva propuesta'}</b>
          <input className="i-in" required placeholder="Título · ej. Plantación de 1 ha" {...campo('titulo')} />
          <input className="i-in" required placeholder="Dónde · ej. Sierra de Guadarrama" {...campo('zona')} />
          <input className="i-in" placeholder="Qué incluye" {...campo('incluye')} />
          <input className="i-in" type="number" min="0" placeholder="Plazas" {...campo('plazas')} />
          <div style={{ display: 'flex', gap: 8 }}><button className="i-btn p sm" type="submit">Guardar</button><button className="i-btn sm" type="button" onClick={() => setForm(null)}>Cancelar</button></div>
        </form>
      )}
      <div className="i-grid3" style={{ margin: '16px 0 14px' }}>
        {d.propuestas.map((p, i) => {
          const est = p.estado === 'borrador' ? ['Borrador', 'var(--am-l)', '#8A5300'] : p.plazas > 0 ? ['Publicada', 'var(--gr-l)', 'var(--gr-d)'] : ['Completa', '#F1F3EE', '#4D5662']
          const n = Math.max(3, Math.min(8, (p.plazas || 0) + 3))
          return (
            <div key={p.id} className="i-card" style={{ padding: '12px 14px 16px', display: 'flex', flexDirection: 'column' }}>
              <div className="i-art"><Svg html={island(220, 150, n, n, 20 + i)} /></div>
              <div className="i-head" style={{ margin: '10px 0 4px', alignItems: 'center' }}><span className="i-tag" style={{ background: est[1], color: est[2] }}>{est[0]}</span><span className="i-tag">{p.plazas > 0 ? `${p.plazas} plazas libres` : 'Sin plazas'}</span></div>
              <b style={{ fontSize: 18 }}>{p.titulo}</b>
              <div style={{ color: 'var(--mut)', fontSize: 14 }}>{p.zona} · {p.incluye}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 12 }}>
                <button className="i-btn sm" style={{ flex: 1, height: 42 }} onClick={() => setForm(p)}>Editar</button>
                <button className={`i-btn sm ${p.estado === 'borrador' ? 'p' : ''}`} style={{ flex: 1, height: 42 }} onClick={() => { updP(p.id, { estado: p.estado === 'borrador' ? 'publicada' : 'borrador' }); setToast({ texto: p.estado === 'borrador' ? 'Publicada en vuestra página' : 'Oculta de la página pública' }) }}>{p.estado === 'borrador' ? 'Publicar' : 'Ocultar'}</button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="i-card" style={{ padding: '14px 20px' }}>
        <div className="i-head" style={{ alignItems: 'center' }}><b style={{ fontSize: 18 }}>Reservas recibidas · {d.reservas.length}</b>{pendientes > 0 && <span className="i-tag" style={{ background: 'var(--co-l)', color: '#B2432A' }}>{pendientes} por contestar</span>}</div>
        {d.reservas.length === 0 && <p style={{ color: 'var(--mut)', padding: '10px 0' }}>Aún no hay reservas. Compartid vuestra página pública con empresas.</p>}
        {d.reservas.map(r => {
          const p = d.propuestas.find(x => x.id === r.propuestaId)
          const e = ESTADO[r.estado] || ESTADO.recibida
          return (
            <div key={r.id} className="i-rs">
              <div><b>{r.empresa}</b><small>{r.contacto} · {r.email}</small>{r.mensaje && <small>«{r.mensaje}»</small>}</div>
              <div>{p ? p.titulo : '—'}</div>
              <div><span className="i-tag" style={{ background: e[1], color: e[2] }}>{e[0]}</span></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a className="i-btn sm" style={{ height: 40 }} href={`mailto:${r.email}?subject=${encodeURIComponent('Reforesta · ' + (p ? p.titulo : 'vuestra reserva'))}`}><Icon n="send" s={15} />Escribir</a>
                {r.estado === 'recibida' && <button className="i-btn n sm" style={{ height: 40 }} onClick={() => updR(r.id, { estado: 'contestada' })}>Marcar contestada</button>}
                {r.estado === 'contestada' && <button className="i-btn n sm" style={{ height: 40 }} onClick={() => updR(r.id, { estado: 'confirmada' })}>Confirmar</button>}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
