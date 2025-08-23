import Logo from '@/assets/crx.svg'
import { useState } from 'react'
import './App.css'

/* SOME NOTES */
/*
  - This is the component that gets showed in the small bubble in the bottom right hand corner
  - It might be a good place to keep a running list of job applications? Or stats?
*/

function App() {
  const [show, setShow] = useState(false)
  const toggle = () => setShow(!show)

  return (
    <div className="popup-container">
      {show && (
        <div className={`popup-content ${show ? 'opacity-100' : 'opacity-0'}`}>
          <h1>HELL0 CRXJS</h1>
        </div>
      )}
      <button className="toggle-button" onClick={toggle}>
        <img src={Logo} alt="CRXJS logo" className="button-icon" />
      </button>
    </div>
  )
}

export default App
