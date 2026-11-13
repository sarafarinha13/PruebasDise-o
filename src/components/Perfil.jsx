import { useState } from 'react'

const KEY = 'reforesta-perfil-v1'
const leer = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }

export default function Perfil() {
  const [p, setP] = useState(leer)
  const [espana, setEspana] = useState(false)
  const campo = (k, ph) => (
    <input placeholder={ph} value={p[k] || ''} onChange={e => {
      const n = { ...p, [k]: e.target.value }; setP(n)
      try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* sin almacenamiento */ }
    }} />
  )
  return (
    <div>
      <h1>Qué sabe el radar de nosotros</h1>
      <div className="grid2" style={{ maxWidth: 'none' }}>
        <div className="col">
          <div className="card left"><small>LÍNEA DE TRABAJO</small><span><span className="badge green">Reforestación</span> <small>Solo lectura</small></span></div>
          <div className="card left"><small>TERRITORIO</small><span className="badge amber">Comunidad de Madrid</span>
            <label><input type="checkbox" checked={espana} onChange={e => setEspana(e.target.checked)} /> Ampliar a toda España</label></div>
        </div>
        <div className="card left"><small>DATOS FIJOS DE LA ENTIDAD · editables</small>
          {campo('nombre', 'Nombre y CIF')}{campo('estatutos', 'Estatutos y utilidad pública')}{campo('contacto', 'Persona de contacto')}
          <small>Autorrellenan el checklist de cada solicitud.</small></div>
      </div>
    </div>
  )
}
