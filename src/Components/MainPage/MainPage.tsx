import { useState, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { FiCopy, FiLock, FiCheck } from 'react-icons/fi';
import { FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import { SiCoinmarketcap } from 'react-icons/si';
import './MainPage.css';
import image from '../../assets/logo.png';
import solImage from '../../assets/Solana_logo.png';
import availableSlotIcon from '../../assets/avilableSlot.png';
import directTeamIcon from '../../assets/icon a4.png';
import totalBuySlotIcon from '../../assets/icon a5.png';
import totalDepositIcon from '../../assets/icon a6.png';
import referralRewardIcon from '../../assets/icon a7.png';
import cycleIcon from '../../assets/icon a2.png';
import cycleHeaderIcon from '../../assets/icon a8.png';
import cycleBoxIcon from '../../assets/icon a9.png';
import cycleDepositIcon from '../../assets/icon a10.png';
import cycleCalendarIcon from '../../assets/icon a11.png';
import cycleRewardIcon from '../../assets/icon a12.png';
import rewardModalIcon from '../../assets/icon a12.png';
import EditTemplateWrapper from '../EditTemplateWrapper';
import Downline from '../Downline/Downline';
import Navbar from '../Navbar/Navbar';

const MainPage = () => {
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const [showDownline, setShowDownline] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 2,
    minutes: 47,
    seconds: 51
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Follow our Twitter', status: 'Pending', completed: false },
    { id: 2, name: 'Join our Telegram', status: 'Pending', completed: false },
    { id: 3, name: 'Add to CoinMarketCap Watchlist', status: 'Pending', completed: false }
  ]);

  const tasksCompleted = tasks.filter(t => t.completed).length;

  // Sponsor address from API - using dummy data for now
  const [sponsorAddress,] = useState('2pug1d9Czm5kCoZWU4kL9BFwXfLAvx');

  // Format address to show first 5, ..., last 5
  const formatAddress = (address: string) => {
    if (!address || address.length <= 10) {
      return address;
    }
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
  };

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchSponsorAddress = async () => {
  //     try {
  //       const response = await fetch('/api/sponsor-address');
  //       const data = await response.json();
  //       setSponsorAddress(data.address);
  //     } catch (error) {
  //       console.error('Error fetching sponsor address:', error);
  //     }
  //   };
  //   fetchSponsorAddress();
  // }, []);

  // Dummy data for cycle cards - replace with API call
  const [cycleCards,] = useState([
    {
      id: 1,
      cycle: 6,
      slot: 1,
      deposited: '2.000.000',
      purchasedAt: '19/11/2025, 10:15:29',
      reward: '+10%',
      canClaim: true
    },
    {
      id: 2,
      cycle: 7,
      slot: 4,
      deposited: '2.000.000',
      purchasedAt: '25/11/2025, 11:47:33',
      reward: '+10%',
      canClaim: false
    }
  ]);

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchCycleCards = async () => {
  //     try {
  //       const response = await fetch('/api/cycles');
  //       const data = await response.json();
  //       setCycleCards(data);
  //     } catch (error) {
  //       console.error('Error fetching cycle cards:', error);
  //     }
  //   };
  //   fetchCycleCards();
  // }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(id);
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const openTask = (taskId: number) => {
    // Handle opening task links
    let url = '';
    switch (taskId) {
      case 1:
        url = 'https://x.com/summitofficial2';
        break;
      case 2:
        url = 'https://t.me/officialsummit';
        break;
      case 3:
        url = 'https://coinmarketcap.com/currencies/summit/';
        break;
      default:
        return;
    }
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      
      // Mark task as completed after opening the link
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'Completed', completed: true }
            : task
        )
      );
    }
  };

  // If Edit Template is shown, render EditTemplatePage
  if (showEditTemplate) {
    return (
      <div className="main-page">
        <div className="edit-template-wrapper">
          <button 
            className="back-to-main-button"
            onClick={() => setShowEditTemplate(false)}
          >
            ← Back to Main
          </button>
          <EditTemplateWrapper />
        </div>
      </div>
    );
  }

  // If Downline is shown, render Downline component
  if (showDownline) {
    return <Downline onBack={() => setShowDownline(false)} />;
  }

  return (
    <div className="main-page">
      {/* Background particles effect */}
      <div className="particles"></div>
      
      {/* Header */}
      <Navbar onEditTemplate={() => setShowEditTemplate(true)} />

      {/* Main Title */}
      <div className="main-title">
        <h2>&lt;&lt;&lt; My Magic Box &gt;&gt;&gt;</h2>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Left Column */}
        <div className="left-column">
          <div className="card main-overview-card">
            <div className="overview-header">
              <div className="avatar-with-dot">
                <div className="avatar">
                  <img src={image} alt="Avatar" className="logo-image" />
                  
                </div>
                 <div className="main-balance">4000000.00</div>
              </div>
              <div className="balance-section">
              
                <div className="sol-balance">
                  <img src={solImage} alt="SOL" className="sol-icon" />
                  <span>0.01770</span>
                </div>
              </div>
            </div>
            
            <div className="progress-section">
              
              <button className="cycle-wait-button">Wait for next cycle</button>
            </div>
            
            <div className="countdown-section">
              <div className="countdown-item">
                <div className="countdown-value">{String(countdown.days).padStart(2, '0')}</div>
                <div className="countdown-label">Days</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{String(countdown.hours).padStart(2, '0')}</div>
                <div className="countdown-label">Hours</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</div>
                <div className="countdown-label">Minutes</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-value">{String(countdown.seconds).padStart(2, '0')}</div>
                <div className="countdown-label">Seconds</div>
              </div>
            </div>
            
            
          </div>
            <div className="left-slot-info">
              <div className="left-slot-top">
                <div className="left-slot-card left-slot-cycle">
                  <div className="left-slot-icon-wrapper">
                    <img src={cycleIcon} alt="Cycle" className="left-slot-icon" />
                  </div>
                  <div className="left-slot-label">Cycle</div>
                  <div className="left-slot-value">7</div>
                </div>
                <div className="left-slot-card left-slot-total">
                  <div className="left-slot-icon-wrapper">
                    <img src={totalBuySlotIcon} alt="Total Slot" className="left-slot-icon" />
                  </div>
                  <div className="left-slot-label">Total Slot</div>
                  <div className="left-slot-value">963</div>
                </div>
              </div>
              <div className="left-slot-card left-slot-available">
                <div className="left-slot-icon-wrapper">
                  <img src={availableSlotIcon} alt="Available Slot" className="left-slot-icon" />
                </div>
                <div className="left-slot-label">Available Slot</div>
                <div className="left-slot-value">963</div>
              </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Sponsor Address Card */}
          <div className="sponsor-card-container">
          <div className="card sponsor-card">
            <div className="card-header-section">
              <div className="header-icon">
                <img src={image} alt="Icon" className="icon-image" />
              </div>
              <div>
                <h2 className="card-title">Sponsor Address</h2>
              </div>
            </div>
            <div className="address-field">
              <div className="address-text">{formatAddress(sponsorAddress)}</div>
              <button 
                className={`copy-icon-button ${copiedId === 'sponsor' ? 'copied' : ''}`} 
                onClick={() => copyToClipboard(sponsorAddress, 'sponsor')}
              >
                {copiedId === 'sponsor' ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
            <div className="slot-info">
              <button className="slot-button slot-cycle">Cycle <br/><span className="slot-number">7</span></button>
              <button className="slot-button slot-slot">Level 1 <br/><span className="slot-number">3%</span></button>
              <button className="slot-button slot-total">Level 2 <br/><span className="slot-number">2%</span></button>
              <button className="slot-button slot-available">
               Level 3
               <br/><span className="slot-number">2%</span>
              </button>
            </div>
          </div>

          {/* Referral Link Card */}
          <div className="card referral-card">
            <div className="card-header-section">
              <div className="header-icon">
                <img src={image} alt="Icon" className="icon-image" />
              </div>
              <div>
                <h2 className="card-title">Referral Link</h2>
              </div>
            </div>
            <div className="referral-content">
              <div className="referral-url-field">
                <div className="referral-url">https://buy.mymagicbox.io/?referral=3vzt..9W62</div>
                <button 
                  className={`copy-icon-button ${copiedId === 'referral' ? 'copied' : ''}`} 
                  onClick={() => copyToClipboard("https://buy.mymagicbox.io/?referral=3vzt..9W62", 'referral')}
                >
                  {copiedId === 'referral' ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
              {/* <div className="referral-levels">
                Level 1 → 3% | Level 2 → 2% | Level 3 → 2%
              </div> */}
            </div>
          </div>
          </div>
          {/* Statistics Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <img src={directTeamIcon} alt="Direct Team" className="stat-icon" />
              <div className="stat-label">Direct Team</div>
              <div className="stat-value">0</div>
              <button 
                className="see-downline-button"
                onClick={() => setShowDownline(true)}
              >
                See Downline
              </button>
            </div>
            <div className="stat-card">
              <img src={totalBuySlotIcon} alt="Total Buy Slot" className="stat-icon" />
              <div className="stat-label">Total Buy Slot</div>
              <div className="stat-value">4</div>
            </div>
            <div className="stat-card">
              <img src={totalDepositIcon} alt="Total Deposited" className="stat-icon" />
              <div className="stat-label">Total Deposited</div>
              <div className="stat-value">4000000</div>
            </div>
            <div className="stat-card">
              <img src={referralRewardIcon} alt="Referral Reward" className="stat-icon" />
              <div className="stat-label">Referral Reward</div>
              <div className="stat-value">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Cycle Cards */}
      <div className="cycle-section">
        {cycleCards.map((card) => (
          <div key={card.id} className="cycle-card">
            <div className="cycle-header">
              <div className="cycle-header-left">
                <img src={cycleDepositIcon} alt="Deposited" className="cycle-detail-icon-image" />
                <span className="cycle-label">Cycle {card.cycle}</span>
              </div>
              <img src={cycleHeaderIcon} alt="Cycle" className="cycle-icon-image" />
            </div>
            <div className="cycle-details">
              <div className="cycle-detail-item">
                <img src={cycleBoxIcon} alt="Box" className="cycle-icon-image" />
                <div className="cycle-detail-content">
                  <span className="detail-label">Deposited:</span>
                  <span className="detail-value">{card.deposited}</span>
                </div>
              </div>
              <div className="cycle-detail-item">
                <img src={cycleCalendarIcon} alt="Calendar" className="cycle-detail-icon-image" />
                <div className="cycle-detail-content">
                  <span className="detail-label">Purchased At:</span>
                  <span className="detail-value">{card.purchasedAt}</span>
                </div>
              </div>
              <div className="cycle-detail-item">
                <img src={cycleRewardIcon} alt="Reward" className="cycle-detail-icon-image" />
                <div className="cycle-detail-content">
                  <span className="detail-label">Reward:</span>
                  <span className="detail-value reward-text">{card.reward}</span>
                </div>
              </div>
            </div>
            {card.canClaim && (
              <button className="claim-button" onClick={() => setIsModalOpen(true)}>CLAIM NOW</button>
            )}
          </div>
        ))}
      </div>

      {/* Reward Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <IoCloseOutline />
            </button>
            
            {/* Reward Available Card */}
            <div className="reward-header-card">
              <div className="reward-header-top">
                <div className="reward-header-icon">
                  <img src={rewardModalIcon} alt="Reward" className="reward-icon-image" />
                </div>
                <h2 className="reward-header-title">Reward Available</h2>
              </div>
              <p className="reward-header-subtitle">Complete tasks below to unlock your claim</p>
            </div>

            {/* Task Cards */}
            <div className="tasks-container">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-icon">
                    {task.id === 1 && <FaTwitter />}
                    {task.id === 2 && <FaTelegramPlane />}
                    {task.id === 3 && <SiCoinmarketcap />}
                  </div>
                  <div className="task-content">
                    <h3 className="task-title">{task.name}</h3>
                    <p className="task-status">Status: {task.status}</p>
                  </div>
                  <button 
                    className={`task-open-button ${task.completed ? 'disabled' : ''}`}
                    onClick={() => openTask(task.id)}
                    disabled={task.completed}
                  >
                    {task.completed ? 'Completed' : 'Open'}
                  </button>
                </div>
              ))}
            </div>

            {/* Progress Section */}
            <div className="progress-section-modal">
              <p className="progress-text">Tasks Completed: {tasksCompleted} / 3</p>
              <div className="progress-bar-modal">
                <div 
                  className="progress-fill-modal" 
                  style={{ width: `${(tasksCompleted / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Claim Button */}
            <button 
              className={`claim-tasks-button ${tasksCompleted === 3 ? 'enabled' : 'disabled'}`}
              disabled={tasksCompleted !== 3}
            >
              <FiLock className="lock-icon" />
              <span>Complete tasks to claim</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
