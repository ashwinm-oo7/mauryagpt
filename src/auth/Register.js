import React, { useState } from "react";
import axios from "axios";
import "../css/Register.css"; // Ensure this file exists and has proper styles

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // To confirm password
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
      });
      setMsg(res.data.msg);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMsg(err.response?.data?.msg || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          required
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        {msg && <p className="message">{msg}</p>}
      </form>
    </div>
  );
};

export default Register;
