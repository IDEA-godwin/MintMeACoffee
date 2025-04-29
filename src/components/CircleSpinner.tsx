"use client";

import React from "react";
import styled from "styled-components";

const CircleSpinner = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <span />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loader {
    position: relative;
    width: 75px;
    height: 75px;
    background: transparent;
    border-radius: 50%;
    box-shadow: 10px 10px 25px rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .loader::before {
    content: "";
    position: absolute;
    inset: 7px;
    background: transparent;
    border-radius: 50%;
    box-shadow: inset -5px -5px 25px rgba(0, 0, 0, 0.25),
      inset 5px 5px 35px rgba(0, 0, 0, 0.25);
  }

  .loader::after {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    box-shadow: inset -5px -5px 25px rgba(0, 0, 0, 0.25),
      inset 5px 5px 35px rgba(0, 0, 0, 0.25);
  }

  .loader span {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50%;
    height: 100%;
    background: transparent;
    transform-origin: top left;
    animation: radar81 2s linear infinite;
  }

  .loader span::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: seagreen;
    transform-origin: top left;
    transform: rotate(-55deg);
    filter: blur(30px) drop-shadow(20px 20px 20px seagreen);
  }

  @keyframes radar81 {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`;

export default CircleSpinner;
