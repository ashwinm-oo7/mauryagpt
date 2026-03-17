import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Chats from "../components/Chats";
import Login from "../auth/Login";
import Register from "../auth/Register";
import Profile from "../components/Profile/Profile";
import ERPKnowledgeSearch from "../components/ERPKnowledgeSearch/ERPKnowledgeSearch";
import AIChat from "../components/AIChat/AIChat";
import AdminMcq from "../components/mcq/AdminMcq";
import UserDashboard from "../components/user/UserDashboard";
import LevelSelector from "../components/user/LevelSelector";
import TestPage from "../components/user/TestPage";
import ResultPage from "../components/user/ResultPage";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AuthRoute from "./AuthRoute";
import AdminDashboard from "./AdminDashboard";
import AdminAttemptViewer from "../components/mcq/AdminAttemptViewer";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Chats />} />
      <Route path="/knowledge" element={<ERPKnowledgeSearch />} />
      <Route path="/SabReport" element={<AIChat />} />

      {/* Auth routes */}
      <Route element={<AuthRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/UserDashboard" element={<UserDashboard />} />
        <Route path="/user/levels/:domain" element={<LevelSelector />} />
        <Route path="/user/test/:domain/:level" element={<TestPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/mcq" element={<AdminMcq />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/exam/:examId" element={<AdminAttemptViewer />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;
