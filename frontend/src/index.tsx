import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Projector from './Projector'
import Today from './Today'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/projector" element={<Projector />} />
        <Route path="/today" element={<Today />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
