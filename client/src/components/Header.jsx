import React, { useState, useEffect, useRef } from 'react'
import { HashLink as Link } from 'react-router-hash-link'
import './Header.css'
import Logo from './Logo.jsx'

const Header = ({ activeSection }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const handleLinkClick = () => {
    setMenuOpen(false)
  }

  // Close menu if click outside menu or hamburger button
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <header>
      <div className='Header Constants'>
        < Logo />

        {/* Hamburger Button */}
        <button
          ref={buttonRef}
          className='hamburger no-select'
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
        </button>

        {/* Navigation Links */}
        <div ref={menuRef} className={`nav-links ${menuOpen ? 'open' : 'close'}`}>
          <Link to="#home" className={activeSection === 'home' ? 'active' : ''} onClick={handleLinkClick}>Home</Link>
          <Link to="#features" className={activeSection === 'features' ? 'active' : ''} onClick={handleLinkClick}>Features</Link>
          <Link to="#howto" className={activeSection === 'howto' ? 'active' : ''} onClick={handleLinkClick}>How to Use</Link>
          {/* <Link to="#pricing" className={activeSection === 'pricing' ? 'active' : ''} onClick={handleLinkClick}>Pricing</Link> */}
          <button className='coffee no-select'>Buy me a coffee</button>
        </div>
      </div>
    </header>
  )
}

export default Header
