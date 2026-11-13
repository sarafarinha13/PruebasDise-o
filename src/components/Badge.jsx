// Semáforos: veredicto de ayudas, encaje de empresas y estado de lectura.
const TONES = {
  presenta: ['Presenta', 'green'],
  mira: ['Mira', 'amber'],
  descarta: ['Descarta', 'red'],
  encaja: ['Encaja', 'green'],
  quiza: ['Quizá', 'amber'],
  noencaja: ['No encaja', 'red'],
  sinleer: ['Sin leer', 'gray'],
}

export function Verdict({ kind }) {
  const [label, tone] = TONES[kind]
  return <span className={`badge ${tone}`}>{label}</span>
}

// Marca los datos de ejemplo para no confundirlos con datos reales.
export function Example() {
  return <span className="badge example">ejemplo</span>
}
