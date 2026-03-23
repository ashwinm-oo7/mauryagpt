import React, { useEffect, useRef, useState } from "react";
import "./Profile.css";
// import axios from "axios";
import { useAuth } from "../../auth/AuthContext";
import {
  FaUserEdit,
  FaKey,
  FaTimes,
  FaGraduationCap,
  FaBriefcase,
  FaHeart,
  FaPlus,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import api from "../../auth/axiosInstance";
import { useNavigate } from "react-router-dom";
import LogoutAll from "./LogoutAll";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    education: [],
    workExperiences: [],
    hobbies: [],
  });

  const [editMode, setEditMode] = useState(false);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    otp: "",
  });
  // Education Modal
  const [showEduModal, setShowEduModal] = useState(false);
  const [editingEduIndex, setEditingEduIndex] = useState(null);
  const [eduForm, setEduForm] = useState({
    level: "",
    degree: "",
    field: "",
    institution: "",
    passingYear: "",
    score: "",
  });
  const [saving, setSaving] = useState(false);
  // OTP 6-box state
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  // Work Experience Modal
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [editingWorkIndex, setEditingWorkIndex] = useState(null);
  const [workForm, setWorkForm] = useState({
    jobTitle: "",
    company: "",
    employmentType: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: "",
    achievements: "",
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  // Hobby Input
  const [newHobby, setNewHobby] = useState("");
  const fetchedRef = useRef(false);

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");

    if (!value) {
      setOtpArray((prev) => {
        const newArr = [...prev];
        newArr[index] = "";
        return newArr;
      });
      return;
    }

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    // Move to next input
    if (index < 5) {
      otpRefs.current[index + 1].focus();
    }

    // Auto verify if filled
    if (newOtp.every((digit) => digit !== "")) {
      verifyOtp(newOtp.join(""));
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };
  const handlePasteOtp = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(paste)) return;

    const otpDigits = paste.split("");

    setOtpArray(otpDigits);

    // focus last box
    otpRefs.current[5]?.focus();

    // verify directly using pasted OTP
    setTimeout(() => {
      verifyOtp(otpDigits.join(""));
    }, 100);
  };
  // Fetch Profile
  useEffect(() => {
    if (loading || fetchedRef.current) return;

    if (!user) {
      navigate("/");
      return;
    }
    fetchedRef.current = true;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/profile/me");
        console.log("/api/profile", res);
        setProfile({
          name: res.data.name || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          education: res.data.education || [],
          workExperiences: res.data.workExperiences || [],
          hobbies: res.data.hobbies || [],
        });
      } catch (err) {
        console.error("Profile fetch failed", err);
        navigate("/");
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (step !== 2) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [step]);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const completionPercentage = () => {
    let score = 0;
    if (profile.name) score += 20;
    if (profile.phone) score += 15;
    if (profile.address) score += 15;
    if (profile.education.length > 0) score += 25;
    if (profile.workExperiences.length > 0) score += 15;
    if (profile.hobbies.length > 0) score += 10;
    return score;
  };
  // Handlers for Basic Fields
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // ==================== EDUCATION ====================
  const openEduModal = (index = null) => {
    if (!editMode) return;
    if (index !== null) {
      setEduForm(profile.education[index]);
      setEditingEduIndex(index);
    } else {
      setEduForm({
        level: "",
        degree: "",
        field: "",
        institution: "",
        passingYear: "",
        score: "",
      });
      setEditingEduIndex(null);
    }
    setShowEduModal(true);
  };

  const handleEduChange = (e) => {
    setEduForm({ ...eduForm, [e.target.name]: e.target.value });
  };

  const saveEducation = () => {
    setProfile((prev) => {
      const newEdu = [...prev.education];
      if (editingEduIndex !== null) {
        newEdu[editingEduIndex] = eduForm;
      } else {
        newEdu.push(eduForm);
      }
      return { ...prev, education: newEdu };
    });
    setShowEduModal(false);
    setEditingEduIndex(null);
  };

  const deleteEducation = (index) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // ==================== WORK EXPERIENCE ====================
  const openWorkModal = (index = null) => {
    if (!editMode) return;
    if (index !== null) {
      setWorkForm({
        ...profile.workExperiences[index],
        startDate: profile.workExperiences[index].startDate.split("T")[0],
        endDate: profile.workExperiences[index].endDate
          ? profile.workExperiences[index].endDate.split("T")[0]
          : "",
      });
      setEditingWorkIndex(index);
    } else {
      setWorkForm({
        jobTitle: "",
        company: "",
        employmentType: "",
        startDate: "",
        endDate: "",
        current: false,
        responsibilities: "",
        achievements: "",
      });
      setEditingWorkIndex(null);
    }
    setShowWorkModal(true);
  };

  const handleWorkChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWorkForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveWorkExperience = () => {
    setProfile((prev) => {
      const newWork = [...prev.workExperiences];
      const workData = {
        ...workForm,
        startDate: new Date(workForm.startDate),
        endDate: workForm.current ? "" : new Date(workForm.endDate),
      };
      if (editingWorkIndex !== null) {
        newWork[editingWorkIndex] = workData;
      } else {
        newWork.push(workData);
      }
      return { ...prev, workExperiences: newWork };
    });
    setShowWorkModal(false);
    setEditingWorkIndex(null);
  };

  const deleteWorkExperience = (index) => {
    setProfile((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index),
    }));
  };

  // ==================== HOBBIES ====================
  const addHobby = () => {
    if (newHobby.trim() && editMode) {
      setProfile((prev) => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()],
      }));
      setNewHobby("");
    }
  };

  const removeHobby = (index) => {
    setProfile((prev) => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index),
    }));
  };

  // ==================== SAVE PROFILE ====================
  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Profile Data:", profile); // Log the profile data before sending the request

      await api.put(`/api/profile`, profile);
      console.log("/api/profile/update", api);
      setEditMode(false);
      alert("Profile saved successfully! 🎉");
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  // ==================== PASSWORD HANDLERS ====================
  const sendOtp = async () => {
    setErrorMsg("");
    try {
      const res = await api.post(`/api/profile/change-password/send-otp`, {
        oldPassword: passwordData.oldPassword,
      });
      console.log("/api/profile/change-password", res);
      const expiryTime = new Date(res.data.otpExpiry).getTime();
      const secondsLeft = Math.floor((expiryTime - Date.now()) / 1000);
      clearInterval(timerRef.current);
      setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
      setStep(2);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.msg || "Failed to send OTP. Check your email.";
      setErrorMsg(msg);
    }
  };

  const verifyOtp = async (otpValue) => {
    setErrorMsg("");

    const otp = otpValue || otpArray.join("");

    if (!otp || otp.length !== 6) {
      setErrorMsg("Enter complete 6-digit OTP.");
      return;
    }

    try {
      await api.post(`/api/profile/change-password/verify`, {
        newPassword: passwordData.newPassword,
        otp: otp,
      });

      alert("Password changed successfully");

      setShowPasswordModal(false);
      setStep(1);
      setOtpArray(["", "", "", "", "", ""]);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.msg || "OTP verification failed. Try again.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>My Profile</h2>
        <p className="">
          <FaUser />
          <LogoutAll />
        </p>
        <button onClick={() => window.open(`/${profile.name}`, "_blank")}>
          View Public Profile
        </button>
        {/* PERSONAL INFO */}
        <div className="profile-field">
          <label>Name</label>
          <input
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div className="profile-field">
          <label>Email</label>
          <input value={user.email || ""} disabled />
        </div>
        <div className="profile-field">
          <label>Phone</label>
          <input
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div className="profile-field">
          <label>Address</label>
          <input
            name="address"
            value={profile.address}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        {/* EDUCATION SECTION */}
        <div className="profile-section">
          <div className="section-header">
            <h3>
              <FaGraduationCap /> Education
            </h3>
            {editMode && (
              <button className="add-btn" onClick={() => openEduModal()}>
                <FaPlus /> Add
              </button>
            )}
          </div>
          {profile.education.length === 0 ? (
            <p className="no-data">No education added yet.</p>
          ) : (
            profile.education.map((edu, i) => (
              <div key={i} className="entry-card">
                <h4>
                  {edu.degree} – {edu.institution} ({edu.passingYear})
                </h4>
                <p>
                  <strong>{edu.field}</strong> • {edu.level} • Score:{" "}
                  {edu.score}
                </p>
                {editMode && (
                  <div className="entry-actions">
                    <FaUserEdit
                      className="edit-icon"
                      onClick={() => openEduModal(i)}
                    />
                    <FaTrash
                      className="delete-icon"
                      onClick={() => deleteEducation(i)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* WORK EXPERIENCE SECTION */}
        <div className="profile-section">
          <div className="section-header">
            <h3>
              <FaBriefcase /> Work Life / Experience
            </h3>
            {editMode && (
              <button className="add-btn" onClick={() => openWorkModal()}>
                <FaPlus /> Add
              </button>
            )}
          </div>
          {profile.workExperiences.length === 0 ? (
            <p className="no-data">No work experience added yet.</p>
          ) : (
            profile.workExperiences.map((work, i) => (
              <div key={i} className="entry-card">
                <h4>
                  {work.jobTitle} at {work.company}
                </h4>
                <p>
                  {new Date(work.startDate).toLocaleDateString()} –{" "}
                  {work.current
                    ? "Present"
                    : work.endDate
                    ? new Date(work.endDate).toLocaleDateString()
                    : "N/A"}{" "}
                  • {work.employmentType}
                </p>
                <p>
                  <strong>Responsibilities:</strong> {work.responsibilities}
                </p>
                <p>
                  <strong>Achievements:</strong> {work.achievements}
                </p>
                {editMode && (
                  <div className="entry-actions">
                    <FaUserEdit
                      className="edit-icon"
                      onClick={() => openWorkModal(i)}
                    />
                    <FaTrash
                      className="delete-icon"
                      onClick={() => deleteWorkExperience(i)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* HOBBIES SECTION */}
        <div className="profile-section">
          <div className="section-header">
            <h3>
              <FaHeart /> Hobbies & Interests
            </h3>
          </div>
          <div className="hobbies-container">
            {profile.hobbies.map((hobby, i) => (
              <span key={i} className="hobby-chip">
                {hobby}
                {editMode && <FaTimes onClick={() => removeHobby(i)} />}
              </span>
            ))}
          </div>
          {editMode && (
            <div className="add-hobby">
              <input
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                placeholder="Type a hobby and press Add"
                onKeyPress={(e) => e.key === "Enter" && addHobby()}
              />
              <button onClick={addHobby}>Add Hobby</button>
            </div>
          )}
          <div className="completion-bar">
            <div className="completion-header">
              <span>Profile Completion</span>
              <span className="completion-percent">
                {completionPercentage()}%
              </span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="profile-buttons">
          {!editMode ? (
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              <FaUserEdit /> Edit Profile
            </button>
          ) : (
            <button className="save-btn" onClick={handleSave}>
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          )}
          {!editMode && (
            <button
              className="password-btn"
              onClick={() => {
                setShowPasswordModal(true);
                setErrorMsg("");
              }}
            >
              <FaKey /> Change Password
            </button>
          )}
        </div>
      </div>
      {/* EDUCATION MODAL */}
      {showEduModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editingEduIndex !== null ? "Edit" : "Add"} Education</h3>
              <FaTimes
                className="close-icon"
                onClick={() => setShowEduModal(false)}
              />
            </div>
            <input
              name="level"
              placeholder="Level (e.g. Bachelor's)"
              value={eduForm.level}
              onChange={handleEduChange}
            />
            <input
              name="degree"
              placeholder="Degree Name"
              value={eduForm.degree}
              onChange={handleEduChange}
            />
            <input
              name="field"
              placeholder="Field of Study"
              value={eduForm.field}
              onChange={handleEduChange}
            />
            <input
              name="institution"
              placeholder="Institution"
              value={eduForm.institution}
              onChange={handleEduChange}
            />
            <input
              name="passingYear"
              type="number"
              placeholder="Passing Year"
              value={eduForm.passingYear}
              onChange={handleEduChange}
              min={0}
            />
            <input
              name="score"
              placeholder="CGPA / Percentage"
              value={eduForm.score}
              onChange={handleEduChange}
            />
            <button onClick={saveEducation} className="save-btn">
              Save Education
            </button>
          </div>
        </div>
      )}
      {/* WORK EXPERIENCE MODAL */}
      {showWorkModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>
                {editingWorkIndex !== null ? "Edit" : "Add"} Work Experience
              </h3>
              <FaTimes
                className="close-icon"
                onClick={() => setShowWorkModal(false)}
              />
            </div>
            <input
              name="jobTitle"
              placeholder="Job Title"
              value={workForm.jobTitle}
              onChange={handleWorkChange}
            />
            <input
              name="company"
              placeholder="Company"
              value={workForm.company}
              onChange={handleWorkChange}
            />
            <select
              name="employmentType"
              value={workForm.employmentType}
              onChange={handleWorkChange}
            >
              <option value="">Select Employment Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
            <input
              name="startDate"
              type="date"
              placeholder="Start Date"
              value={workForm.startDate}
              onChange={handleWorkChange}
            />
            <div className="current-job">
              <input
                type="checkbox"
                name="current"
                checked={workForm.current}
                onChange={handleWorkChange}
              />
              <label>Currently working here</label>
            </div>
            {!workForm.current && (
              <input
                name="endDate"
                type="date"
                placeholder="End Date"
                value={workForm.endDate}
                onChange={handleWorkChange}
              />
            )}
            <textarea
              name="responsibilities"
              placeholder="Key Responsibilities"
              value={workForm.responsibilities}
              onChange={handleWorkChange}
            />
            <textarea
              name="achievements"
              placeholder="Achievements"
              value={workForm.achievements}
              onChange={handleWorkChange}
            />
            <button onClick={saveWorkExperience} className="save-btn">
              Save Work Experience
            </button>
          </div>
        </div>
      )}
      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Change Password</h3>
              <FaTimes
                className="close-icon"
                onClick={() => {
                  setShowPasswordModal(false);
                  setStep(1);
                  setTimeLeft(0);
                  clearInterval(timerRef.current);
                }}
              />{" "}
            </div>
            {step === 1 && (
              <>
                <input
                  type="password"
                  name="oldPassword"
                  placeholder="Old Password"
                  onChange={handlePasswordChange}
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  onChange={handlePasswordChange}
                />
                <button onClick={sendOtp}>Send OTP</button>
                {errorMsg && <p className="error-text">{errorMsg}</p>}
              </>
            )}
            {step === 2 && (
              <>
                <div className="otp-inputs" onPaste={(e) => handlePasteOtp(e)}>
                  {otpArray.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      value={digit}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="otp-input"
                      onChange={(e) => handleOtpChange(e, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      ref={(el) => (otpRefs.current[i] = el)}
                    />
                  ))}
                </div>

                <div className="otp-timer">
                  OTP expires in: <span>{formatTime(timeLeft)}</span>
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={timeLeft === 0 || otpArray.includes("")}
                >
                  Verify OTP
                </button>

                {timeLeft === 0 && (
                  <p className="otp-expired">
                    OTP expired. Please request a new one.
                  </p>
                )}

                {errorMsg && <p className="error-text">{errorMsg}</p>}

                {timeLeft === 0 && (
                  <button className="resend-btn" onClick={sendOtp}>
                    Resend OTP
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
