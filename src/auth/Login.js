import React, { useState } from "react";
import "../css/Login.css"; // Make sure the path is correct
// import axios from "axios";a
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; // Import the useAuth hook
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../css/background-remover-result.png";
import axios from "axios";

const Login = () => {
  const { login } = useAuth(); // use saveToken now instead of setToken
  // const { setToken } = useAuth();
  const [showPassword, setShowPassword] = useState(false); // 👈 visibility toggle

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // To handle loading state during API call
  const navigate = useNavigate();

  const validateIdentifier = (value) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    // Telegram username: @username OR numeric chat ID
    const telegramRegex = /^(@[a-zA-Z0-9_]{5,}|[0-9]{6,})$/;

    return emailRegex.test(value) || telegramRegex.test(value);
  };
  const validatePassword = (password) => {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
    return re.test(password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (!validateIdentifier(email)) {
      setError("Enter valid Email or Telegram ID (@username or chat ID)");
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, a digit, and a special character.",
      );
      setLoading(false);
      return;
    }

    try {
      await login(email, password); // cookie used automatically
      navigate("/"); // redirect after login
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false); // Reset loading after API call
    }
  };
  const handleTelegramLogin = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_URL}/api/auth/telegram-login-token`,
    );

    const { token, botLink } = res.data;

    // open Telegram bot
    window.open(botLink, "_blank");

    // poll for verification
    const interval = setInterval(async () => {
      try {
        const verify = await axios.post(
          `${process.env.REACT_APP_URL}/api/auth/telegram-login-verify`,
          { token },
        );

        if (verify.data.accessToken) {
          clearInterval(interval);

          // save token
          localStorage.setItem("token", verify.data.accessToken);

          window.location.href = "/";
        }
      } catch (err) {
        // still waiting
      }
    }, 2000);
  };
  return (
    <div className="login-container">
      <h2>
        <a
          href={process.env.DeployLink || "/"}
          style={{ display: "" }}
          title={process.env.REACT_APP_DeployLink}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "70px",
              height: "70px",
              objectFit: "contain",
              cursor: "pointer",
            }}
          />
        </a>
      </h2>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="login-form-group">
          <label>Email:</label>
          <input
            type="text"
            placeholder="Enter Email or Telegram ID (@username)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="login-form-group">
          <label>Password:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className={
                showPassword
                  ? "toggle-password toggle-password-visible"
                  : "toggle-password"
              }
              role="button"
              tabIndex={0}
              aria-label="Toggle password visibility"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setShowPassword(!showPassword);
                }
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <button onClick={handleTelegramLogin}>Login with Telegram 🚀</button>
        {error && <div className="error">{error}</div>}
      </form>

      <div>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
