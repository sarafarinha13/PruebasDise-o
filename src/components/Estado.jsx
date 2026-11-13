// Mensajes de estado reutilizables (vacíos y errores).
export function Banner({ children, onRetry }) {
  return <div className="banner">{children}{onRetry && <button onClick={onRetry}>Reintentar</button>}</div>
}
export function Vacio({ titulo, texto, accion, onAccion }) {
  return <div className="card center"><strong>{titulo}</strong>{texto && <p>{texto}</p>}{accion && <button onClick={onAccion}>{accion}</button>}</div>
}
