import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/products");
    }
  }, [isAuthenticated, navigate]);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/login", loginForm);
      login(response.data);
      setMessage(response.data.message || "Login successful");
      navigate("/products");
    } catch (err) {
      setError(err.response?.data || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/register", registerForm);
      setMessage(response.data || "Registration successful. Please sign in.");
      setIsRegisterMode(false);
      setLoginForm({
        email: registerForm.email,
        password: registerForm.password,
      });
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>{isRegisterMode ? "Create Account" : "Sign In"}</h1>

        <div className="auth-toggle">
          <button
            className={!isRegisterMode ? "active" : ""}
            onClick={() => {
              setIsRegisterMode(false);
              setMessage("");
              setError("");
            }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={isRegisterMode ? "active" : ""}
            onClick={() => {
              setIsRegisterMode(true);
              setMessage("");
              setError("");
            }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {!isRegisterMode && (
          <form onSubmit={handleLoginSubmit} className="form">
            <label>Email</label>
            <input
              required
              type="email"
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="Enter your email"
            />

            <label>Password</label>
            <input
              required
              type="password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="Enter your password"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {isRegisterMode && (
          <form onSubmit={handleRegisterSubmit} className="form">
            <label>Name</label>
            <input
              required
              type="text"
              value={registerForm.name}
              onChange={(event) =>
                setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Enter your name"
            />

            <label>Email</label>
            <input
              required
              type="email"
              value={registerForm.email}
              onChange={(event) =>
                setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="Enter your email"
            />

            <label>Password</label>
            <input
              required
              type="password"
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="Create a password"
            />

            <label>Confirm Password</label>
            <input
              required
              type="password"
              value={registerForm.confirmPassword}
              onChange={(event) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
              placeholder="Confirm your password"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        )}

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
