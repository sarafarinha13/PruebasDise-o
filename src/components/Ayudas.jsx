import { useState } from 'react'
import { AYUDAS } from '../data/ayudas.js'
import { Verdict, Example } from './Badge.jsx'

const ICON = { ok: '✓', duda: '?', no: '✕' }
const MOTIVOS = ['No encaja con reforestar', 'No podemos pedirla (requisitos)', 'Plazo o importe no compensa', 'Otro motivo']
const DOCS = [['Estatutos', true], ['CIF', true], ['Certificado al corriente', false], ['Presupuesto del proyecto', false]]
const dias = f => Math.max(0, Math.ceil((new Date(f) - new Date()) / 864e5))

export default function Ayudas() {
  const [items, setItems] = useState(AYUDAS.map(a => ({ ...a, revisada: false })))
  const [vista, setVista] = useState('inicio') // inicio | revision | docs | hecho | lista
  const [total, setTotal] = useState(0)
  const [motivando, setMotivando] = useState(false)
  const [tab, setTab] = useState('presenta')
  const [selId, setSelId] = useState(null)
  const [docs, setDocs] = useState(DOCS)

  const cola = items.filter(a => !a.revisada)
  const actual = cola[0]
  const paraPresentar = items.filter(a => a.estado === 'presenta').length
  const proxima = [...items].filter(a => a.estado !== 'descarta').sort((a, b) => a.plazo.localeCompare(b.plazo))[0]

  const resolver = (id, estado) =>
    setItems(items.map(a => (a.id === id ? { ...a, estado, revisada: true } : a)))
  const empezar = () => { setTotal(cola.length); setVista(cola.length ? 'revision' : 'hecho') }
  const siguiente = (restantes = cola.length - 1) => setVista(restantes > 0 ? 'revision' : 'hecho')

  const decidir = estado => {
    resolver(actual.id, estado)
    if (estado === 'seguimiento') { setDocs(DOCS); setVista('docs') }
    else { setMotivando(false); siguiente() }
  }

  if (vista === 'inicio') return (
    <section className="center">
      <span className="pill">Radar de Reforesta</span>
      <h1>Más financiación para reforestar más monte</h1>
      <p>El radar lee las convocatorias por ti y te dice cuáles merece la pena presentar.</p>
      <div className="grid3">
        <div className="card"><small>PARA PRESENTAR</small><big>{paraPresentar}</big><small>Encajan con reforestar</small></div>
        <div className="card"><small>SOLICITUDES 2026</small><big>{items.filter(a => a.estado === 'seguimiento').length} <span>de 10</span></big><small>Objetivo del año <Example /></small></div>
        <div className="card"><small>PLAZO MÁS PRÓXIMO</small><big>{proxima ? dias(proxima.plazo) + ' d' : '—'}</big><small>{proxima?.titulo}</small></div>
      </div>
      <div className="actions center-row">
        <button className="primary" onClick={empezar}>Empezar revisión</button>
        <button onClick={() => setVista('lista')}>Ver lista completa</button>
      </div>
    </section>
  )

  if (vista === 'revision' && actual) return (
    <section>
      <div className="progress"><span>{total - cola.length + 1} de {total}</span><i style={{ width: `${((total - cola.length + 1) / total) * 100}%` }} /></div>
      <div className="card big-card">
        <div className="badges"><Verdict kind={actual.veredicto} /><span className="badge gray">Quedan {dias(actual.plazo)} días</span></div>
        <h1>{actual.titulo}</h1>
        <small>{actual.organismo} · BDNS</small>
        <p className="callout">{actual.motivo}</p>
        <div className="nums">
          <div><big>{actual.importe}</big><small>máximo</small></div>
          <div><big>{actual.cubierto}</big><small>cubierto</small></div>
          <div><big>{dias(actual.plazo)} d</big><small>plazo</small></div>
        </div>
        <div className="chips">{actual.requisitos.map(([t, s]) => <span key={t} className="chip"><b className={s}>{ICON[s]}</b> {t}</span>)}</div>
        <blockquote>«{actual.cita}»</blockquote>
      </div>
      {motivando ? (
        <div className="card motivos">
          <h2>¿Por qué la descartas?</h2>
          {MOTIVOS.map((m, i) => <button key={m} onClick={() => decidir('descarta')}>{m}<small>{i + 1}</small></button>)}
          <small>Pasa sola a la siguiente · <a href="#" onClick={e => { e.preventDefault(); setMotivando(false) }}>Deshacer</a></small>
        </div>
      ) : (
        <div className="actions bar">
          <button onClick={() => setMotivando(true)}>Descartar</button>
          <button onClick={() => decidir('mira')}>Mirar luego</button>
          <button className="primary" onClick={() => decidir('seguimiento')}>Presentar</button>
        </div>
      )}
    </section>
  )

  if (vista === 'docs') {
    const hechos = docs.filter(d => d[1]).length
    return (
      <section className="center">
        <span className="pill">Solicitud en preparación</span>
        <h1>Reunir documentos</h1>
        <div className="grid2">
          <div className="card left"><small>CHECKLIST</small>
            {docs.map(([n, ok], i) => (
              <label key={n}><input type="checkbox" checked={ok} onChange={() => setDocs(docs.map((d, j) => (j === i ? [d[0], !d[1]] : d)))} /> {n}</label>
            ))}
          </div>
          <div className="card left"><small>PROGRESO</small><big>{hechos} <span>de {docs.length}</span></big>
            <div className="progress"><i style={{ width: `${(hechos / docs.length) * 100}%` }} /></div></div>
        </div>
        <div className="actions center-row">
          <button onClick={() => siguiente()}>Siguiente convocatoria</button>
          <button className="primary" onClick={() => { setTab('seguimiento'); setVista('lista') }}>Ir al seguimiento</button>
        </div>
      </section>
    )
  }

  if (vista === 'hecho' || vista === 'revision') {
    const n = k => items.filter(a => a.estado === k).length
    return (
      <section className="center">
        <div className="emoji">🌱</div>
        <h1>Hecho por hoy</h1>
        <p>Próxima revisión mañana a las 07:00. Te avisamos si aparece algo con plazo próximo.</p>
        <div className="grid3">
          <div className="card"><small>PRESENTADAS</small><big>{n('seguimiento')}</big></div>
          <div className="card"><small>PARA LUEGO</small><big>{n('mira')}</big></div>
          <div className="card"><small>DESCARTADAS</small><big>{n('descarta')}</big></div>
        </div>
        <div className="actions center-row">
          <button className="primary" onClick={() => { setTab('seguimiento'); setVista('lista') }}>Ir al seguimiento</button>
          <button onClick={() => { setTab('descarta'); setVista('lista') }}>Ver descartadas</button>
        </div>
      </section>
    )
  }

  // Lista
  const TABS = [['presenta', 'Presenta'], ['mira', 'Mira'], ['descarta', 'Descartadas'], ['seguimiento', 'Seguimiento']]
  const lista = items.filter(a => a.estado === tab).sort((a, b) => a.plazo.localeCompare(b.plazo))
  const sel = items.find(a => a.id === selId)
  return (
    <div>
      <div className="stats"><h1>Ayudas</h1><button onClick={() => setVista('inicio')}>Inicio</button><button className="primary" onClick={empezar}>Empezar revisión</button></div>
      <div className="tabs">{TABS.map(([k, l]) => <button key={k} className={k === tab ? 'active' : ''} onClick={() => { setTab(k); setSelId(null) }}>{l} · {items.filter(a => a.estado === k).length}</button>)}</div>
      <div className="split">
        <ul className="list">
          {lista.length === 0 && <li className="empty">Nada en esta pestaña.</li>}
          {lista.map(a => (
            <li key={a.id} className={a.id === selId ? 'sel' : ''} onClick={() => setSelId(a.id)}>
              <Verdict kind={a.veredicto} /><strong>{a.titulo}</strong>
              <small>{a.organismo} · quedan {dias(a.plazo)} días · {a.importe}</small>
            </li>
          ))}
        </ul>
        {sel && (
          <aside className="card">
            <Verdict kind={sel.veredicto} /><p>{sel.motivo}</p><blockquote>«{sel.cita}»</blockquote>
            <ul className="reqs">{sel.requisitos.map(([t, s]) => <li key={t}><b className={s}>{ICON[s]}</b> {t}</li>)}</ul>
          </aside>
        )}
      </div>
    </div>
  )
}
