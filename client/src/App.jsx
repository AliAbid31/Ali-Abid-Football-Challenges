import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Goals from './pages/goals.jsx';
import Assists from './pages/Assists.jsx';
import Trophies from './pages/Trophies.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/goals-challenge" element={<Goals />} />
      <Route path="/assists-challenge" element={<Assists />} />
      <Route path="/trophies-challenge" element={<Trophies />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
