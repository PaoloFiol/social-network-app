import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyProfile from './pages/MyProfile';
import EditProfile from './pages/EditProfile';
import FriendsList from './pages/FriendsList';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import ChatView from './pages/ChatView';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

  useEffect(() => {
    const syncLoginState = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', syncLoginState);
    return () => window.removeEventListener('storage', syncLoginState);
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" state={{ from: location }} replace />;
  };

  return (
    <div className="App">
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
        <Routes>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendsList /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:userId" element={<ProtectedRoute><ChatView /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
