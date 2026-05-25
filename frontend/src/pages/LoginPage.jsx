import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";
import { clearGuestCart, getGuestCart } from "../utils/guestCart.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [resetForm, setResetForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));
  const shouldResumeCheckout = searchParams.get("checkout") === "1";

  const postLoginPath = useMemo(() => {
    const nextParams = new URLSearchParams();
    if (shouldResumeCheckout) {
      nextParams.set("checkout", "1");
    }
    const query = nextParams.toString();
    return query ? `${redirectPath}?${query}` : redirectPath;
  }, [redirectPath, shouldResumeCheckout]);

  useEffect(() => {
    if (isAuthenticated && !loading && !error) {
      navigate(postLoginPath, { replace: true });
    }
  }, [isAuthenticated, loading, error, navigate, postLoginPath]);

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoading(true);
    clearFeedback();

    try {
      const response = await api.post("/auth/login", loginForm);
      login(response.data);
      await mergeGuestCart();
      setMessage(response.data.message || "Login successful");
      navigate(postLoginPath, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  async function mergeGuestCart() {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) {
      return;
    }

    await Promise.all(
      guestCart.map((item) =>
        api.post("/cart/add", {
          productId: item.productId,
          quantity: item.quantity,
        }),
      ),
    );
    clearGuestCart();
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setLoading(true);
    clearFeedback();

    try {
      const response = await api.post("/auth/register", registerForm);
      setMessage(response.data || "Registration successful. Please sign in.");
      setIsRegisterMode(false);
      setShowResetForm(false);
      setLoginForm({
        email: registerForm.email,
        password: registerForm.password,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPasswordSubmit(event) {
    event.preventDefault();
    setLoading(true);
    clearFeedback();

    if (
      !resetForm.email.trim() ||
      !resetForm.newPassword.trim() ||
      !resetForm.confirmPassword.trim()
    ) {
      setError("Please fill all reset password fields");
      setLoading(false);
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/reset-password", resetForm);
      setMessage(response.data || "Password reset successful");
      setShowResetForm(false);
      setLoginForm((prev) => ({
        ...prev,
        email: resetForm.email,
      }));
      setResetForm({ email: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(getApiErrorMessage(err, "Password reset failed"));
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
              setShowResetForm(false);
              clearFeedback();
            }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={isRegisterMode ? "active" : ""}
            onClick={() => {
              setIsRegisterMode(true);
              setShowResetForm(false);
              clearFeedback();
            }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {!isRegisterMode && !showResetForm && (
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
            <div className="password-row">
              <input
                required
                type={showLoginPassword ? "text" : "password"}
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowLoginPassword((prev) => !prev)}
              >
                {showLoginPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              className="linkish-btn"
              onClick={() => {
                setShowResetForm(true);
                clearFeedback();
                setResetForm((prev) => ({
                  ...prev,
                  email: loginForm.email,
                }));
              }}
            >
              Forgot password?
            </button>
          </form>
        )}

        {!isRegisterMode && showResetForm && (
          <form onSubmit={handleResetPasswordSubmit} className="form">
            <label>Email</label>
            <input
              required
              type="email"
              value={resetForm.email}
              onChange={(event) =>
                setResetForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="Enter your registered email"
            />

            <label>New Password</label>
            <div className="password-row">
              <input
                required
                type={showResetNewPassword ? "text" : "password"}
                value={resetForm.newPassword}
                onChange={(event) =>
                  setResetForm((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowResetNewPassword((prev) => !prev)}
              >
                {showResetNewPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label>Confirm New Password</label>
            <div className="password-row">
              <input
                required
                type={showResetConfirmPassword ? "text" : "password"}
                value={resetForm.confirmPassword}
                onChange={(event) =>
                  setResetForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowResetConfirmPassword((prev) => !prev)}
              >
                {showResetConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowResetForm(false);
                clearFeedback();
              }}
            >
              Back to Sign In
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
            <div className="password-row">
              <input
                required
                type={showSignupPassword ? "text" : "password"}
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Create a password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowSignupPassword((prev) => !prev)}
              >
                {showSignupPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label>Confirm Password</label>
            <div className="password-row">
              <input
                required
                type={showSignupConfirmPassword ? "text" : "password"}
                value={registerForm.confirmPassword}
                onChange={(event) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowSignupConfirmPassword((prev) => !prev)}
              >
                {showSignupConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

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

function getSafeRedirectPath(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/products";
  }
  return value;
}
