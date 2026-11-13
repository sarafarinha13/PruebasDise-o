import { useState } from 'react'
import { cargar, guardar } from '../data/store.js'

const ESTADOS = [['recibida', 'Recibida'], ['conversacion', 'En conversación'], ['aceptada', 'Aceptada'], ['rechazada', 'Rechazada'], ['completada', 'Completada']]

export default function Propuestas() {
  const [d, setD] = useState(cargar)
  const [tab, setTab] = useState('recibida')
  const [copiado, setCopiado] = useState(false)
  const set = nuevo => { setD(nuevo); guardar(nuevo) }

  const resolver = (r, estado) => {
    const propuestas = estado === 'aceptada'
      ? d.propuestas.map(p => (p.id === r.propuestaId ? { ...p, plazas: Math.max(0, p.plazas - 1) } : p))
      : d.propuestas
    set({ propuestas, reservas: d.reservas.map(x => (x.id === r.id ? { ...x, estado } : x)) })
  }
  const nueva = () => set({ ...d, propuestas: [...d.propuestas, { id: Date.now(), titulo: 'Nueva propuesta', zona: 'Por definir', incluye: '', plazas: 1, estado: 'borrador' }] })
  const publicar = p => set({ ...d, propuestas: d.propuestas.map(x => (x.id === p.id ? { ...x, estado: 'publicada' } : x)) })
  const copiar = () => { navigator.clipboard?.writeText(location.origin + location.pathname + '#/propuestas').catch(() => {}); setCopiado(true) }
  const lista = d.reservas.filter(r => r.estado === tab)

  return (
    <div>
      <div className="stats"><h1>Mis propuestas</h1><button className="primary" onClick={nueva}>+ Nueva propuesta</button></div>
      <div className="grid3">
        {d.propuestas.map(p => (
          <div key={p.id} className="card col">
            <strong>{p.titulo}</strong><small>{p.zona}</small>
            <div className="badges">
              <span className={`badge ${p.estado === 'publicada' ? 'green' : p.estado === 'reservada' ? 'amber' : 'gray'}`}>{p.estado[0].toUpperCase() + p.estado.slice(1)}</span>
              <span className="badge gray">{p.plazas} libres</span>
            </div>
            {p.estado === 'borrador' && <button onClick={() => publicar(p)}>Publicar</button>}
          </div>
        ))}
      </div>
      <div className="stats" style={{ marginTop: '1.5rem' }}><small>RESERVAS RECIBIDAS</small>
        <button onClick={copiar}>{copiado ? 'Enlace público copiado ✓' : 'Copiar enlace público'}</button></div>
      <div className="tabs">{ESTADOS.map(([k, l]) => <button key={k} className={k === tab ? 'active' : ''} onClick={() => setTab(k)}>{l} · {d.reservas.filter(r => r.estado === k).length}</button>)}</div>
      {lista.length === 0 && <p className="note">Aún no hay reservas aquí. Comparte el enlace.</p>}
      {lista.map(r => (
        <div key={r.id} className="card col">
          <strong>{r.empresa} · {d.propuestas.find(p => p.id === r.propuestaId)?.titulo}</strong>
          <small>{r.contacto} · {r.email} · «{r.mensaje}»</small>
          <div className="actions">
            {tab === 'recibida' && <><button className="primary" onClick={() => resolver(r, 'aceptada')}>Aceptar</button><button onClick={() => resolver(r, 'conversacion')}>Pasar a conversación</button><button onClick={() => resolver(r, 'rechazada')}>Rechazar</button></>}
            {tab === 'conversacion' && <><button className="primary" onClick={() => resolver(r, 'aceptada')}>Aceptar</button><button onClick={() => resolver(r, 'rechazada')}>Rechazar</button></>}
            {tab === 'aceptada' && <button onClick={() => resolver(r, 'completada')}>Marcar completada</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
