import React from 'react'
import  './HowtoUse.css'
import Tick from '../assets/IconTick.svg'
import DownloadButtonImage from '../assets/DownloadButtonImg.png'
import SearchbarImg from '../assets/SearchbarImg.png'

const HowToUse = () => {
    return (
        <div className='How Constants no-select'>
            <h2>How to Use <span>Pinhoader</span></h2>
            <div>
                <div>
                    <div className='HowToImg step1'><img src={SearchbarImg} alt="" className='step1img'/></div>
                    {/* <div className='HowToImg'></div> */}
                    <h4>Step 1</h4>
                    <p>Paste the Pinterest board URL into the search bar and hit Search.</p>
                </div>
                <div>
                    <div className='HowToImg step2'><img src={DownloadButtonImage} alt="" className='step2img' /></div>
                    {/* <div className='HowToImg'></div> */}
                    <h4>Step 2</h4>
                    <p>Take a quick look at your board details.Then just click Start Download.</p>
                </div>
                <div>
                    <div className='HowToImg step3'><img src={Tick} alt="" className='step3img' /></div>
                    {/* <div className='HowToImg'></div> */}
                    <h4>Step 3</h4>
                    <p>Sit back and relax — your images and videos will be downloaded in no time!</p>
                </div>
            </div>
        </div>
    )
}

export default HowToUse
