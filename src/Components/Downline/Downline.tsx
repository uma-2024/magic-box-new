import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Downline.css';
import Navbar from '../Navbar/Navbar';

interface DownlineItem {
  id: number;
  level: number;
  address: string;
  sponsor: string;
  total: number;
}

const Downline: React.FC = () => {
  const navigate = useNavigate();
  const [downlineData, setDownlineData] = useState<DownlineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Dummy API data
    setTimeout(() => {
      setDownlineData([
        {
          id: 1,
          level: 1,
          address: '9FQEH5HhxsxaPnxoDTgzWUUgqhZ52r9MUW4ows27LHxC',
          sponsor: 'DLn1kAGjrkupxYomWv7CJ7XMCTTRfSmeLrbL81UwS1E',
          total: 0
        },
        {
          id: 2,
          level: 2,
          address: '3kP1XsZz8Zg6U2RT9kV8HJq3M2AxQZJm93d7RkQhS8A',
          sponsor: '9FQEH5HhxsxaPnxoDTgzWUUgqhZ52r9MUW4ows27LHxC',
          total: 200000
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="main-page">
      <Navbar />

      <div className="downline-container-full">
        <div className="downline-header">
          <button
            className="downline-back-button"
            onClick={() => navigate('/')}
          >
            &lt; Go Back
          </button>

          <h1 className="downline-title">
            &lt;&lt;&lt; My Downline &gt;&gt;&gt;
          </h1>
        </div>

        <div className="downline-filter-bar">
          <input
            type="text"
            className="downline-filter-input"
            placeholder="Search or filter..."
          />
        </div>

        <div className="downline-table">
          {loading ? (
            <div className="downline-loading">Loading downline...</div>
          ) : (
            downlineData.map((item) => (
              <div key={item.id} className="downline-row">
                <div className="downline-cell">#{item.id}</div>
                <div className="downline-cell">Level {item.level}</div>
                <div className="downline-cell">{item.address}</div>
                <div className="downline-cell">{item.sponsor}</div>
                <div className="downline-cell">{item.total}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Downline;
