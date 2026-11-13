import { useState } from 'react'
import { EMPRESAS } from '../data/empresas.js'
import { Verdict, Example } from './Badge.jsx'

const FILTROS = [['todas', 'Todas'], ['encaja', 'Encaja'], ['sin', 'Sin contactar'], ['rsc', 'RSC voluntaria']]
const ESTADOS = ['sin contactar', 'contactada', 'en conversación']

export default function Empresas() {
  const [items, setItems] = useState(EMPRESAS)
  const [filtro, setFiltro] = useState('todas')
  const [modo, setModo] = useState('lista') // lista | uno
  const [idx, setIdx] = useState(0)

  const pasa = e => filtro === 'todas' || (filtro === 'encaja' && e.veredicto === 'encaja') ||
    (filtro === 'sin' && e.contacto === 'sin contactar') || (filtro === 'rsc' && e.rsc)
  const vista = items.filter(pasa)
  const cuenta = k => items.filter(e => (k === 'todas' ? true : k === 'encaja' ? e.veredicto === 'encaja' : k === 'sin' ? e.contacto === 'sin contactar' : e.rsc)).length
  const upd = (id, c) => setItems(items.map(e => (e.id === id ? { ...e, ...c } : e)))
  const copiar = () => navigator.clipboard?.writeText(location.origin + location.pathname + '#/propuestas').catch(() => {})

  if (modo === 'uno') {
    const e = vista[idx]
    if (!e) return <section className="center"><h1>Hecho por hoy</h1><button onClick={() => setModo('lista')}>Volver a la lista</button></section>
    const sig = () => setIdx(idx + 1)
    return (
      <section>
        <div className="progress"><span>{idx + 1} de {vista.length}</span><i style={{ width: `${((idx + 1) / vista.length) * 100}%` }} /></div>
        <div className="card big-card">
          <div className="badges"><Verdict kind={e.veredicto} /><span className="badge gray">{e.provincia}</span><Example /></div>
          <h1>{e.promotor} · {e.proyecto}</h1>
          <small>Obligado a reforestar por su declaración de impacto ambiental · BOE (fecha)</small>
          <p className="callout">{e.medida}</p>
          <div className="nums"><div><big>{e.ha}</big><small>según el texto</small></div><div><big>{e.plazo}</big><small>plazo legal</small></div><div><big>{e.importe}</big><small>importe</small></div></div>
          <blockquote>{e.cita} · ver BOE ↗</blockquote>
        </div>
        <div className="actions bar">
          <button onClick={() => { upd(e.id, { veredicto: 'noencaja' }); sig() }}>No encaja</button>
          <button onClick={sig}>Mirar luego</button>
          <button className="primary" onClick={() => { upd(e.id, { contacto: 'contactada' }); sig() }}>Contactar</button>
        </div>
      </section>
    )
  }

  return (
    <div>
      <div className="stats"><div><h1>Obligadas a reforestar</h1><small>Resoluciones del BOE favorables con medidas de reforestación</small></div>
        <button className="primary" onClick={() => { setIdx(0); setModo('uno') }}>Empezar revisión</button></div>
      <div className="tabs">{FILTROS.map(([k, l]) => <button key={k} className={k === filtro ? 'active' : ''} onClick={() => setFiltro(k)}>{l} · {cuenta(k)}</button>)}</div>
      <ul className="list">
        {vista.length === 0 && <li className="empty">Sin resultados. Quita el último filtro.</li>}
        {vista.map(e => (
          <li key={e.id} className="row">
            <Verdict kind={e.veredicto} />
            <div><strong>{e.promotor} · {e.proyecto}</strong><small>{e.provincia} · {e.ha} · plazo legal {e.plazo}</small></div>
            <select value={e.contacto} onChange={ev => upd(e.id, { contacto: ev.target.value })}>{ESTADOS.map(s => <option key={s}>{s}</option>)}</select>
            <button onClick={copiar}>Enviar propuesta (enlace)</button>
          </li>
        ))}
      </ul>
      <p className="note">Contacto solo por el canal público del promotor. Importe «no indicado» si el texto no lo dice.</p>
    </div>
  )
}
