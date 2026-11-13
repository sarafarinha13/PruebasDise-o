import { useState } from 'react'
import { AYUDAS } from '../data/ayudas.js'
import { Verdict, Example } from './Badge.jsx'

const TABS = [['presenta', 'Presenta'], ['mira', 'Mira'], ['descarta', 'Descartadas']]
const ICON = { ok: '✓', duda: '?', no: '✕' }
const dias = f => Math.max(0, Math.ceil((new Date(f) - new Date()) / 864e5))

export default function Ayudas() {
  const [items, setItems] = useState(AYUDAS)
  const [tab, setTab] = useState('presenta')
  const [selId, setSelId] = useState(null)

  const lista = items.filter(a => a.estado === tab).sort((a, b) => a.plazo.localeCompare(b.plazo))
  const sel = items.find(a => a.id === selId)
  const mover = estado => {
    setItems(items.map(a => (a.id === selId ? { ...a, estado } : a)))
    setSelId(null)
  }
  const paraPresentar = items.filter(a => a.estado === 'presenta').length

  return (
    <div>
      <div className="stats">
        <strong>Para presentar: {paraPresentar}</strong>
        <span>Solicitudes 2026: 0 de 10 <Example /></span>
      </div>
      <div className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={k === tab ? 'active' : ''} onClick={() => { setTab(k); setSelId(null) }}>{l}</button>
        ))}
      </div>
      <div className="split">
        <ul className="list">
          {lista.length === 0 && <li className="empty">Nada en esta pestaña.</li>}
          {lista.map(a => (
            <li key={a.id} className={a.id === selId ? 'sel' : ''} onClick={() => setSelId(a.id)}>
              <Verdict kind={a.veredicto} />
              <strong>{a.titulo}</strong>
              <small>{a.organismo} · quedan {dias(a.plazo)} días · {a.importe}</small>
            </li>
          ))}
        </ul>
        {sel && (
          <aside className="card">
            <Verdict kind={sel.veredicto} />
            <p>{sel.motivo}</p>
            <blockquote>«{sel.cita}»</blockquote>
            <dl>
              <dt>Importe</dt><dd>{sel.importe} ({sel.cubierto})</dd>
              <dt>Plazo</dt><dd>{sel.plazo} · quedan {dias(sel.plazo)} días</dd>
              <dt>Resolución</dt><dd>{sel.resolucion}</dd>
              <dt>Pago</dt><dd>{sel.pago}</dd>
              <dt>Cofinanciación</dt><dd>{sel.cofinanciacion}</dd>
            </dl>
            <ul className="reqs">
              {sel.requisitos.map(([t, s]) => <li key={t}><b className={s}>{ICON[s]}</b> {t}</li>)}
            </ul>
            <p><small>Se repite: {sel.repite}</small></p>
            <div className="actions">
              <button className="primary" onClick={() => mover('seguimiento')}>Presentar</button>
              <button onClick={() => mover('mira')}>Mirar luego</button>
              <button onClick={() => mover('descarta')}>Descartar</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
