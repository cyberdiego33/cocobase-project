import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import db from "../utils/cocbase";

/**
 * Authentication component handling both login and registration.
 * Toggles between login/register forms and redirects to private journal on success.
 */
export default function Auth() {
  // Form state management
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles form submission for both login and registration.
   * Redirects to /my-journal on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Use appropriate auth method based on form mode
      if (isLogin) {
        await db.login(username, password);
      } else {
        await db.register(username, password);
      }
      navigate("/my-journal");
    } catch (err) {
      alert("Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Render authentication form with gradient styling
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-xl w-full max-w-sm border border-white/30"
      >
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl mb-4 font-semibold shadow hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          disabled={submitting}
        >
          {submitting
            ? "Please wait..."
            : isLogin
            ? "Sign In"
            : "Create Account"}
        </button>
        <button
          type="button"
          className="w-full text-purple-600 underline hover:text-pink-600 transition-all duration-200"
          onClick={() => setIsLogin((l) => !l)}
        >
          {isLogin
            ? "Don't have an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
