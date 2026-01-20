import React from 'react'
import './Features.css'
import IconDownload from '../assets/IconDownload.svg'
import IconLF from '../assets/IconLF.svg'
import IconShield from '../assets/IconShield.svg'
import IconFolder from '../assets/IconFolder.svg'
import IconPictures from '../assets/IconPictures.svg'
import IconStar from '../assets/IconStar.svg'

const cardsData = [
    { icon: <img src={IconDownload} alt="Bulk Download" /> , title: 'Bulk Download', description: 'Download entire Pinterest boards with thousands of images in minutes, not hours.' },
    { icon: <img src={IconLF} alt="Lightning Fast" />, title: 'Lightning Fast', description: 'Optimized download engine processes multiple images simultaneously for maximum speed.' },
    { icon: <img src={IconShield} alt="100% Safe" />, title: '100% Safe', description: "No malware, no viruses. Just clean, safe downloads from Pinterest's public content." },
    { icon: <img src={IconFolder} alt="Auto Organization" />, title: 'Auto Organization', description: 'Images are automatically organized into folders by board name and category.' },
    { icon: <img src={IconPictures} alt="High Quality" />, title: 'High Quality', description: 'Download images in their original resolution - no compression or quality loss.' },
    { icon: <img src={IconStar} alt="Premiuim Features" />, title: 'Premiuim Features', description: 'Advanced filtering, custom naming, and batch processing for power users.' },
  ];

const Features = () => {
    return (
        <div className='Features Constants no-select'>
            <div className="Feature-Main">
                <h1>Powerful Features for <span>Everyone</span></h1>
                <h2>From casual Pinterest users to content creators, we've built tools that make downloading Pinterest content effortless and efficient.</h2>
            </div>

            <div className="cards-container">
                {cardsData.map((card, index) => (
                    <div className="cards" key={index}>
                        <div className="icon no-select">{card.icon}</div>
                        <h3>{card.title}</h3>
                        <p>{card.description}</p>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default Features
