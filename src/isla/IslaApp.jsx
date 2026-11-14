import { Fragment, useEffect, useState } from 'react'
import { AYUDAS } from '../data/ayudas.js'
import { EMPRESAS } from '../data/empresas.js'
import Icon from './Icon.jsx'
import { island, plant, tree } from './lp.js'
import Propuestas from './Propuestas.jsx'
import Mapa from './Mapa.jsx'
import { cargar as cargarPropuestas } from '../data/store.js'
import './isla.css'

const KEY = 'radar-isla-v1'
const MOTIVOS = ['No es reforestación', 'Piden poner mucho dinero', 'Plazo muy corto', 'Fuera de nuestra zona', 'Importe pequeño', 'Sin capacidad ahora']
const REGLA = {
  'No es reforestación': ['Las que no son de plantar no os interesan', 'Ocultarlas'],
  'Piden poner mucho dinero': ['Descartáis las que piden poner más del 20 %', 'Marcarlas «Mirad antes»'],
  'Plazo muy corto': ['Con plazos muy cortos soléis dejarlas', 'Avisadme antes'],
  'Fuera de nuestra zona': ['Las de fuera de Madrid no os interesan', 'Ocultarlas'],
  'Importe pequeño': ['Los importes pequeños no os compensan', 'Marcarlas «Mirad antes»'],
  'Sin capacidad ahora': ['Ahora mismo no tenéis capacidad para más', 'Avisadme antes'],
}
const ESTADO_RUTA = { nueva: 'pend', mira: 'lt', descartada: 'no', preparando: 'ok', presentada: 'ok' }
const ETIQ_RUTA = { pend: 'Pendiente', lt: 'Más tarde', no: 'No interesa', ok: 'A presentar' }
const ETAPAS = ['revisar', 'preparando', 'presentadas', 'descartadas']
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const HOY = new Date()
const dias = f => Math.max(0, Math.ceil((new Date(f) - HOY) / 864e5))
const fecha = f => { const d = new Date(f); return `${d.getDate()} ${MESES[d.getMonth()].toLowerCase()}.` }
const Svg = ({ html, ...p }) => <span {...p} dangerouslySetInnerHTML={{ __html: html }} />

function cargar() {
  const base = {
    items: AYUDAS.map(a => ({ ...a })), empresas: EMPRESAS.map(e => ({ ...e })), objetivo: 10, avisos: true, espana: false,
    historial: ['Piden poner mucho dinero', 'Piden poner mucho dinero', 'Piden poner mucho dinero', 'Fuera de nuestra zona', 'Fuera de nuestra zona', 'Fuera de nuestra zona', 'Plazo muy corto'],
    reglas: { 'Fuera de nuestra zona': 'si' }, propias: [{ id: 1, texto: 'No nos interesan las que exigen aval bancario', autor: 'Marta', fecha: 'hace 2 días' }], motivosPropios: ['Exigen aval bancario'],
  }
  try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.items && s.historial ? { ...base, ...s } : base } catch { return base }
}

export default function IslaApp() {
  const [st, setSt] = useState(cargar)
  const [vista, setVista] = useState('conv')
  const [etapa, setEtapa] = useState('revisar')
  const [selId, setSelId] = useState(null)
  const [curId, setCurId] = useState(null)
  const [descartando, setDescartando] = useState(null)
  const [toast, setToast] = useState(null)
  const [q, setQ] = useState('')
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(st)) } catch { /* sin almacenamiento */ } }, [st])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 7000); return () => clearTimeout(t) }, [toast])

  const { items } = st
  const upd = (id, c) => setSt(s => ({ ...s, items: s.items.map(a => (a.id === id ? { ...a, ...c } : a)) }))
  const match = a => !q || a.titulo.toLowerCase().includes(q.toLowerCase())
  const presentadas = items.filter(a => a.estado === 'presentada').length
  const ir = (v, id = null) => {
    if (ETAPAS.includes(v)) { setVista('conv'); setEtapa(v) } else setVista(v)
    setSelId(id); document.querySelector('.isla')?.scrollTo?.(0, 0)
  }
  const reservasNuevas = (() => { try { return cargarPropuestas().reservas.filter(r => r.estado === 'recibida').length } catch { return 0 } })()
  const nav = [['conv', 'inbox', 'Convocatorias', items.filter(a => a.estado === 'nueva').length], ['empresas', 'building', 'Empresas', st.empresas.filter(e => e.contacto === 'sin contactar').length], ['propuestas', 'leaf', 'Propuestas', reservasNuevas], ['mapa', 'map', 'Mapa']]
  const top = k => (
    <div className="i-top">
      <div className="i-k">{k} · <span className="i-ej">Ejemplo</span></div>
      <div style={{ display: 'flex', gap: 10 }}>
        <label className="i-srch"><Icon n="search" s={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar…" /></label>
        <span className="i-round"><Icon n="bell" s={19} /></span>
      </div>
    </div>
  )
  const guardarDescarte = (a, motivos, extra) => {
    const prev = { estado: a.estado, por: a.por, motivos: a.motivos }
    setSt(s => {
      let propias = s.propias
      if (extra.nuevo && extra.recordar) propias = [...propias, { id: Date.now(), texto: `No nos interesan: ${extra.nuevo.toLowerCase()}`, autor: 'Vosotros', fecha: 'hoy' }]
      return {
        ...s, propias,
        motivosPropios: extra.nuevo && !s.motivosPropios.includes(extra.nuevo) ? [...s.motivosPropios, extra.nuevo] : s.motivosPropios,
        historial: [...s.historial, ...motivos],
        items: s.items.map(x => (x.id === a.id ? { ...x, estado: 'descartada', por: 'equipo', motivos, maxPct: extra.pct } : x)),
      }
    })
    setDescartando(null)
    siguiente(a)
    setToast({ texto: `${a.titulo.slice(0, 38)}…, descartada`, undo: () => { setSt(s => ({ ...s, historial: s.historial.slice(0, s.historial.length - motivos.length), items: s.items.map(x => (x.id === a.id ? { ...x, ...prev } : x)) })); setCurId(a.id) } })
  }
  const ruta = items.filter(a => a.hoy && match(a)).sort((a, b) => a.hoy - b.hoy)
  const siguiente = a => { const i = ruta.findIndex(x => x.id === a.id); const n = [...ruta.slice(i + 1), ...ruta.slice(0, i)].find(x => x.estado === 'nueva' && x.id !== a.id); setCurId(n ? n.id : -1) }
  const decidir = (a, estado) => {
    const prev = { estado: a.estado, por: a.por }
    upd(a.id, { estado, por: undefined })
    siguiente(a)
    const texto = estado === 'mira' ? 'Guardada para más tarde' : 'Movida a Preparando'
    setToast({ texto, undo: () => { upd(a.id, prev); setCurId(a.id) }, go: estado === 'preparando' ? ['Preparar papeles', () => ir('presentar', a.id)] : null })
  }

  let page
  if (vista === 'conv') page = <Convocatorias {...{ st, setSt, items: items.filter(match), etapa, ir, upd, top, ruta, curId, setCurId, decidir, setDescartando, setToast }} />
  else if (vista === 'presentar') page = <Presentar a={items.find(a => a.id === selId)} {...{ top, upd, ir, presentadas, setToast }} />
  else if (vista === 'empresas') page = <Empresas {...{ st, setSt, top, setToast, q }} />
  else if (vista === 'propuestas') page = <Propuestas {...{ top, setToast }} />
  else if (vista === 'mapa') page = <Mapa {...{ top }} />
  else page = <Perfil {...{ st, setSt, top, presentadas }} />

  return (
    <div className="isla">
      <aside className="i-rail">
        <Svg className="mk" html={tree(40, 40, 30)} />
        {nav.map(([k, i, t, c]) => (
          <button key={k} className={`it ${vista === k || (k === 'conv' && vista === 'presentar') ? 'on' : ''}`} onClick={() => ir(k === 'conv' ? 'revisar' : k)}>
            <Icon n={i} s={22} />{t}{c ? <span className="cnt">{c}</span> : null}
          </button>
        ))}
        <button className={`me ${vista === 'perfil' ? 'on' : ''}`} onClick={() => ir('perfil')} title="Perfil">MC</button>
      </aside>
      <div className="i-page">{page}</div>
      {descartando && <Descarte a={descartando} st={st} cerrar={() => setDescartando(null)} guardar={guardarDescarte} />}
      {toast && <div className="i-toast"><Icon n="check" s={18} w={2.6} />{toast.texto}{toast.go && <button className="go" onClick={() => { toast.go[1](); setToast(null) }}>{toast.go[0]} →</button>}{toast.undo && <button onClick={() => { toast.undo(); setToast(null) }}><Icon n="undo" s={16} w={2.4} />Deshacer</button>}</div>}
    </div>
  )
}

function Convocatorias({ st, setSt, items, etapa, ir, upd, top, ruta, curId, setCurId, decidir, setDescartando, setToast }) {
  const n = { revisar: items.filter(a => a.estado === 'nueva' || a.estado === 'mira').length, preparando: items.filter(a => a.estado === 'preparando').length, presentadas: items.filter(a => a.estado === 'presentada').length, descartadas: items.filter(a => a.estado === 'descartada').length }
  const etapas = [['revisar', 'Por revisar', 'El radar las encontró', 0], ['preparando', 'Preparando', 'Reunís los papeles', 1], ['presentadas', 'Presentadas', 'Esperando respuesta', 2]]
  return (
    <>
      {top('Convocatorias')}
      <div className="i-pipe">
        {etapas.map(([k, t, s, p], i) => (
          <Fragment key={k}>
            <button className={`stg ${etapa === k ? 'on' : ''}`} onClick={() => ir(k)}><Svg className="pl" html={plant(p)} /><b>{n[k]}</b><span>{t}<small>{s}</small></span></button>
            {i < 2 && <span className="arr"><Icon n="keyR" s={18} w={2.4} /></span>}
          </Fragment>
        ))}
        <span />
        <button className={`stg dis ${etapa === 'descartadas' ? 'on' : ''}`} onClick={() => ir('descartadas')}><Icon n="eye" s={22} /><b>{n.descartadas}</b><span>Descartadas<small>con su motivo</small></span></button>
      </div>
      {etapa === 'revisar' && <Revisar {...{ st, setSt, ruta, curId, setCurId, decidir, setDescartando, upd, ir }} />}
      {etapa === 'preparando' && <Preparando items={items.filter(a => a.estado === 'preparando')} {...{ ir, upd, setToast }} />}
      {etapa === 'presentadas' && <Seguimiento items={items.filter(a => a.estado === 'presentada')} {...{ upd }} />}
      {etapa === 'descartadas' && <Descartadas items={items} {...{ upd, setToast }} />}
    </>
  )
}

function Revisar({ st, setSt, ruta, curId, setCurId, decidir, setDescartando, upd, ir }) {
  const a = curId === -1 ? null : ruta.find(x => x.id === curId) || ruta.find(x => x.estado === 'nueva') || null
  const hechas = ruta.filter(x => x.estado !== 'nueva').length
  useEffect(() => {
    const k = e => { if (!a || e.target.tagName === 'INPUT' || document.querySelector('.i-dim')) return; if (e.key === 'ArrowLeft') setDescartando(a); if (e.key === 'ArrowDown') decidir(a, 'mira'); if (e.key === 'ArrowRight') decidir(a, 'preparando') }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  })
  const decidida = a && a.estado !== 'nueva'
  return (
    <div className="i-two" style={{ gridTemplateColumns: 'minmax(0,1fr) 330px' }}>
      <div>
        <h2>El radar ha encontrado {ruta.length} hoy · <span>{a ? `vais por la ${ruta.indexOf(a) + 1}` : 'todas clasificadas'}</span></h2>
        <div className="i-ruta">
          {ruta.map((x, i) => {
            const s = ESTADO_RUTA[x.estado]
            return (
              <Fragment key={x.id}>
                <button className={`nd ${s} ${a && a.id === x.id ? 'cur' : ''}`} onClick={() => setCurId(x.id)} title={s === 'pend' ? 'Abrir' : 'Pulsad para volver a clasificarla'}>
                  <span className="dot">{s === 'no' ? <Icon n="x" s={17} w={2.8} /> : s === 'lt' ? <Icon n="later" s={17} w={2.6} /> : s === 'ok' ? <Icon n="check" s={17} w={3} /> : i + 1}</span>
                  <b>{x.titulo}</b><small>{a && a.id === x.id ? 'Revisando' : ETIQ_RUTA[s]}{s !== 'pend' && <em> · cambiar ↺</em>}</small>
                </button>
                {i < ruta.length - 1 && <i className={`ln ${s}`} />}
              </Fragment>
            )
          })}
        </div>
        {a ? (
          <div className="i-card i-hero">
            {decidida && <div className="i-ya"><Icon n="undo" s={16} w={2.4} />La clasificasteis como «{ETIQ_RUTA[ESTADO_RUTA[a.estado]]}». Elegid otra opción para cambiarla.</div>}
            <div className="i-head" style={{ alignItems: 'center' }}>
              <span className={`i-v ${a.veredicto === 'mira' ? 'mira' : ''}`}><i><Icon n={a.veredicto === 'mira' ? 'eye' : 'check'} s={14} w={3} /></i>{a.veredicto === 'mira' ? 'Mirad antes de decidir' : 'Sí, merece la pena presentarla'}</span>
              <span className="i-tag">BDNS {a.bdns}</span>
            </div>
            <h3>{a.titulo}</h3>
            <div style={{ color: 'var(--mut)' }}>{a.organismo}</div>
            <div className="k4">
              <div><span>¿Cuánto dan?</span><b>{a.importe}</b></div>
              <div><span>¿Qué parte pagan?</span><b>{a.cubierto}</b></div>
              <div className="hot"><span>¿Hasta cuándo?</span><b>{dias(a.plazo)} días</b></div>
              <div><span>¿Por qué encaja?</span><b className="enc">{a.encaja}</b></div>
            </div>
            <div className="i-cita">«…<mark>{a.cita}</mark>…»<small><Icon n="verified" s={14} />Comprobado en las bases · {a.citaRef}</small></div>
            <div className="acts3">
              <button className={`i-btn ${a.estado === 'descartada' ? 'sel' : ''}`} onClick={() => setDescartando(a)}><Icon n="x" s={19} w={2.4} />No nos interesa</button>
              <button className={`i-btn ${a.estado === 'mira' ? 'sel' : ''}`} onClick={() => decidir(a, 'mira')}><Icon n="later" s={19} />Más tarde</button>
              <button className="i-btn p" onClick={() => decidir(a, 'preparando')}><Icon n="send" s={19} />Vamos a presentarla</button>
            </div>
          </div>
        ) : (
          <div className="i-card" style={{ padding: 34, textAlign: 'center' }}>
            <Svg html={plant(3)} />
            <h3 style={{ fontSize: 26, margin: '6px 0' }}>Hecho por hoy · {hechas} de {ruta.length} clasificadas</h3>
            <p className="i-sub">Pulsad cualquier convocatoria de la ruta para cambiar su decisión. El radar vuelve a buscar mañana a las 07:00.</p>
            {ruta.some(x => x.estado === 'preparando') && <button className="i-btn p" style={{ margin: '0 auto' }} onClick={() => ir('preparando')}><Icon n="doc" s={19} />Ir a preparar las que vais a presentar</button>}
          </div>
        )}
      </div>
      <Aprendido {...{ st, setSt }} />
    </div>
  )
}

function Aprendido({ st, setSt }) {
  const cuenta = st.historial.reduce((m, x) => ({ ...m, [x]: (m[x] || 0) + 1 }), {})
  const total = st.historial.length
  const detectadas = Object.entries(cuenta).filter(([m, c]) => REGLA[m] && c >= 2 && st.reglas[m] !== 'no').sort((x, y) => y[1] - x[1])
  const set = (m, v) => setSt(s => ({ ...s, reglas: { ...s.reglas, [m]: v } }))
  const nueva = () => { const t = prompt('Escribid la regla, por ejemplo: «No nos interesan las que exigen aval bancario»'); if (t) setSt(s => ({ ...s, propias: [...s.propias, { id: Date.now(), texto: t, autor: 'Vosotros', fecha: 'hoy' }] })) }
  const editar = r => { const t = prompt('Editad la regla', r.texto); if (t) setSt(s => ({ ...s, propias: s.propias.map(x => (x.id === r.id ? { ...x, texto: t } : x)) })) }
  return (
    <aside className="i-learn">
      <div className="h"><Icon n="info" s={20} />Lo que el radar ha aprendido</div>
      <p>De vuestros últimos {total} motivos de descarte, más lo que añadís.</p>
      {detectadas.map(([m, c]) => (
        <div key={m} className="rule">
          <span className="who">Detectado</span>
          <b>{REGLA[m][0]}</b><small>{c} {c === 1 ? 'vez' : 'veces'}{st.reglas[m] === 'si' ? ' · aplicada' : ''}</small>
          <div className="act">{st.reglas[m] === 'si'
            ? <><span className="ok">✓ {REGLA[m][1].replace('Ocultarlas', 'Ocultándolas').replace('Marcarlas', 'Marcándolas').replace('Avisadme antes', 'Avisando antes')}</span><button onClick={() => set(m, undefined)}>Quitar</button></>
            : <><button className="p" onClick={() => set(m, 'si')}>{REGLA[m][1]}</button><button onClick={() => set(m, 'no')}>No</button></>}</div>
        </div>
      ))}
      {st.propias.map(r => (
        <div key={r.id} className="rule mine">
          <span className="who me">Añadida por vosotros</span>
          <b>{r.texto}</b><small>{r.autor} · {r.fecha}</small>
          <div className="act"><button onClick={() => editar(r)}>Editar</button><button onClick={() => setSt(s => ({ ...s, propias: s.propias.filter(x => x.id !== r.id) }))}>Quitar</button></div>
        </div>
      ))}
      <button className="addr" onClick={nueva}><Icon n="plus" s={17} w={2.4} />Añadir una regla</button>
    </aside>
  )
}

function Descarte({ a, st, cerrar, guardar }) {
  const [sel, setSel] = useState(a.motivos || [])
  const [pct, setPct] = useState(20)
  const [nuevo, setNuevo] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [recordar, setRecordar] = useState(true)
  const todos = [...MOTIVOS, ...st.motivosPropios]
  const toggle = m => setSel(sel.includes(m) ? sel.filter(x => x !== m) : [...sel, m])
  const final = [...sel, ...(nuevo.trim() ? [nuevo.trim()] : [])]
  return (
    <div className="i-dim" onClick={cerrar}>
      <div className="i-modal i-why" onClick={e => e.stopPropagation()}>
        <div className="i-head" style={{ alignItems: 'center' }}><h2 style={{ fontSize: 26 }}>¿Por qué no os interesa?</h2><button className="i-round" style={{ background: '#F1F3EE' }} onClick={cerrar}><Icon n="x" s={18} w={2.4} /></button></div>
        <p className="i-sub" style={{ margin: '2px 0 14px' }}>{a.titulo} · Elegid uno o varios</p>
        <div className="chips">
          {todos.map(m => <button key={m} className={sel.includes(m) ? 'on' : ''} onClick={() => toggle(m)}>{m}</button>)}
          <button className="add" onClick={() => setEscribiendo(true)}>+ Añadir motivo</button>
        </div>
        {sel.includes('Piden poner mucho dinero') && (
          <div className="fq"><b>¿Cuánto podéis poner como máximo?</b><div className="chips">{[10, 20, 30].map(p => <button key={p} className={pct === p ? 'on' : ''} onClick={() => setPct(p)}>{p} %</button>)}<button className={pct === 0 ? 'on' : ''} onClick={() => setPct(0)}>Depende</button></div></div>
        )}
        {escribiendo && (
          <div className="fq"><b>Vuestro motivo</b><input className="i-in" style={{ width: '100%', fontSize: 16, letterSpacing: 0 }} autoFocus value={nuevo} onChange={e => setNuevo(e.target.value)} placeholder="Por ejemplo: exigen aval bancario" />
            <label className="cb"><input type="checkbox" checked={recordar} onChange={e => setRecordar(e.target.checked)} />Recordarlo para las próximas (crear regla)</label></div>
        )}
        {final.length > 0 && <div className="learnm"><Icon n="info" s={18} /><div><b>El radar aprende:</b> {nuevo.trim() && recordar ? `buscará «${nuevo.trim().toLowerCase()}» en las bases y os avisará antes de recomendar una.` : sel.includes('Piden poner mucho dinero') && pct ? `las que pidan poner más del ${pct} % saldrán como «Mirad antes».` : 'tendrá en cuenta este motivo en las próximas convocatorias.'}</div></div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="i-btn p" style={{ flex: 1, height: 52 }} disabled={!final.length} onClick={() => guardar(a, final, { pct, nuevo: nuevo.trim(), recordar })}>Guardar motivo</button>
          <button className="i-btn" style={{ height: 52 }} onClick={() => guardar(a, ['Sin motivo'], {})}>Saltar</button>
        </div>
      </div>
    </div>
  )
}

function Preparando({ items, ir, upd, setToast }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontSize: 26 }}>Las que vais a presentar</h2>
      {items.length === 0 && <div className="i-card i-empty">Nada en preparación. Las que marquéis «Vamos a presentarla» aparecerán aquí.</div>}
      {items.map(a => {
        const docs = a.docs || [], faltan = docs.filter(d => !d[2]).length
        return (
          <div key={a.id} className="i-card" style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 18, alignItems: 'center' }}>
            <Svg html={plant(1)} />
            <div><b style={{ fontSize: 20 }}>{a.titulo}</b><div style={{ color: 'var(--mut)', fontSize: 15 }}>{a.organismo.split(' · ')[0]} · plazo el {fecha(a.plazo)} · quedan {dias(a.plazo)} días</div>
              <div className="i-stp"><span className="now">Tenéis {docs.length - faltan} de {docs.length} documentos</span></div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <button className="i-btn p sm" onClick={() => ir('presentar', a.id)}><Icon n="doc" s={17} />Preparar papeles</button>
              <button className="i-link" onClick={() => { upd(a.id, { estado: 'nueva' }); setToast({ texto: 'Vuelve a «Por revisar»' }) }}><Icon n="undo" s={14} w={2.4} />Volver a revisar</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Isla({ n, total, children }) {
  return (
    <div className="i-isle">
      <div className="n">{n} <small>de {total} árboles</small></div>
      <p>Cada solicitud presentada planta uno.</p>
      <Svg html={island(330, 290, n, total)} style={{ display: 'block', margin: '6px -10px 0' }} />
      <div className="i-leg"><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Svg html={tree(14, 18, 17, '#2F7650')} />Presentadas</span><span style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#C24A2C' }}><svg width="12" height="18" viewBox="0 0 12 18"><rect x="4" y="3" width="3" height="15" rx="1" fill="#C79466" /><line x1="5.5" y1="6" x2="11" y2="8" stroke="#EE6A4A" strokeWidth="2" /></svg>Por plantar</span></div>
      {children}
    </div>
  )
}

// Verificación en el navegador: formato, integridad, tamaño y que parezca el documento pedido.
const quitarTildes = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const VACIAS = ['de', 'del', 'la', 'el', 'los', 'las', 'y', 'en', 'al', 'para', 'por']
async function verificar(file, doc) {
  const checks = [], ext = file.name.split('.').pop().toLowerCase()
  const firmas = { pdf: '%PDF', png: '\x89PNG', jpg: '\xff\xd8', jpeg: '\xff\xd8', docx: 'PK' }
  if (!firmas[ext]) return { estado: 'error', checks: [['no', 'Formato no admitido. Subid PDF, JPG, PNG o Word (.docx).']] }
  checks.push(['ok', `Formato ${ext.toUpperCase()}`])
  if (file.size < 1024) return { estado: 'error', checks: [...checks, ['no', 'El archivo está vacío o casi vacío.']] }
  if (file.size > 10 * 1024 * 1024) return { estado: 'error', checks: [...checks, ['no', 'Pesa más de 10 MB: la mayoría de sedes no lo aceptan.']] }
  checks.push(['ok', `Tamaño correcto (${file.size < 1048576 ? Math.round(file.size / 1024) + ' KB' : (file.size / 1048576).toFixed(1) + ' MB'})`])
  const bytes = new Uint8Array(await file.slice(0, 300000).arrayBuffer())
  const texto = Array.from(bytes, b => String.fromCharCode(b)).join('')
  if (!texto.startsWith(firmas[ext])) return { estado: 'error', checks: [...checks, ['no', 'El archivo está dañado o no es lo que dice su extensión.']] }
  checks.push(['ok', 'Se puede abrir'])
  const claves = quitarTildes(doc).split(/\s+/).filter(w => w.length > 3 && !VACIAS.includes(w))
  const donde = quitarTildes(file.name + ' ' + (ext === 'pdf' ? texto : ''))
  const hallada = claves.find(k => donde.includes(k.slice(0, 6)))
  if (hallada) { checks.push(['ok', `Parece «${doc}»`]); return { estado: 'ok', checks } }
  checks.push(['duda', `No encontramos «${claves[0] || doc}» en el archivo. Comprobad que es el documento correcto.`])
  return { estado: 'duda', checks }
}

// Valida un CIF español: letra + 7 dígitos + control (dígito o letra según el tipo de entidad).
const CIF_EJEMPLO = 'G12345674'
function validarCif(v) {
  const c = (v || '').toUpperCase().replace(/[\s.-]/g, '')
  if (!/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(c)) return [false, 'Debe ser una letra, 7 números y un dígito o letra de control (ej. G12345674).']
  const n = c.slice(1, 8).split('').map(Number)
  let suma = n[1] + n[3] + n[5]
  for (const i of [0, 2, 4, 6]) { const x = n[i] * 2; suma += Math.floor(x / 10) + (x % 10) }
  const d = (10 - (suma % 10)) % 10, letra = 'JABCDEFGHI'[d], ctl = c[8]
  const ok = 'NPQRSW'.includes(c[0]) ? ctl === letra : 'ABEH'.includes(c[0]) ? ctl === String(d) : ctl === String(d) || ctl === letra
  if (!ok) return [false, `El dígito de control no cuadra: debería terminar en ${'NPQRSW'.includes(c[0]) ? letra : d}.`]
  return [true, c[0] === 'G' ? 'CIF válido · asociación o fundación' : 'CIF válido']
}

function Presentar({ a, top, upd, ir, presentadas, setToast }) {
  if (!a) return <>{top('Convocatorias · preparar')}<div className="i-card i-empty">Elegid una convocatoria desde Preparando.</div></>
  const docs = a.docs || []
  const toggle = i => upd(a.id, { docs: docs.map((d, j) => (j === i ? [d[0], d[1], !d[2]] : d)) })
  const tiene = docs.map((d, i) => [d, i]).filter(([d]) => d[2]), falta = docs.map((d, i) => [d, i]).filter(([d]) => !d[2])
  const [revisando, setRevisando] = useState(null)
  const subir = async (i, file) => {
    if (!file) return
    setRevisando(i)
    const r = await verificar(file, docs[i][0])
    setRevisando(null)
    const archivo = { nombre: file.name, ...r }
    upd(a.id, { docs: docs.map((d, j) => (j === i ? [d[0], d[1], r.estado !== 'error', archivo] : d)) })
    setToast({ texto: r.estado === 'ok' ? `${docs[i][0]}: verificado` : r.estado === 'duda' ? `${docs[i][0]}: subido, revisadlo` : `${docs[i][0]}: no válido` })
  }
  const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const estadoDoc = d => (!d[2] ? 'falta' : d[3]?.estado === 'duda' ? 'revisar' : 'listo')
  const orden = { falta: 0, revisar: 1, listo: 2 }
  const lista = docs.map((d, i) => [d, i]).sort((x, y) => orden[estadoDoc(x[0])] - orden[estadoDoc(y[0])])
  const [abierto, setAbierto] = useState(null)
  const setDoc = (i, cambios) => upd(a.id, { docs: docs.map((d, j) => (j === i ? Object.assign([...d], cambios) : d)) })
  const Doc = ([d, i]) => {
    const f = d[3], e = revisando === i ? 'comprobando' : estadoDoc(d)
    const avisos = f ? f.checks.filter(c => c[0] !== 'ok') : []
    const etiqueta = { falta: 'Falta', revisar: 'Revisadlo', listo: 'Listo', comprobando: 'Comprobando…' }[e]
    return (
      <div key={i} className={`i-doc ${e}`}>
        <button className="ico" title="Marcar a mano" onClick={() => toggle(i)}>{e === 'listo' ? <Icon n="check" s={16} w={3} /> : e === 'revisar' ? '!' : null}</button>
        <div className="txt">
          <b>{d[0]}</b>
          <small>{f ? <><Icon n="doc" s={13} /> {f.nombre}{e === 'listo' && ' · verificado'}</> : d[1]}{d[4]?.ok && ' · revisado por vosotros'}</small>
          {e !== 'comprobando' && avisos.map(([k, t]) => <em key={t} className={k}>{t}</em>)}
        </div>
        <span className="st">{etiqueta}</span>
        <div className="acts">{e !== 'falta' && e !== 'comprobando' && <button className={`i-up ${abierto === i ? 'on' : ''}`} onClick={() => setAbierto(abierto === i ? null : i)}><Icon n="eye" s={15} />Revisar</button>}
        <label className={`i-up ${e === 'falta' ? 'p' : ''}`}><Icon n={f ? 'undo' : 'plus'} s={15} w={2.4} />{f ? 'Cambiar' : 'Subir'}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" hidden onChange={ev => { subir(i, ev.target.files[0]); ev.target.value = '' }} /></label></div>
        {abierto === i && <Revision d={d} cerrar={() => setAbierto(null)} set={c => setDoc(i, c)} />}
      </div>
    )
  }
  const n = falta.length
  return (
    <>
      {top('Convocatorias · preparar')}
      <button className="i-link" style={{ marginBottom: 8, alignSelf: 'flex-start' }} onClick={() => ir('preparando')}><Icon n="back" s={16} w={2.4} />Volver a Preparando</button>
      <div className="i-two">
        <div>
          <h2>¿Qué hace falta para presentarla?</h2>
          <p className="i-sub">{a.titulo} · {a.organismo.split(' · ')[0]}</p>
          <div className="i-card i-docs">
            <div className="i-docs-h"><b>Tenéis {tiene.length} de {docs.length} documentos</b><span>{n ? `Os ${n === 1 ? 'falta 1' : `faltan ${n}`}. Subidlos y el radar comprobará que son válidos.` : '¡Lo tenéis todo! Ya podéis presentarla.'}</span></div>
            {lista.map(Doc)}
            <p className="i-priv"><Icon n="info" s={14} />Los archivos se comprueban en vuestro ordenador y no se envían a ningún sitio.</p>
          </div>
          {a.consejo && <div className="i-tip"><span className="ic"><Icon n="info" s={20} w={2.2} /></span><div><b>Consejo del radar</b>{a.consejo}</div></div>}
        </div>
        <div className="i-side">
          <div className="i-card i-dl">
            <span className="i-k">Plazo</span>
            <div className="big">{dias(a.plazo)} días</div>
            <p>hasta el {new Date(a.plazo).getDate()} de {MESL[new Date(a.plazo).getMonth()]}</p>
            <Svg html={island(300, 200, presentadas + 1, 10)} style={{ display: 'block', margin: '6px 0 0' }} />
            <p className="tree">Al presentarla plantáis el árbol n.º {presentadas + 1}</p>
            <button className="i-btn p" style={{ width: '100%' }} onClick={() => { upd(a.id, { estado: 'presentada', paso: 1, pasos: ['Presentada', 'Estudiando', 'Resolución', 'Justificar'], fecha: 'presentada hoy', mensaje: 'La están estudiando. No tenéis que hacer nada.' }); setToast({ texto: `¡Presentada! Habéis plantado el árbol n.º ${presentadas + 1}` }); ir('presentadas') }}><Icon n="check" s={19} w={2.6} />Ya la hemos presentado</button>
            {n > 0 && <small className="warn">Aún os {n === 1 ? 'falta 1 documento' : `faltan ${n} documentos`}</small>}
          </div>
        </div>
      </div>
    </>
  )
}

function Seguimiento({ items, upd }) {
  const [seg, setSeg] = useState('marcha')
  const enMarcha = items.filter(a => a.paso < a.pasos.length - 1)
  const term = items.filter(a => a.paso >= a.pasos.length - 1)
  const lista = seg === 'marcha' ? enMarcha : term
  return (
    <>
      <div className="i-head"><h2 style={{ fontSize: 26 }}>¿Cómo van vuestras solicitudes?</h2><div className="i-seg"><button className={seg === 'marcha' ? 'on' : ''} onClick={() => setSeg('marcha')}>En marcha · {enMarcha.length}</button><button className={seg === 'term' ? 'on' : ''} onClick={() => setSeg('term')}>Terminadas · {term.length}</button></div></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {lista.length === 0 && <div className="i-card i-empty">{seg === 'marcha' ? 'No hay solicitudes en marcha.' : 'Aún no hay solicitudes terminadas.'}</div>}
        {lista.map(a => {
          const etapa = Math.min(3, a.paso + 1)
          return (
            <div key={a.id} className="i-card" style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 18, alignItems: 'center' }}>
              <Svg html={plant(etapa)} />
              <div>
                <b style={{ fontSize: 20 }}>{a.titulo}</b>
                <div style={{ color: 'var(--mut)', fontSize: 15 }}>{a.organismo.split(' · ')[0]} · {a.fecha}</div>
                <div className="i-stp">{a.pasos.map((s, i) => { const p = a.paso; return <span key={s} className={i < p ? 'd' : i === p ? 'now' : ''}>{i < p && <Icon n="check" s={13} w={3} />}{s}</span> })}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ maxWidth: 260, fontSize: 15.5, fontWeight: 600, background: a.aviso ? 'var(--co-l)' : 'var(--soft)', color: a.aviso ? '#B2432A' : 'var(--nv)', padding: '12px 16px', borderRadius: 20 }}>{a.mensaje}</div>
                {a.paso < a.pasos.length - 1 && <button className="i-link" onClick={() => upd(a.id, { paso: a.paso + 1, aviso: false, mensaje: a.paso + 1 >= a.pasos.length - 1 ? 'Último paso: justificar el gasto.' : `Ahora: ${a.pasos[a.paso + 1].toLowerCase()}.` })}>Marcar siguiente paso →</button>}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Descartadas({ items, upd, setToast }) {
  const [seg, setSeg] = useState('radar')
  const d = items.filter(a => a.estado === 'descartada')
  const lista = d.filter(a => (a.por || 'radar') === seg)
  return (
    <>
      <div className="i-head"><h2 style={{ fontSize: 26 }}>Lo que no os encaja, con su motivo</h2><div className="i-seg"><button className={seg === 'radar' ? 'on' : ''} onClick={() => setSeg('radar')}>Por el radar · {d.filter(a => (a.por || 'radar') === 'radar').length}</button><button className={seg === 'equipo' ? 'on' : ''} onClick={() => setSeg('equipo')}>Por vosotros · {d.filter(a => a.por === 'equipo').length}</button></div></div>
      <p className="i-sub">Nada desaparece sin explicar por qué. Si el radar se equivoca, recuperadla.</p>
      <div className="i-grid2">
        {lista.length === 0 && <div className="i-card i-empty" style={{ gridColumn: '1/3' }}>Nada por aquí.</div>}
        {lista.map(a => (
          <div key={a.id} className="i-card" style={{ padding: '18px 22px' }}>
            <div className="i-head" style={{ alignItems: 'center' }}><span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{(a.motivos || []).map(m => <span key={m} className="i-tag">{m}</span>)}</span><button className="i-link" onClick={() => { upd(a.id, { estado: 'nueva', por: undefined, motivos: undefined }); setToast({ texto: 'Recuperada: vuelve a «Por revisar»' }) }}><Icon n="undo" s={15} w={2.4} />Recuperar</button></div>
            <b style={{ display: 'block', fontSize: 19, margin: '10px 0 2px' }}>{a.titulo}</b>
            <div style={{ color: 'var(--mut)', fontSize: 14.5 }}>{a.organismo}</div>
            {a.cita && <div className="i-cita" style={{ marginTop: 10, fontSize: 15, padding: '10px 14px' }}>«{a.cita}»<small style={{ color: 'var(--mut)' }}><Icon n="verified" s={13} />Frase de las bases</small></div>}
          </div>
        ))}
      </div>
    </>
  )
}

function Empresas({ st, setSt, top, setToast, q }) {
  const [seg, setSeg] = useState('sin contactar')
  const segs = [['sin contactar', 'Nuevas'], ['contactada', 'Contactadas'], ['cerrada', 'Cerradas']]
  const set = (id, contacto, texto) => { setSt(s => ({ ...s, empresas: s.empresas.map(e => (e.id === id ? { ...e, contacto } : e)) })); setToast({ texto }) }
  const lista = st.empresas.filter(e => e.contacto === seg && (!q || e.proyecto.toLowerCase().includes(q.toLowerCase())))
  const arboles = ha => { const n = parseInt(ha); return isNaN(n) ? 4 : Math.max(3, Math.min(8, Math.round(n / 1.7))) }
  return (
    <>
      {top('Empresas · BOE')}
      <div className="i-head"><h2>Empresas que tienen que reforestar</h2><div className="i-seg">{segs.map(([k, l]) => <button key={k} className={seg === k ? 'on' : ''} onClick={() => setSeg(k)}>{l} · {st.empresas.filter(e => e.contacto === k).length}</button>)}</div></div>
      <p className="i-sub">Tienen una declaración de impacto ambiental favorable que les obliga a plantar. Podéis ofreceros a hacerlo, siempre por su canal público.</p>
      <div className="i-grid3">
        {lista.length === 0 && <div className="i-card i-empty" style={{ gridColumn: '1/4' }}>Nada en esta pestaña.</div>}
        {lista.map((e, i) => (
          <div key={e.id} className="i-card" style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(#F8FAF6,#EAF1E6)', borderRadius: 22, height: 170, display: 'grid', placeItems: 'center', overflow: 'hidden' }}><Svg html={island(260, 190, arboles(e.ha), arboles(e.ha), 10 + e.id)} style={{ width: 260 }} /></div>
            <div className="i-head" style={{ margin: '12px 0 6px', alignItems: 'center' }}><span className="i-tag" style={{ background: e.veredicto === 'noencaja' ? '#F1F3EE' : '#F7E3D4', color: e.veredicto === 'noencaja' ? '#4D5662' : '#9A5B2E' }}>{e.rsc ? 'Programa voluntario' : e.veredicto === 'noencaja' ? 'No es reforestación' : 'Obligada a reforestar'}</span><span className="i-ej">Ejemplo</span></div>
            <b style={{ fontSize: 19, lineHeight: 1.2 }}>{e.promotor} · {e.proyecto}</b>
            <p style={{ fontSize: 14.5, color: 'var(--mut)', margin: '4px 0 0' }}>{e.medida}</p>
            <div style={{ display: 'flex', gap: 20, margin: '10px 0 14px' }}><div><span style={{ fontSize: 13, color: 'var(--mut)' }}>¿Cuánto plantar?</span><b style={{ display: 'block', fontSize: 20 }} className={e.ha === 'No indicado' ? 'i-ni' : ''}>{e.ha}</b></div><div><span style={{ fontSize: 13, color: 'var(--mut)' }}>¿Dónde?</span><b style={{ display: 'block', fontSize: 20 }}>{e.provincia}</b></div></div>
            <div style={{ marginTop: 'auto' }}>
              {seg === 'sin contactar' && <button className="i-btn p sm" style={{ width: '100%' }} onClick={() => set(e.id, 'contactada', 'Marcada como contactada')}><Icon n="send" s={17} />Ofrecernos a ejecutarlo</button>}
              {seg === 'contactada' && <button className="i-btn sm" style={{ width: '100%' }} onClick={() => set(e.id, 'cerrada', 'Movida a cerradas')}><Icon n="check" s={17} w={2.6} />Marcar como cerrada</button>}
              {seg === 'cerrada' && <button className="i-btn sm" style={{ width: '100%' }} onClick={() => set(e.id, 'sin contactar', 'Vuelve a nuevas')}><Icon n="undo" s={17} />Reabrir</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function Perfil({ st, setSt, top, presentadas }) {
  const [zonas, setZonas] = useState(['Comunidad de Madrid', 'Sierra de Guadarrama', 'Sur de Madrid'])
  const Sw = ({ k }) => <button className={`i-sw ${st[k] ? '' : 'off'}`} aria-pressed={st[k]} onClick={() => setSt(s => ({ ...s, [k]: !s[k] }))} />
  return (
    <>
      {top('Perfil')}
      <h2>Lo que el radar sabe de Reforesta</h2>
      <p className="i-sub">Si algo cambia, editadlo aquí y el radar lo tendrá en cuenta.</p>
      <div className="i-two">
        <div className="i-card" style={{ padding: '22px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', alignContent: 'start' }}>
          <div className="i-field"><span>Nombre</span><b>Asociación Reforesta</b></div>
          <div className="i-field"><span>CIF</span><b>{CIF_EJEMPLO} (ejemplo)</b></div>
          <div className="i-field"><span>Tipo de entidad</span><b>Sin ánimo de lucro · utilidad pública</b></div>
          <div className="i-field"><span>Equipo</span><b>7 personas</b></div>
          <div className="i-field" style={{ gridColumn: '1/3' }}><span>¿Dónde trabajáis?</span><div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>{zonas.map((z, i) => <span key={z} className="i-tag" style={i ? { background: '#fff' } : { background: 'var(--nv)', color: '#fff' }}>{z}</span>)}<button className="i-tag" style={{ background: '#fff', border: '1.5px dashed #BFC6BC' }} onClick={() => { const z = prompt('Nueva zona'); if (z) setZonas([...zonas, z]) }}>+ Añadir</button></div></div>
          <div className="i-field" style={{ gridColumn: '1/3' }}><span>Documentos guardados</span><div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>{['Estatutos', 'Certificado de Hacienda', 'Seguridad Social'].map(d => <span key={d} className="i-tag" style={{ background: 'var(--gr-l)', color: 'var(--gr-d)' }}>✓ {d}</span>)}<span className="i-tag" style={{ background: 'var(--co-l)', color: '#B2432A' }}>Memoria 2025 · falta</span></div></div>
          <div className="i-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span>Avisos por correo</span><b>{st.avisos ? 'Cada mañana' : 'Desactivados'}</b></div><Sw k="avisos" /></div>
          <div className="i-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><span>Ampliar a toda España</span><b>{st.espana ? 'Activado' : 'Solo Madrid'}</b></div><Sw k="espana" /></div>
          <a href="#/propuestas" className="i-link" style={{ gridColumn: '1/3', marginTop: 4 }}>Ver la página pública de propuestas para empresas →</a>
        </div>
        <div className="i-isle">
          <span className="i-k">Objetivo del año</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0' }}>
            <button className="i-round" style={{ fontSize: 22 }} onClick={() => setSt(s => ({ ...s, objetivo: Math.max(1, s.objetivo - 1) }))}>−</button>
            <span className="n">{st.objetivo}</span>
            <button className="i-round" style={{ fontSize: 22 }} onClick={() => setSt(s => ({ ...s, objetivo: Math.min(20, s.objetivo + 1) }))}>+</button>
          </div>
          <p>solicitudes. Un árbol por cada una. Lleváis {presentadas}.</p>
          <Svg html={island(310, 250, presentadas, st.objetivo)} />
          <button className="i-link" style={{ marginTop: 8 }} onClick={() => { if (confirm('¿Volver a los datos de ejemplo?')) { localStorage.removeItem(KEY); location.reload() } }}>Restablecer datos de ejemplo</button>
        </div>
      </div>
    </>
  )
}

function Revision({ d, cerrar, set }) {
  const esCif = /cif/i.test(d[0]), f = d[3]
  const [cif, setCif] = useState(d[4]?.valor || CIF_EJEMPLO)
  const [ok, msg] = validarCif(cif)
  const confirmar = () => { set({ 2: true, 4: { ok: true, valor: esCif ? cif.toUpperCase() : undefined } }); cerrar() }
  return (
    <div className="i-rev">
      {esCif ? (<>
        <label className="lab">CIF de la entidad</label>
        <input className={`i-in ${ok ? 'ok' : 'no'}`} value={cif} onChange={e => setCif(e.target.value)} spellCheck="false" />
        <p className={ok ? 'okm' : 'nom'}>{ok ? '✓ ' : '✕ '}{msg}</p>
        <p className="mut">Sale de vuestro perfil. Si lo cambiáis aquí, se usará en esta solicitud.</p>
      </>) : f ? (<>
        <p className="lab">Comprobaciones de «{f.nombre}»</p>
        {f.checks.map(([k, t]) => <p key={t} className={k === 'ok' ? 'okm' : k === 'duda' ? 'dum' : 'nom'}>{k === 'ok' ? '✓' : k === 'duda' ? '!' : '✕'} {t}</p>)}
        <p className="mut">El radar comprueba formato, tamaño y que parezca el documento. Revisad vosotros fechas y firmas.</p>
      </>) : (<>
        <p className="lab">{d[1]}</p>
        <p className="mut">Lo tenéis guardado en vuestro perfil. Comprobad que sigue vigente antes de presentarlo.</p>
      </>)}
      <div className="row">
        <button className="i-btn sm p" disabled={esCif && !ok} style={esCif && !ok ? { opacity: .45, cursor: 'not-allowed' } : null} onClick={confirmar}><Icon n="check" s={16} w={2.6} />Es correcto</button>
        <button className="i-btn sm" onClick={() => { set({ 2: false, 3: undefined, 4: undefined }); cerrar() }}><Icon n="x" s={16} w={2.4} />No lo tenemos</button>
      </div>
    </div>
  )
}
