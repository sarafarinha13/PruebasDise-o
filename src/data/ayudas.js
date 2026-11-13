// Datos de ejemplo (S). Sustituir por BDNS en feat/datos-reales.
export const AYUDAS = [
  {
    id: 1, titulo: 'Ayudas a la forestación de tierras no agrícolas', organismo: 'Comunidad de Madrid',
    veredicto: 'presenta', estado: 'presenta',
    motivo: 'Financia plantación con especies autóctonas en la Sierra de Guadarrama.',
    cita: 'subvencionará la plantación de especies autóctonas en terrenos forestales',
    importe: '60.000 €', cubierto: '80 %', plazo: '2026-12-20', resolucion: '3 meses',
    pago: 'Tras justificar', cofinanciacion: '20 %',
    requisitos: [['Entidad sin ánimo de lucro', 'ok'], ['Proyecto en la Comunidad de Madrid', 'ok'], ['Informe de la entidad propietaria', 'duda']],
    repite: 'Convocada en 2024 y 2025',
  },
  {
    id: 2, titulo: 'Restauración de ecosistemas forestales', organismo: 'Fundación Montemadrid (ejemplo)',
    veredicto: 'mira', estado: 'mira',
    motivo: 'Encaja, pero exige cofinanciación alta.',
    cita: 'la entidad aportará al menos el 50 % del coste del proyecto',
    importe: '25.000 €', cubierto: '50 %', plazo: '2027-01-15', resolucion: '2 meses',
    pago: 'Anticipado', cofinanciacion: '50 %',
    requisitos: [['Entidad de utilidad pública', 'ok'], ['Cofinanciación del 50 %', 'duda']],
    repite: 'Sin datos de ediciones anteriores',
  },
  {
    id: 3, titulo: 'Conservación de humedales', organismo: 'Ministerio (ejemplo)',
    veredicto: 'descarta', estado: 'descarta',
    motivo: 'Es conservación de humedales, no reforestación.',
    cita: 'actuaciones de conservación y gestión de humedales',
    importe: '100.000 €', cubierto: '100 %', plazo: '2026-12-01', resolucion: '6 meses',
    pago: 'Tras justificar', cofinanciacion: 'No',
    requisitos: [['Línea de reforestación', 'no']],
    repite: 'Sin datos',
  },
]
