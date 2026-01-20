import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import SearchBar from './SearchBar.jsx'
import Cd from '../assets/cd.png'
import CdpinBaseLeft from '../assets/cdpinbaseleft.png'
import CdpinLeft from '../assets/cdpinleft.png'
import Pictures from './Pictures.jsx'
import LogoMonster from '../assets/LogoMonster.png' 

const Home = () => {
  return (
    <div className='Home Constants no-select'>
        <div className='Hero-text'>
        <div>

        <h1 className='MainText'>Pinterest Board Downloader Online</h1>
        <h2 className='Tagline'>No apps, no accounts, no drama — just click stuff and take it like it’s yours</h2>

        <div className='SearchBarDiv'> <SearchBar /> </div>
        </div>

        </div>

        <div className='Pictures-div'> <Pictures /> </div>

        <div className="Vinyl no-select">
          <img src={CdpinBaseLeft} alt="cdpin" className='Cdpinbase' />
          <img src={CdpinLeft} alt="cdpin" className='Cdpin' />
          <img src={Cd} alt="cd" className='Cd' />
        </div>


        <div className="Secondary-Text">
          <h4>Your Bookmarks, Your Backup</h4>
          <p> Tired of losing track of saved links on Pinboard?</p>
          <p> Easily download and archive all your bookmarks, in just a click.</p>
        </div>


    

    </div>
  )
}

export default Home
