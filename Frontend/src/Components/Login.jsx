import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();  // Hook for navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("https://truthguardianbackend-r7hm.onrender.com/login", {
        email,
        password,
      });

      console.log("Login Successful:", response.data);
      localStorage.setItem("token", response.data.token); // Store token for authentication
      alert("Login successful!");

      // Redirect to home page after successful login
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400">Please sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg"
          >
            Sign In
          </button>
        </form>

        <div className="text-center text-gray-400">
          <p className="text-sm">Don't have an account?</p>
          <button
            onClick={() => navigate("/Register")}
            className="text-blue-400 hover:text-blue-500 text-sm"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
