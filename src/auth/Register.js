import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../css/background-remover-result.png";
const Register = () => {
  const [step, setStep] = useState(1); // Step 1 = form, Step 2 = OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(""); // New field
  const [msg, setMsg] = useState("");
  const [errormsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const [resendTimer, setResendTimer] = useState(0);

  const validatePassword = (password) => {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
    return re.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setOtp("");

    if (password !== confirmPassword) {
      return setMsg("Passwords do not match.");
    }

    if (!validatePassword(password)) {
      return setMsg(
        "Password must be 8+ chars, include uppercase, lowercase, number, and special char."
      );
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_URL}/api/auth/send-otp`,
        { email }
      );
      console.log("send-otp", res);
      if (res.status === 200 || res.statusText === "ok") {
        setMsg("OTP sent to your email.");
        setStep(2); // Move to OTP entry step
        setResendTimer(60); // Start 60-second countdown
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.msg || "Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpVerify = async (e) => {
    setMsg("");
    e.preventDefault();
    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_URL}/api/auth/verify-otp`,
        { email, password, otp }
      );
      console.log("verigyOtp", res);
      if (res.status === 200 || res.statusText === "ok") {
        setMsg("Registered successfully!");
        navigate("/login");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.msg || "Invalid OTP or server error.");
    } finally {
      setLoading(false);
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
      <h2>Register</h2>
      {step === 1 ? (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="text"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
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
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
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
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Sending OTP..." : "Register"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpVerify}>
          <div className="form-group">
            <label>Enter OTP sent to your email:</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              required
              onChange={(e) => setOtp(e.target.value)}
            />
            <p>
              Didn't get the OTP?{" "}
              <button
                type="button"
                disabled={resendTimer > 0 || loading}
                onClick={handleRegister}
                style={{
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  color: resendTimer > 0 ? "gray" : "blue",
                  cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </p>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Register"}
          </button>
        </form>
      )}
      {msg && (
        <p style={{ color: "green" }} className="message">
          {msg}
        </p>
      )}
      {errormsg && <p className="message">{errormsg}</p>}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
