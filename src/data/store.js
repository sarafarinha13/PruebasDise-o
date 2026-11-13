// Almacén sencillo en localStorage (compartido entre vista del equipo y página pública, mismo navegador).
const KEY = 'reforesta-propuestas-v1'
const INICIAL = {
  propuestas: [
    { id: 1, titulo: 'Plantación de 1 ha', zona: 'Sierra de Guadarrama', incluye: 'Plantas, plantación y seguimiento', plazas: 3, estado: 'publicada' },
    { id: 2, titulo: 'Restauración de ribera', zona: 'Río Tajo', incluye: 'Plantación y mantenimiento', plazas: 0, estado: 'reservada' },
    { id: 3, titulo: 'Jornada de voluntariado', zona: 'Borrador', incluye: 'Para equipos · plantación guiada', plazas: 5, estado: 'borrador' },
  ],
  reservas: [
    { id: 1, propuestaId: 1, empresa: '[Empresa]', contacto: 'Persona de contacto', email: 'ejemplo@empresa.com', mensaje: 'Nos interesa para este otoño', estado: 'recibida' },
  ],
}
export function cargar() {
  try { return JSON.parse(localStorage.getItem(KEY)) || INICIAL } catch { return INICIAL }
}
export function guardar(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* sin almacenamiento */ }
}
