import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import db from "../utils/cocbase";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white/80">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 p-8 rounded-xl shadow-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded mb-4"
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
          className="w-full text-blue-600 underline"
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
