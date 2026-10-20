import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Calculator from './pages/Calculator'
import Calendar from './pages/Calendar'
import Equation from './pages/Equation'
import Letterology from './pages/Letterology'
import Wiki from './pages/Wiki'
import Settings from './pages/Settings'
import { SettingsProvider } from './context/SettingsContext'

function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Calculator />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="equation" element={<Equation />} />
          <Route path="letterology" element={<Letterology />} />
          <Route path="wiki" element={<Wiki />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </SettingsProvider>
  )
}

export default App
