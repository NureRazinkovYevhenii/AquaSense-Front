import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import './App.css';
import './i18n';
import UserDashboard from './pages/User/Dashboard';
import AquariumDetails from './pages/User/AquariumDetails';
import CreateAquarium from './pages/User/CreateAquarium';
import History from './pages/User/History';
import { SignalRProvider } from './SignalRContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'admin');

  useEffect(() => {
    if (isLoggedIn) {
      setIsAdmin(localStorage.getItem('role') === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAdmin(localStorage.getItem('role') === 'admin');
  };

  return (
    <SignalRProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />
          <Route 
            path="/admin/*" 
            element={isLoggedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/user" element={isLoggedIn && !isAdmin ? <UserDashboard /> : <Navigate to="/login" />} />
          <Route path="/user/aquarium/:id" element={isLoggedIn && !isAdmin ? <AquariumDetails /> : <Navigate to="/login" />} />
          <Route path="/user/create" element={isLoggedIn && !isAdmin ? <CreateAquarium /> : <Navigate to="/login" />} />
          <Route path="/user/history/:id" element={isLoggedIn && !isAdmin ? <History /> : <Navigate to="/login" />} />
          <Route 
            path="/" 
            element={
              isLoggedIn 
                ? (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/user" />)
                : <Navigate to="/login" />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </SignalRProvider>
  );
}

export default App;