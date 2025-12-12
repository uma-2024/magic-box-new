import React from 'react';
import { IoWalletOutline } from 'react-icons/io5';
import './Navbar.css';
import headerIcon from '../../assets/headerlogo.png';

interface NavbarProps {
  onEditTemplate: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onEditTemplate }) => {
  return (
    <header className="header">
      <div className="logo-section">
        <img src={headerIcon} alt="Magic Box Logo" className="header-logo" />
      </div>
      <div className="header-right">
        {/* <button 
          className="edit-template-button"
          onClick={onEditTemplate}
        >
          Edit Template
        </button> */}
        <button className="wallet-button">
          <IoWalletOutline className="wallet-icon" />
          <span>Connect Wallet</span>
        </button>
        {/* <button className="icon-button">
          <IoSettingsOutline />
        </button>
        <button className="icon-button">
          <IoNotificationsOutline />
        </button> */}
      </div>
    </header>
  );
};

export default Navbar;

