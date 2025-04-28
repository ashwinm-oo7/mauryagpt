import React, { useState } from "react";
import axios from "axios";
import "../css/Login.css"; // Ensure this file exists and has proper styles
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // To confirm password
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const validatePassword = (password) => {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
    return re.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // Simple validation
    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setMsg(
        "Password must be at least 8 characters, include uppercase, lowercase, a digit, and a special character."
      );
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_URL}/api/auth/register`,
        {
          email,
          password,
        }
      );

      setMsg(res.data.msg);
      setemail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (err) {
      setMsg(err.response?.data?.msg || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>

          <input
            type="text"
            placeholder="you@example.com"
            value={email}
            required
            onChange={(e) => setemail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <span
              className={
                showPassword
                  ? "toggle-password toggle-password-visible"
                  : "toggle-password"
              }
              onClick={() => setShowPassword(!showPassword)}
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
        <div className="password-wrapper">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            className={
              showConfirm
                ? "toggle-password toggle-password-visible"
                : "toggle-password"
            }
            onClick={() => setShowConfirm(!showConfirm)}
            role="button"
            tabIndex={0}
            aria-label="Toggle confirm password visibility"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setShowConfirm(!showConfirm);
              }
            }}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        {msg && <p className="message">{msg}</p>}
        <div>
          <p>
            Already account? <Link to="/login">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
