import { useState } from 'react'
import { Verdict, Example } from './components/Badge.jsx'

const TABS = ['Ayudas', 'Empresas', 'Propuestas']

function Section({ title, question }) {
  return (
    <section className="card">
      <h2>{title} <Example /></h2>
      <p>{question}</p>
    </section>
  )
}

const QUESTIONS = {
  Ayudas: '¿A qué convocatorias presento solicitud?',
  Empresas: '¿A qué empresa obligada a reforestar le puedo ofrecer ejecutarlo?',
  Propuestas: '¿Qué ofrecemos y quién ha reservado?',
  Perfil: '¿Qué sabe la herramienta de nosotros?',
}

export default function App() {
  const [tab, setTab] = useState('Ayudas')
  return (
    <div className="app">
      <header>
        <strong className="logo">🌱 Radar de Reforesta</strong>
        <nav>
          {TABS.map(t => (
            <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
        <button className={tab === 'Perfil' ? 'active' : ''} onClick={() => setTab('Perfil')} aria-label="Perfil">⚙️</button>
      </header>
      <main>
        <Section title={tab} question={QUESTIONS[tab]} />
        <div className="legend">
          <Verdict kind="presenta" /> <Verdict kind="mira" /> <Verdict kind="descarta" />
          <Verdict kind="encaja" /> <Verdict kind="quiza" /> <Verdict kind="noencaja" />
          <Verdict kind="sinleer" />
        </div>
      </main>
    </div>
  )
}
