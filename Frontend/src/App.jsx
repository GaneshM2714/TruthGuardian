import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InputPage from './Components/InputPage';
import OutputPage from './Components/OutputPage';
import Trending from './Components/trending';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';
import ProtectedRoute from './Components/ProtectedRoute';  // Import ProtectedRoute

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/Register' element={<Register />} />
        <Route path='/Login' element={<Login />} />
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/InputPage" element={<ProtectedRoute element={<InputPage />} />} />
        <Route path="/OutputPage" element={<ProtectedRoute element={<OutputPage />} />} />
        <Route path="/Trending" element={<ProtectedRoute element={<Trending />} />} />
      </Routes>
    </Router>
  );
}

export default App;
