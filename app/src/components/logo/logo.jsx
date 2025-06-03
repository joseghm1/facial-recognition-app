import React from "react";
import Tilt from 'react-parallax-tilt';
import './logo.css';
import Brain from './brain.png';

const Logo = () => {
  return (
    <div className="ma4 mt0 w-10">    
      <Tilt className="ba" style={{
        borderRadius: '10px',
        background: 'linear-gradient(to right top, #1d6ce2, #4e64ec, #7758f2, #9e43f1, #c312eb)'
      }}>
        <div className="Tilt-inner pa3">
          <img src={Brain} alt="Logo" />
        </div>
      </Tilt>
    </div>
  );
}

export default Logo;
