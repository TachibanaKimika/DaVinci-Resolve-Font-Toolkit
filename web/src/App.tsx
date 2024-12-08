import React, { useCallback, useEffect } from 'react'
import { getFonts } from './apis'
import FontList from './components/FontList'
import Topbar from './components/Topbar'
import { apiStatus } from './base'
import Footer from './components/Footer'

export default function App() {

  useEffect(() => {
    apiStatus.reload();
  }, [])

  return (
    <div className="wrap">
      <Topbar />
      <FontList />
      <Footer />
    </div>
  )
}
