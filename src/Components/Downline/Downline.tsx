import React from 'react';
import './Downline.css';
import Navbar from '../Navbar/Navbar';

interface DownlineProps {
  onBack: () => void;
}

const Downline: React.FC<DownlineProps> = ({ onBack }) => {
  return (
    <div className="main-page">
      <Navbar onEditTemplate={onBack} />
      <div className="downline-container-full">
        {/* Header */}
        <div className="downline-header">
          <button 
            className="downline-back-button"
            onClick={onBack}
          >
            &lt; Go Back
          </button>
          <h1 className="downline-title">&lt;&lt;&lt; My Downline &gt;&gt;&gt;</h1>
        </div>

        {/* Filter/Input Bar */}
        <div className="downline-filter-bar">
          <input 
            type="text" 
            className="downline-filter-input"
            placeholder="Search or filter..."
          />
          <span className="downline-filter-caret">▼</span>
        </div>

        {/* Downline Data Table */}
        <div className="downline-table">
          <div className="downline-row">
            <div className="downline-cell">
              <span className="downline-label">#:</span>
              <span className="downline-value"> 1</span>
            </div>
            <div className="downline-cell">
              <span className="downline-label">Level:</span>
              <span className="downline-value"> 1</span>
            </div>
            <div className="downline-cell">
              <span className="downline-label">Address:</span>
              <span className="downline-value"> 9FQEH5HhxsxaPnxoDTgzWUUgqhZ52r9MUW4ows27LHxC</span>
            </div>
            <div className="downline-cell">
              <span className="downline-label">Sponsor:</span>
              <span className="downline-value"> DLn1kAGjrkupxYomWv7CJ7XMCTTRfSmeLrbL81UwS1E!</span>
            </div>
            <div className="downline-cell">
              <span className="downline-label">Total:</span>
              <span className="downline-value"> 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downline;

