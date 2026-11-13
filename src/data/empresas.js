// Datos de ejemplo (S). Sustituir por DIA reales del BOE en feat/datos-reales.
export const EMPRESAS = [
  { id: 1, promotor: '[Promotor]', proyecto: 'Parque solar', provincia: 'Madrid', ha: '12 ha', plazo: '2 años', importe: 'No indicado',
    veredicto: 'encaja', contacto: 'sin contactar', rsc: false,
    medida: 'Debe plantar especies autóctonas como medida compensatoria. Puedes ofrecerle ejecutarlo.',
    cita: '…se realizará una plantación de especies autóctonas en…', nota: '' },
  { id: 2, promotor: '[Promotor]', proyecto: 'Línea eléctrica', provincia: 'Toledo', ha: 'No indicado', plazo: '1 año', importe: 'No indicado',
    veredicto: 'quiza', contacto: 'contactada', rsc: false,
    medida: 'Medidas de revegetación en la traza de la línea.',
    cita: '…medidas de revegetación en las zonas afectadas…', nota: '' },
  { id: 3, promotor: '[Promotor]', proyecto: 'Planta industrial', provincia: 'Madrid', ha: 'No indicado', plazo: 'No indicado', importe: 'No indicado',
    veredicto: 'noencaja', contacto: 'sin contactar', rsc: false,
    medida: 'Gestión de hábitat, no reforestación.',
    cita: '…gestión del hábitat de aves esteparias…', nota: '' },
  { id: 4, promotor: '[Fundación empresa]', proyecto: 'Programa voluntario RSC', provincia: 'Madrid', ha: '—', plazo: '—', importe: 'No indicado',
    veredicto: 'quiza', contacto: 'sin contactar', rsc: true,
    medida: 'Programa voluntario de reforestación con empleados.',
    cita: '…jornadas de voluntariado ambiental…', nota: '' },
]
