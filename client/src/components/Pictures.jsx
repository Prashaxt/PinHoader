import React, { useEffect, useState } from "react";
import './Pictures.css'


export default function Pictures() {
  
  return (

     <div className="Pictures fadeInScale-animation no-select">
          <div className="ImageWrapper Image1"><img src="https://picsum.photos/1080/2440" alt="Image1" /></div>
          <div className="ImageWrapper Image2"><img src="https://picsum.photos/120/153" alt="Image2" /></div>
          <div className="ImageWrapper Image3"><img src="https://picsum.photos/240/305" alt="Image3" /></div>
          <div className="ImageWrapper Image4"><img src="https://picsum.photos/480/610" alt="image4" /></div>
          <div className="ImageWrapper Image5"><img src="https://picsum.photos/960/1220" alt="image5" /></div>
    </div> 
  );
}
