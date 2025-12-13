import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './Components/MainPage/MainPage';
import Downline from './Components/Downline/Downline';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/downline" element={<Downline />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
