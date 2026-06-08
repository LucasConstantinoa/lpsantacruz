import React from 'react';
import styled from 'styled-components';

export const AppTooltip = () => {
  return (
    <StyledWrapper>
      <ul className="example-2">
        <li className="icon-content">
          <a data-social="apple" aria-label="Apple/iOS" href="https://apps.apple.com/br/app/prosul-assist%C3%AAncia/id1584967698" target="_blank" rel="noreferrer">
            <div className="filled" />
            <svg viewBox="0 0 384 512" xmlSpace="preserve" fill="currentColor">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
          </a>
          <div className="tooltip">iOS</div>
        </li>
        <li className="icon-content" style={{marginLeft: '20px'}}>
          <a data-social="android" aria-label="Android" href="https://play.google.com/store/apps/details?id=br.com.hinovamobile.prosul&hl=pt_BR&pli=1" target="_blank" rel="noreferrer">
            <div className="filled" />
            <svg viewBox="0 0 577.2 480" xmlSpace="preserve" fill="currentColor">
              <path d="M275.9 330.7H171.3V480H275.9zM433.2 163.7l33.1-57.2c1.9-3.3.7-7.5-2.5-9.4-3.3-1.9-7.5-.7-9.4 2.5l-33.6 58.1C387.6 142.1 340 132.8 288.6 132.8S189.6 142.1 156.4 157.7l-33.6-58.1c-1.9-3.3-6.1-4.4-9.4-2.5-3.3 1.9-4.4 6.1-2.5 9.4l33.1 57.2C60 212.4 0 293 0 384h577.2C577.2 293 517.2 212.4 433.2 163.7z"/>
            </svg>
          </a>
          <div className="tooltip">Android</div>
        </li>
      </ul>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .example-2 {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icon-content {
    margin: 0 10px;
    position: relative;
  }
  .icon-content .tooltip {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    padding: 6px 10px;
    border-radius: 15px;
    opacity: 0;
    visibility: hidden;
    font-size: 14px;
    transition: all 0.3s ease;
    background-color: rgba(0,0,0,0.8);
    pointer-events: none;
  }
  .icon-content:hover .tooltip {
    opacity: 1;
    visibility: visible;
    top: -45px;
  }
  
  .icon-content a {
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    border-radius: 20%;
    color: #fff;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.18),
      rgba(255, 255, 255, 0.06)
    );
    backdrop-filter: blur(14px) saturate(180%);
    -webkit-backdrop-filter: blur(14px) saturate(180%);
    transition: all 0.35s ease-in-out;
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.45),
      inset 0 -2px 6px rgba(0, 0, 0, 0.18),
      0 6px 16px rgba(0, 0, 0, 0.22);
  }

  /* Apple / iOS glass border */
  .icon-content[data-social="apple"] a {
    border: 1px solid rgba(150, 150, 150, 0.6);
    box-shadow:
      inset 0 0 6px rgba(150, 150, 150, 0.4),
      0 0 10px rgba(150, 150, 150, 0.5),
      0 6px 16px rgba(0, 0, 0, 0.25);
  }

  /* Android glass border */
  .icon-content[data-social="android"] a {
    border: 1px solid rgba(61, 220, 132, 0.6);
    box-shadow:
      inset 0 0 6px rgba(61, 220, 132, 0.4),
      0 0 10px rgba(61, 220, 132, 0.5),
      0 6px 16px rgba(0, 0, 0, 0.25);
  }

  .icon-content a::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 70%
    );
    transform: rotate(25deg) translateX(-100%);
    transition: transform 0.8s ease;
    z-index: 0;
  }

  .icon-content a:hover::before {
    transform: rotate(25deg) translateX(100%);
  }

  .icon-content a:hover {
    box-shadow: 3px 2px 45px 0px rgba(0,0,0,0.5);
    color: white;
  }
  
  .icon-content a svg {
    position: relative;
    z-index: 1;
    width: 32px;
    height: 32px;
  }
  
  .icon-content a .filled {
    position: absolute;
    top: auto;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0;
    background-color: #000;
    transition: all 0.3s ease-in-out;
    border-radius: 20%;
  }
  
  .icon-content a:hover .filled {
    height: 100%;
  }

  @keyframes premiumGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Apple - premium dark gradient */
  .icon-content a[data-social="apple"] .filled,
  .icon-content a[data-social="apple"] ~ .tooltip {
    background: linear-gradient(135deg, #1f1f1f, #333333, #555555, #2c2c2c);
    background-size: 400% 400%;
    animation: premiumGradient 6s ease infinite;
    backdrop-filter: blur(12px) saturate(200%);
    -webkit-backdrop-filter: blur(12px) saturate(200%);
    border: 1px solid rgba(150, 150, 150, 0.6);
    box-shadow:
      inset 0 0 12px rgba(150, 150, 150, 0.5),
      0 0 24px rgba(150, 150, 150, 0.7);
  }

  /* Android - premium green gradient */
  .icon-content a[data-social="android"] .filled,
  .icon-content a[data-social="android"] ~ .tooltip {
    background: linear-gradient(135deg, #0d3b1f, #1e7040, #3ddc84, #0b2e17);
    background-size: 400% 400%;
    animation: premiumGradient 6s ease infinite;
    backdrop-filter: blur(12px) saturate(200%);
    -webkit-backdrop-filter: blur(12px) saturate(200%);
    border: 1px solid rgba(61, 220, 132, 0.6);
    box-shadow:
      inset 0 0 12px rgba(61, 220, 132, 0.5),
      0 0 24px rgba(61, 220, 132, 0.7);
  }
`;
