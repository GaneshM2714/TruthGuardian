import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Check if the token exists in localStorage

  useEffect(() => {
    if (!token) {
      // If there's no token, redirect to login page after mount
      navigate('/Login');
    }
  }, [token, navigate]);

  if (!token) {
    // Render nothing or a loading state while redirecting
    return null;
  }

  return element; // If the token exists, render the protected route element
};

export default ProtectedRoute;
