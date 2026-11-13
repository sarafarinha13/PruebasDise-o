const DOCS = ['Estatutos', 'CIF', 'Certificado al corriente', 'Presupuesto del proyecto']
const FASES = [['preparando', 'Preparando'], ['presentada', 'Presentada'], ['resuelta', 'Resuelta']]
const PASOS = ['Detectada', 'Requisitos', 'Documentos', 'Presentar', 'Resolución']
const PASO_ACTUAL = { preparando: 2, presentada: 3, resuelta: 4 }

export default function Seguimiento({ items, setItems }) {
  const lista = items.filter(a => a.estado === 'seguimiento')
  const upd = (id, cambios) => setItems(items.map(a => (a.id === id ? { ...a, ...cambios } : a)))
  const toggleDoc = (a, d) => {
    const hechos = a.docsHechos || ['Estatutos', 'CIF']
    upd(a.id, { docsHechos: hechos.includes(d) ? hechos.filter(x => x !== d) : [...hechos, d] })
  }

  return (
    <div>
      <p className="note">Sin importes agregados</p>
      <div className="grid3 kanban">
        {FASES.map(([fase, titulo]) => {
          const col = lista.filter(a => (a.fase || 'preparando') === fase)
          return (
            <div key={fase} className="card col">
              <small>{titulo.toUpperCase()} · {col.length}</small>
              {col.length === 0 && <p className="note">Nada aquí.</p>}
              {col.map(a => {
                const hechos = a.docsHechos || ['Estatutos', 'CIF']
                return (
                  <div key={a.id} className="mini">
                    <strong>{a.titulo}</strong>
                    {fase === 'preparando' && (<>
                      <div className="progress"><i style={{ width: `${(hechos.length / DOCS.length) * 100}%` }} /></div>
                      {DOCS.map(d => <label key={d}><input type="checkbox" checked={hechos.includes(d)} onChange={() => toggleDoc(a, d)} /> {d}</label>)}
                      <button className="primary" onClick={() => upd(a.id, { fase: 'presentada' })}>Marcar presentada</button>
                    </>)}
                    {fase === 'presentada' && (<>
                      <small>Resolución prevista: {a.resolucion}</small>
                      <span className="badge amber">En espera</span>
                      <div className="actions">
                        <button onClick={() => upd(a.id, { fase: 'resuelta', resultado: 'concedida' })}>Concedida</button>
                        <button onClick={() => upd(a.id, { fase: 'resuelta', resultado: 'denegada' })}>Denegada</button>
                      </div>
                    </>)}
                    {fase === 'resuelta' && <span className={`badge ${a.resultado === 'concedida' ? 'green' : 'red'}`}>{a.resultado === 'concedida' ? 'Concedida' : 'Denegada'}</span>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      {lista[0] && (
        <div className="card timeline">
          <small>LÍNEA DE TIEMPO · {lista[0].titulo.toUpperCase()}</small>
          <div className="chips">
            {PASOS.map((p, i) => <span key={p} className={`chip ${i <= PASO_ACTUAL[lista[0].fase || 'preparando'] ? 'done' : ''}`}>{p}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}
