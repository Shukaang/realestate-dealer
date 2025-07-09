import React from 'react'
import Header from './Components/Hero'
import Dwell from './Components/Dwell'
import Vision from './Components/Vision'
import Experience from './Components/Experience'
import Properties from './Components/Properties'
import Testimonial from './Components/Testimonial'
import BannerAndFooter from './Components/BannerAndFooter'

const App = () => {
  return (
    <div>
      <Header/>
      <Dwell/>
      <Vision/>
      <Experience/>
      <Properties/>
      <Testimonial/>
      <BannerAndFooter/>
    </div>
  )
}

export default App