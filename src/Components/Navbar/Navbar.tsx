import React from 'react';
import { IoWalletOutline } from 'react-icons/io5';
import './Navbar.css';
import headerIcon from '../../assets/headerlogo.png';

const Navbar = () => {
  return (
    <header className="header">
      <div className="logo-section">
        <img src={headerIcon} alt="Magic Box Logo" className="header-logo" />
      </div>

      <div className="header-right">
        <button className="wallet-button">
          <IoWalletOutline className="wallet-icon" />
          <span>Connect Wallet</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
