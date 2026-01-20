import React from 'react'
import { Link } from 'react-router-dom'
import './Logo.css'
import LogoMonster from '../assets/LogoMonster.png'
import Icon from '../assets/Icon.png'
const Logo = () => {
    return (
        <Link to="/"  className='Logo no-select'>
            <img src={Icon} alt="" />
            <div>PinHoader</div>
        </Link>
    )
}

export default Logo
