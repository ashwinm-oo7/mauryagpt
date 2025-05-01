import React, { useState } from "react";
import "../css/Login.css"; // Make sure the path is correct
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; // Import the useAuth hook
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../css/background-remover-result.png";

const Login = () => {
  const { saveToken } = useAuth(); // use saveToken now instead of setToken
  // const { setToken } = useAuth();
  const [showPassword, setShowPassword] = useState(false); // 👈 visibility toggle

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // To handle loading state during API call
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
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

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, a digit, and a special character."
      );
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );
      console.log(res);
      // Handle response and set token
      if (res.status === 200 || res.statusText.toLowerCase() === "ok") {
        await saveToken(res.data.token);

        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else {
        setError(res.data.message || "Login failed.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.msg || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false); // Reset loading after API call
    }
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
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
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
