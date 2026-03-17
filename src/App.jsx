/* 主應用程式 — 組合所有頁面區塊 */
import Hero from './components/Hero'
import Screenshots from './components/Screenshots'
import Description from './components/Description'
import Installation from './components/Installation'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Hero />
      <Screenshots />
      <Description />
      <Installation />
      <Footer />
    </>
  )
}

export default App
