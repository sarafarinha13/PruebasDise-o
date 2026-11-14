// Datos de ejemplo. Sustituir por la BDNS cuando funcione la ingesta.
// veredicto: 'presenta' (merece la pena) · 'mira' (mirad antes) · 'descarta' (el radar la descarta)
// estado inicial: 'nueva' · 'presentada' · 'descartada'
export const AYUDAS = [
  {
    id: 1, titulo: 'Ayudas para la forestación de tierras no agrícolas', organismo: 'Comunidad de Madrid · Consejería de Medio Ambiente',
    bdns: '812345', veredicto: 'presenta', estado: 'nueva', hoy: 1, encaja: 'Plantación autóctona',
    motivo: 'Financia plantación con especies autóctonas en terreno forestal de Madrid.',
    cita: 'subvencionará la plantación de especies autóctonas en terrenos forestales', citaRef: 'artículo 3',
    importe: '60.000 €', cubierto: 'El 80 %', plazo: '2026-12-20', pago: null,
    requisitos: [['Entidad sin ánimo de lucro', 'ok'], ['Proyecto en la Comunidad de Madrid', 'ok'], ['Permiso del dueño del terreno', 'duda']],
    docs: [['CIF de la entidad', 'Sacado de vuestro perfil', true], ['Estatutos', 'Subidos en marzo', true], ['Certificado de Hacienda', 'Válido hasta junio', true], ['Permiso del dueño del terreno', 'Pedirlo al Ayuntamiento', false], ['Presupuesto de la plantación', 'Hay una plantilla', false]],
    consejo: 'El permiso del dueño suele tardar unas 2 semanas. Pedidlo esta semana para ir con margen.',
  },
  {
    id: 2, titulo: 'Restauración de ecosistemas forestales', organismo: 'Fundación privada (ejemplo)',
    bdns: '813002', veredicto: 'mira', estado: 'nueva', hoy: 3, encaja: 'Restaurar bosque, pero piden la mitad',
    motivo: 'Encaja con reforestar, pero piden poner la mitad del dinero.',
    cita: 'la entidad aportará al menos el 50 % del coste del proyecto', citaRef: 'base 6',
    importe: '25.000 €', cubierto: 'El 50 %', plazo: '2027-01-15', pago: 'Anticipado',
    requisitos: [['Entidad de utilidad pública', 'ok'], ['Cofinanciación del 50 %', 'duda']],
    docs: [['CIF de la entidad', 'Sacado de vuestro perfil', true], ['Estatutos', 'Subidos en marzo', true], ['Plan de cofinanciación', 'De dónde sale el 50 %', false]],
    consejo: 'Antes de presentarla, confirmad de dónde saldría la mitad que os toca poner.',
  },
  {
    id: 3, titulo: 'Arbolado autóctono en ciudad', organismo: 'Ayuntamiento (ejemplo)',
    bdns: '813410', veredicto: 'presenta', estado: 'nueva', hoy: 4, encaja: 'Arbolado autóctono municipal',
    motivo: 'Paga plantación de arbolado autóctono en parcelas municipales.',
    cita: 'plantación de arbolado de especies autóctonas en suelo municipal', citaRef: 'artículo 2',
    importe: '25.000 €', cubierto: 'El 100 %', plazo: '2027-02-04', pago: 'Tras justificar',
    requisitos: [['Entidad sin ánimo de lucro', 'ok'], ['Proyecto en el municipio', 'ok']],
    docs: [['CIF de la entidad', 'Sacado de vuestro perfil', true], ['Memoria del proyecto', 'Máximo 10 páginas', false]],
    consejo: 'Piden fotos del estado actual de la parcela: hacedlas antes de que acabe el otoño.',
  },
  {
    id: 4, titulo: 'Recuperación de zonas quemadas', organismo: 'Estatal (ejemplo)', bdns: '809877', veredicto: 'presenta',
    estado: 'presentada', paso: 2, pasos: ['Presentada', 'Concedida', 'Plantar', 'Justificar'], fecha: 'concedida el 5 nov.',
    mensaje: '¡Os la han dado! Toca plantar antes de marzo.', importe: '180.000 €', plazo: '2026-10-10',
  },
  {
    id: 5, titulo: 'Viveros forestales comunitarios', organismo: 'Diputación (ejemplo)', bdns: '807120', veredicto: 'presenta',
    estado: 'presentada', paso: 1, pasos: ['Presentada', 'Subsanar', 'Resolución', 'Justificar'], fecha: 'presentada el 20 oct.',
    mensaje: 'Os piden un documento más antes del 30 nov.', aviso: true, importe: '30.000 €', plazo: '2026-10-20',
  },
  {
    id: 6, titulo: 'Conservación de humedales', organismo: 'Ministerio · 100.000 €', bdns: '812990', veredicto: 'descarta', estado: 'descartada', por: 'radar',
    motivos: ['No es reforestación'], cita: 'actuaciones de conservación y gestión de humedales', plazo: '2026-12-01',
  },
  {
    id: 7, titulo: 'Bosques urbanos en Andalucía', organismo: 'Junta de Andalucía · 40.000 €', bdns: '812771', veredicto: 'descarta', estado: 'descartada', por: 'radar',
    motivos: ['Fuera de nuestra zona'], cita: 'proyectos ubicados en la Comunidad Autónoma de Andalucía', plazo: '2026-12-10',
  },
  {
    id: 8, titulo: 'Eficiencia energética en edificios', organismo: 'IDAE · 250.000 €', bdns: '811503', veredicto: 'descarta', estado: 'descartada', por: 'radar',
    motivos: ['No es reforestación'], cita: 'actuaciones de mejora de la envolvente térmica', plazo: '2027-03-01',
  },
  {
    id: 9, titulo: 'Huertos escolares con arbolado', organismo: 'Ministerio (ejemplo)', bdns: '813555', veredicto: 'mira', estado: 'nueva', hoy: 2,
    encaja: 'Plantar en colegios, importe pequeño', motivo: 'Es plantación, pero el importe es pequeño para el trabajo que supone.',
    cita: 'plantación de arbolado y setos en centros educativos', citaRef: 'base 2',
    importe: '8.000 €', cubierto: 'El 100 %', plazo: '2026-12-04', pago: null,
    docs: [['CIF de la entidad', 'Sacado de vuestro perfil', true], ['Carta del centro educativo', 'Firmada por la dirección', false]],
    consejo: 'Os pedirán la carta del colegio: conviene tener ya un centro con el que colaborar.',
  },
  {
    id: 10, titulo: 'Bosques de ribera en el Henares', organismo: 'Confederación Hidrográfica (ejemplo)', bdns: '813601', veredicto: 'presenta', estado: 'nueva', hoy: 5,
    encaja: 'Plantar en riberas de Madrid', motivo: 'Financia plantación de especies de ribera en el Corredor del Henares.',
    cita: 'restauración de la vegetación de ribera mediante plantación', citaRef: 'artículo 4',
    importe: '45.000 €', cubierto: 'El 90 %', plazo: '2027-01-30', pago: 'Tras justificar',
    docs: [['CIF de la entidad', 'Sacado de vuestro perfil', true], ['Estatutos', 'Subidos en marzo', true], ['Autorización de la Confederación', 'Para actuar en dominio público', false]],
    consejo: 'La autorización para actuar junto al río tarda: pedidla en cuanto decidáis presentarla.',
  },
]
