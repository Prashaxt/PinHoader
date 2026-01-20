import React, { useRef, useState, useEffect } from 'react'
import Header from './components/Header'
import Home from './components/Home'
import Features from './components/Features'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'
import HowTo from './components/HowToUse'

const Layout = () => {
  const homeRef = useRef(null)
  const howtoRef = useRef(null)
  const featuresRef = useRef(null)
  const pricingRef = useRef(null)

  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3

      if (pricingRef.current && scrollPos >= pricingRef.current.offsetTop) {
        setActiveSection('pricing')
      } else if (featuresRef.current && scrollPos >= featuresRef.current.offsetTop) {
        setActiveSection('features')
      } else if (howtoRef.current && scrollPos >= howtoRef.current.offsetTop) {
        setActiveSection('howto')
      } else {
        setActiveSection('home')
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Header activeSection={activeSection} />
      {/* <Outlet /> */}
      <div ref={homeRef} id="home"><Home /></div>
      <div ref={featuresRef} id="features"><Features /></div>
      <div ref={howtoRef} id="howto"><HowTo /></div>
      {/* <div ref={pricingRef} id="pricing"><Pricing /></div> */}
      <Footer />
    </>
  )
}

export default Layout
