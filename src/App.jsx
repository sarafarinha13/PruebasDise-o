import { useState, useEffect } from 'react'
import IslaApp from './isla/IslaApp.jsx'
import Publica from './isla/Publica.jsx'

export default function App() {
  const [publica, setPublica] = useState(location.hash === '#/propuestas')
  useEffect(() => { const f = () => setPublica(location.hash === '#/propuestas'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return publica ? <Publica /> : <IslaApp />
}
