import { useState, useEffect } from 'react'
import Leaf from './components/Leaf.jsx'
import { Example } from './components/Badge.jsx'
import Ayudas from './components/Ayudas.jsx'
import Empresas from './components/Empresas.jsx'
import Perfil from './components/Perfil.jsx'
import { Banner } from './components/Estado.jsx'
import Propuestas from './components/Propuestas.jsx'
import PaginaPublica from './components/PaginaPublica.jsx'

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
  const [fuenteCaida, setFuenteCaida] = useState(false)
  const [publica, setPublica] = useState(location.hash === '#/propuestas')
  useEffect(() => { const f = () => setPublica(location.hash === '#/propuestas'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  if (publica) return <PaginaPublica />
  return (
    <div className="app">
      <header>
        <span className="logo"><Leaf /><b>REFORESTA</b></span>
        <nav>
          {TABS.map(t => (
            <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
        <button className={`perfil ${tab === 'Perfil' ? 'active' : ''}`} onClick={() => setTab('Perfil')}>Perfil</button>
      </header>
      <main>
        {fuenteCaida && <Banner onRetry={() => setFuenteCaida(false)}>La BDNS no responde. Datos de la última actualización: ayer a las 07:00.</Banner>}
        {tab === 'Ayudas' ? <Ayudas /> : tab === 'Empresas' ? <Empresas /> : tab === 'Propuestas' ? <Propuestas /> : tab === 'Perfil' ? <Perfil /> : <Section title={tab} question={QUESTIONS[tab]} />}
      </main>
    </div>
  )
}
