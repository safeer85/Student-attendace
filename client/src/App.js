import './App.css';
import LoginPage from './pages/Login/LoginPage.tsx';
import {  Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/Register/RegisterPage.tsx';
import HomePage from './pages/Home/home.tsx';


function App() {
  return (
    <Routes>
        
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        
      </Routes>
  );
}

export default App;
