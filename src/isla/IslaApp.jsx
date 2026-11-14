import { useEffect, useMemo, useState } from 'react'
import { AYUDAS } from '../data/ayudas.js'
import { EMPRESAS } from '../data/empresas.js'
import Icon from './Icon.jsx'
import { island, plant, tree } from './lp.js'
import './isla.css'

const KEY = 'radar-isla-v1'
const MOTIVOS = ['No es de reforestación', 'Piden poner demasiado dinero', 'No llegamos al plazo', 'Es fuera de nuestra zona', 'Otro motivo']
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const HOY = new Date()
const dias = f => Math.max(0, Math.ceil((new Date(f) - HOY) / 864e5))
const fecha = f => { const d = new Date(f); return `${d.getDate()} ${MESES[d.getMonth()].toLowerCase()}.` }
const Svg = ({ html, ...p }) => <span {...p} dangerouslySetInnerHTML={{ __html: html }} />

function cargar() {
  const base = { items: AYUDAS.map(a => ({ ...a })), empresas: EMPRESAS.map(e => ({ ...e })), objetivo: 10, avisos: true, espana: false }
  try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.items ? { ...base, ...s } : base } catch { return base }
}

export default function IslaApp() {
  const [st, setSt] = useState(cargar)
  const [vista, setVista] = useState('ayudas')
  const [selId, setSelId] = useState(null)
  const [modal, setModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [q, setQ] = useState('')
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(st)) } catch { /* sin almacenamiento */ } }, [st])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 6000); return () => clearTimeout(t) }, [toast])

  const { items } = st
  const upd = (id, c) => setSt(s => ({ ...s, items: s.items.map(a => (a.id === id ? { ...a, ...c } : a)) }))
  const match = a => !q || a.titulo.toLowerCase().includes(q.toLowerCase())
  const cola = items.filter(a => a.estado === 'nueva' && match(a)).sort((a, b) => a.plazo.localeCompare(b.plazo))
  const actual = cola[0]
  const presentadas = items.filter(a => a.estado === 'presentada').length
  const ir = (v, id = null) => { setVista(v); setSelId(id); window.scrollTo?.(0, 0) }
  const conDeshacer = (texto, id, previo) => setToast({ texto, undo: () => upd(id, previo) })

  const nav = [['ayudas', 'inbox', 'Ayudas', items.filter(a => a.estado === 'nueva').length], ['empresas', 'building', 'Empresas', st.empresas.filter(e => e.contacto === 'sin contactar').length], ['seguimiento', 'flag', 'Seguim.'], ['descartadas', 'eye', 'Descart.']]
  const top = k => (
    <div className="i-top">
      <div className="i-k">{k} · <span className="i-ej">Ejemplo</span></div>
      <div style={{ display: 'flex', gap: 10 }}>
        <label className="i-srch"><Icon n="search" s={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar convocatoria…" /></label>
        <span className="i-round"><Icon n="bell" s={19} /></span>
      </div>
    </div>
  )

  let page
  if (vista === 'ayudas') page = <Ayudas {...{ st, cola, actual, presentadas, top, upd, ir, setModal, conDeshacer, setSt }} />
  else if (vista === 'presentar') page = <Presentar a={items.find(a => a.id === selId)} {...{ top, upd, ir, presentadas, setToast }} />
  else if (vista === 'seguimiento') page = <Seguimiento items={items.filter(match)} {...{ top, upd, ir }} />
  else if (vista === 'descartadas') page = <Descartadas items={items.filter(match)} {...{ top, upd, setToast }} />
  else if (vista === 'empresas') page = <Empresas {...{ st, setSt, top, setToast, q }} />
  else page = <Perfil {...{ st, setSt, top, presentadas }} />

  return (
    <div className="isla">
      <aside className="i-rail">
        <Svg className="mk" html={tree(40, 40, 30)} />
        {nav.map(([k, i, t, c]) => (
          <button key={k} className={`it ${vista === k || (k === 'ayudas' && vista === 'presentar') ? 'on' : ''}`} onClick={() => ir(k)}>
            <Icon n={i} s={22} />{t}{c ? <span className="cnt">{c}</span> : null}
          </button>
        ))}
        <button className={`me ${vista === 'perfil' ? 'on' : ''}`} onClick={() => ir('perfil')} title="Perfil">MC</button>
      </aside>
      <div className="i-page">{page}</div>
      {modal && actual && (
        <div className="i-dim" onClick={() => setModal(false)}>
          <div className="i-modal" onClick={e => e.stopPropagation()}>
            <div className="i-head" style={{ alignItems: 'center' }}><h2 style={{ fontSize: 28 }}>¿Por qué no os interesa?</h2><button className="i-round" style={{ background: '#F1F3EE' }} onClick={() => setModal(false)}><Icon n="x" s={18} w={2.4} /></button></div>
            <p className="i-sub" style={{ marginBottom: 18 }}>Nos ayuda a afinar el radar.</p>
            {MOTIVOS.map(m => (
              <button key={m} className="i-op" onClick={() => { const prev = { estado: actual.estado }; upd(actual.id, { estado: 'descartada', por: 'equipo', motivoDescarte: m }); setModal(false); conDeshacer(`${actual.titulo.slice(0, 40)}…, descartada`, actual.id, prev) }}>{m}<span className="r" /></button>
            ))}
          </div>
        </div>
      )}
      {toast && <div className="i-toast"><Icon n="check" s={18} w={2.6} />{toast.texto}{toast.undo && <button onClick={() => { toast.undo(); setToast(null) }}><Icon n="undo" s={16} w={2.4} />Deshacer</button>}</div>}
    </div>
  )
}

function Meses({ items, actual }) {
  const ini = HOY.getMonth() >= 10 ? new Date(HOY.getFullYear(), 10, 1) : new Date(HOY.getFullYear() - 1, 10, 1)
  const meses = [...Array(12)].map((_, i) => new Date(ini.getFullYear(), ini.getMonth() + i, 1))
  const vivas = items.filter(a => ['nueva', 'mira', 'preparando'].includes(a.estado))
  return (
    <div className="i-mo">
      {meses.map((m, i) => {
        const a = (actual && new Date(actual.plazo).getMonth() === m.getMonth() && new Date(actual.plazo).getFullYear() === m.getFullYear()) ? actual
          : vivas.find(x => { const d = new Date(x.plazo); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() })
        const hoy = m.getMonth() === HOY.getMonth() && m.getFullYear() === HOY.getFullYear()
        return <div key={i} className={`${i < 5 ? 's' : ''} ${hoy ? 'today' : ''}`} title={i < 5 ? 'Época de plantar' : ''}>{MESES[m.getMonth()]}{a && <b className={a === actual ? 'on' : ''}>{fecha(a.plazo)}</b>}</div>
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

function Ayudas({ st, cola, actual, presentadas, top, upd, ir, setModal, conDeshacer, setSt }) {
  const { items } = st
  const luego = items.filter(a => a.estado === 'mira')
  const viene = items.filter(a => ['nueva', 'mira', 'preparando'].includes(a.estado) && a !== actual).sort((a, b) => a.plazo.localeCompare(b.plazo)).slice(0, 4)
  useEffect(() => {
    const k = e => { if (!actual || e.target.tagName === 'INPUT') return; if (e.key === 'ArrowLeft') setModal(true); if (e.key === 'ArrowDown') { upd(actual.id, { estado: 'mira' }); conDeshacer('Guardada para más tarde', actual.id, { estado: 'nueva' }) } if (e.key === 'ArrowRight') { upd(actual.id, { estado: 'preparando' }); ir('presentar', actual.id) } }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  })
  return (
    <>
      {top(`Hoy, ${HOY.getDate()} de ${['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][HOY.getMonth()]}`)}
      <div className="i-two">
        <div>
          <h2>{actual ? <>{cola.length} {cola.length === 1 ? 'convocatoria' : 'convocatorias'} por revisar. <span>La primera cierra en {dias(actual.plazo)} días.</span></> : 'Todo revisado por hoy.'}</h2>
          <Meses items={items} actual={actual} />
          {actual ? (
            <div className="i-card" style={{ padding: '22px 26px' }}>
              <div className="i-head" style={{ alignItems: 'center' }}>
                <span className={`i-v ${actual.veredicto === 'mira' ? 'mira' : ''}`}><i><Icon n={actual.veredicto === 'mira' ? 'eye' : 'check'} s={14} w={3} /></i>{actual.veredicto === 'mira' ? 'Mirad antes de decidir' : 'Sí, merece la pena presentarla'}</span>
                <span className="i-tag">BDNS {actual.bdns} · quedan {cola.length}</span>
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.025em', margin: '12px 0 2px', lineHeight: 1.15 }}>{actual.titulo}</h3>
              <div style={{ color: 'var(--mut)' }}>{actual.organismo}</div>
              <p style={{ fontSize: 17, margin: '12px 0 0' }}>{actual.motivo}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, margin: '14px 0 12px' }}>
                <div className="i-tile"><span>¿Cuánto dan?</span><b>{actual.importe}</b></div>
                <div className="i-tile"><span>¿Qué parte pagan?</span><b>{actual.cubierto}</b></div>
                <div className="i-tile hot"><span>¿Hasta cuándo?</span><b>{dias(actual.plazo)} días</b></div>
                <div className="i-tile"><span>¿Cuándo cobráis?</span>{actual.pago ? <b>{actual.pago}</b> : <b className="i-ni">No lo dicen</b>}</div>
              </div>
              <div className="i-cita">«…<mark>{actual.cita}</mark>…»<small><Icon n="verified" s={14} />Comprobado en las bases · {actual.citaRef}</small></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 10, marginTop: 16 }}>
                <button className="i-btn" onClick={() => setModal(true)}><Icon n="x" s={19} w={2.4} />No nos interesa</button>
                <button className="i-btn" onClick={() => { upd(actual.id, { estado: 'mira' }); conDeshacer('Guardada para más tarde', actual.id, { estado: 'nueva' }) }}><Icon n="later" s={19} />Más tarde</button>
                <button className="i-btn p" onClick={() => { upd(actual.id, { estado: 'preparando' }); ir('presentar', actual.id) }}><Icon n="send" s={19} />Vamos a presentarla</button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--mut)', textAlign: 'center', marginTop: 10 }}>Atajos: ← no interesa · ↓ más tarde · → presentar</p>
            </div>
          ) : (
            <div className="i-card" style={{ padding: 34, textAlign: 'center' }}>
              <Svg html={plant(3)} />
              <h3 style={{ fontSize: 26, margin: '6px 0' }}>Hecho por hoy</h3>
              <p className="i-sub">El radar vuelve a leer las convocatorias mañana a las 07:00.</p>
              {luego.length > 0 && <button className="i-btn" style={{ margin: '0 auto' }} onClick={() => setSt(s => ({ ...s, items: s.items.map(a => (a.estado === 'mira' ? { ...a, estado: 'nueva' } : a)) }))}><Icon n="later" s={19} />Revisar las que dejasteis para luego · {luego.length}</button>}
            </div>
          )}
        </div>
        <div className="i-side">
          <Isla n={presentadas} total={st.objetivo} />
          <div className="i-mini"><h4>LO QUE VIENE</h4>
            {viene.length === 0 && <p style={{ color: 'var(--mut)', fontSize: 15, paddingTop: 6 }}>Nada pendiente.</p>}
            {viene.map(a => (
              <button key={a.id} className="i-row" onClick={() => a.estado === 'preparando' ? ir('presentar', a.id) : null}>
                <b>{a.titulo.length > 32 ? a.titulo.slice(0, 30) + '…' : a.titulo}{a.estado === 'mira' && <span className="i-tag" style={{ marginLeft: 6 }}>Luego</span>}{a.estado === 'preparando' && <span className="i-tag" style={{ marginLeft: 6, background: 'var(--co-l)', color: 'var(--co-d)' }}>Preparando</span>}</b>
                <span className="d">{fecha(a.plazo)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function Presentar({ a, top, upd, ir, presentadas, setToast }) {
  if (!a) return <>{top('Ayudas · presentar')}<div className="i-card i-empty">Elegid una convocatoria desde Ayudas.</div></>
  const docs = a.docs || []
  const toggle = i => upd(a.id, { docs: docs.map((d, j) => (j === i ? [d[0], d[1], !d[2]] : d)) })
  const tiene = docs.map((d, i) => [d, i]).filter(([d]) => d[2]), falta = docs.map((d, i) => [d, i]).filter(([d]) => !d[2])
  const Ck = ([d, i]) => <button key={i} className={`i-ck ${d[2] ? 'y' : 'f'}`} onClick={() => toggle(i)}><span className="x">{d[2] && <Icon n="check" s={15} w={3} />}</span><div>{d[0]}<small>{d[1]}</small></div></button>
  return (
    <>
      {top('Ayudas · presentar')}
      <button className="i-link" style={{ marginBottom: 8 }} onClick={() => ir('ayudas')}><Icon n="back" s={16} w={2.4} />Volver a la revisión</button>
      <h2>¿Qué hace falta para presentarla?</h2>
      <p className="i-sub">{a.titulo} · {a.organismo}</p>
      <div className="i-two">
        <div className="i-card" style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignContent: 'start' }}>
          <div><div className="i-k" style={{ marginBottom: 10 }}>Ya lo tenéis · {tiene.length}</div>{tiene.map(Ck)}</div>
          <div><div className="i-k" style={{ marginBottom: 10, color: 'var(--co-d)' }}>Os falta · {falta.length}</div>{falta.length ? falta.map(Ck) : <p style={{ color: 'var(--gr-d)', fontWeight: 600 }}>¡Lo tenéis todo!</p>}</div>
          <div className="i-cita" style={{ gridColumn: '1/3' }}><b>Consejo del radar:</b> {a.consejo} <span style={{ color: 'var(--mut)' }}>Tocad un documento para marcarlo.</span></div>
        </div>
        <div className="i-side">
          <div className="i-card" style={{ padding: 22, textAlign: 'center', background: 'var(--co-l)' }}>
            <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: '-.04em', color: 'var(--co-d)', lineHeight: 1 }}>{dias(a.plazo)} días</div>
            <p style={{ color: '#8A4A35', margin: '6px 0 16px' }}>para el {new Date(a.plazo).getDate()} de {['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][new Date(a.plazo).getMonth()]}</p>
            <button className="i-btn n" style={{ width: '100%' }} onClick={() => { upd(a.id, { estado: 'presentada', paso: 1, pasos: ['Presentada', 'Estudiando', 'Resolución', 'Justificar'], fecha: 'presentada hoy', mensaje: 'La están estudiando. No tenéis que hacer nada.' }); setToast({ texto: `¡Presentada! Habéis plantado el árbol n.º ${presentadas + 1}` }); ir('seguimiento') }}><Icon n="check" s={19} w={2.6} />Ya la hemos presentado</button>
          </div>
          <div className="i-isle" style={{ textAlign: 'center' }}><p style={{ margin: '0 0 -6px', fontWeight: 600 }}>Al presentarla plantáis el árbol n.º {presentadas + 1}</p><Svg html={island(310, 230, presentadas + 1, 10)} /></div>
        </div>
      </div>
    </>
  )
}

function Seguimiento({ items, top, upd, ir }) {
  const [seg, setSeg] = useState('marcha')
  const enMarcha = items.filter(a => a.estado === 'preparando' || (a.estado === 'presentada' && a.paso < a.pasos.length - 1))
  const term = items.filter(a => a.estado === 'presentada' && a.paso >= a.pasos.length - 1)
  const lista = seg === 'marcha' ? enMarcha : term
  return (
    <>
      {top('Seguimiento')}
      <div className="i-head"><h2>¿Cómo van vuestras solicitudes?</h2><div className="i-seg"><button className={seg === 'marcha' ? 'on' : ''} onClick={() => setSeg('marcha')}>En marcha · {enMarcha.length}</button><button className={seg === 'term' ? 'on' : ''} onClick={() => setSeg('term')}>Terminadas · {term.length}</button></div></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {lista.length === 0 && <div className="i-card i-empty">{seg === 'marcha' ? 'No hay solicitudes en marcha.' : 'Aún no hay solicitudes terminadas.'}</div>}
        {lista.map(a => {
          const prep = a.estado === 'preparando'
          const faltan = (a.docs || []).filter(d => !d[2]).length
          const etapa = prep ? 0 : Math.min(3, a.paso + 1)
          return (
            <div key={a.id} className="i-card" style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 18, alignItems: 'center' }}>
              <Svg html={plant(etapa)} />
              <div>
                <b style={{ fontSize: 20 }}>{a.titulo}</b>
                <div style={{ color: 'var(--mut)', fontSize: 15 }}>{a.organismo.split(' · ')[0]} · {prep ? `plazo el ${fecha(a.plazo)}` : a.fecha}</div>
                <div className="i-stp">{(prep ? ['Preparando', 'Presentada', 'Resolución', 'Justificar'] : a.pasos).map((s, i) => { const p = prep ? 0 : a.paso; return <span key={s} className={i < p ? 'd' : i === p ? 'now' : ''}>{i < p && <Icon n="check" s={13} w={3} />}{s}</span> })}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ maxWidth: 260, fontSize: 15.5, fontWeight: 600, background: a.aviso || prep ? 'var(--co-l)' : 'var(--soft)', color: a.aviso || prep ? '#B2432A' : 'var(--nv)', padding: '12px 16px', borderRadius: 20 }}>{prep ? (faltan ? `Os faltan ${faltan} documentos.` : 'Lo tenéis todo: ¡a presentarla!') : a.mensaje}</div>
                {prep ? <button className="i-link" onClick={() => ir('presentar', a.id)}>Seguir preparando →</button>
                  : <button className="i-link" onClick={() => upd(a.id, { paso: a.paso + 1, aviso: false, mensaje: a.paso + 1 >= a.pasos.length - 1 ? 'Último paso: justificar el gasto.' : `Ahora: ${a.pasos[a.paso + 1].toLowerCase()}.` })}>Marcar siguiente paso →</button>}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Descartadas({ items, top, upd, setToast }) {
  const [seg, setSeg] = useState('radar')
  const d = items.filter(a => a.estado === 'descartada')
  const lista = d.filter(a => (a.por || 'radar') === seg)
  return (
    <>
      {top('Descartadas')}
      <div className="i-head"><h2>Lo que no os encaja, con su motivo</h2><div className="i-seg"><button className={seg === 'radar' ? 'on' : ''} onClick={() => setSeg('radar')}>Por el radar · {d.filter(a => (a.por || 'radar') === 'radar').length}</button><button className={seg === 'equipo' ? 'on' : ''} onClick={() => setSeg('equipo')}>Por vosotros · {d.filter(a => a.por === 'equipo').length}</button></div></div>
      <p className="i-sub">Nada desaparece sin explicar por qué. Si el radar se equivoca, recuperadla.</p>
      <div className="i-grid2">
        {lista.length === 0 && <div className="i-card i-empty" style={{ gridColumn: '1/3' }}>Nada por aquí.</div>}
        {lista.map(a => (
          <div key={a.id} className="i-card" style={{ padding: '18px 22px' }}>
            <div className="i-head" style={{ alignItems: 'center' }}><span className="i-tag">{a.motivoDescarte}</span><button className="i-link" onClick={() => { upd(a.id, { estado: 'nueva', por: undefined }); setToast({ texto: 'Recuperada: vuelve a la revisión' }) }}><Icon n="undo" s={15} w={2.4} />Recuperar</button></div>
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
          <div className="i-field"><span>CIF</span><b>G-00000000 (ejemplo)</b></div>
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
