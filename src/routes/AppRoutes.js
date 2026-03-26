import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Chats from "../components/Chats";
import Login from "../auth/Login";
import Register from "../auth/Register";
import Profile from "../components/Profile/Profile";
import ERPKnowledgeSearch from "../components/ERPKnowledgeSearch/ERPKnowledgeSearch";
import AIChat from "../components/AIChat/AIChat";
import AdminMcq from "../components/mcq/AdminMcq";
import DomainList from "../components/user/DomainList";
import LevelSelector from "../components/user/LevelSelector";
import TestPage from "../components/user/TestPage";
import ResultPage from "../components/user/ResultPage";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AuthRoute from "./AuthRoute";
// import AdminDashboard from "./AdminDashboard";
import AdminAttemptViewer from "../components/mcq/AdminAttemptViewer";
import AdminDashboardChart from "../components/mcq/AdminDashboardChart";
import AdminLayout from "../components/mcq/AdminLayout";
import AdminExamAnalytics from "../components/mcq/AdminExamAnalytics";
import UserLayout from "../components/user/UserLayout";
import UserCertificates from "../components/user/UserCertificates";
import UserBadges from "../components/user/UserBadges";
import UserLeaderboards from "../components/user/UserLeaderboard";
import PublicProfile from "../components/Profile/PublicProfile";
import VerifyCertificate from "../components/Profile/VerifyCertificate";
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Chats />} />
      <Route path="/knowledge" element={<ERPKnowledgeSearch />} />
      <Route path="/SabReport" element={<AIChat />} />
      <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
      {/* Auth routes */}
      <Route element={<AuthRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        {/* <Route path="/user/levels/:domain" element={<LevelSelector />} /> */}
        <Route path="/user/test/:domain/:level" element={<TestPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Route>

      {/* Admin routes */}
      {/* <Route element={<AdminRoute />}>
        <Route path="/admin/mcq" element={<AdminMcq />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/exam/:examId" element={<AdminAttemptViewer />} />
        <Route
          path="/admin/AdminDashboardChart"
          element={<AdminDashboardChart />}
        />

        <Route path="/admin/analytics" element={<AdminExamAnalytics />} />
        <Route path="/admin" element={<AdminLayout />} />
      </Route> */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/*" element={<AdminLayout />}>
          {/* ✅ DEFAULT (this is your dashboard) */}
          <Route index element={<AdminDashboardChart />} />

          {/* OTHER ADMIN PAGES */}
          <Route path="analytics" element={<AdminExamAnalytics />} />
          <Route path="mcq" element={<AdminMcq />} />
          <Route path="exam/:examId" element={<AdminAttemptViewer />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/user/*" element={<UserLayout />}>
          <Route index element={<PublicProfile />} />
          <Route path="DomainList" element={<DomainList />} />
          <Route path="levels/:domain" element={<LevelSelector />} />
          <Route path="certificates" element={<UserCertificates />} />
          <Route path="badges" element={<UserBadges />} />
          <Route path="leaderboard" element={<UserLeaderboards />} />
        </Route>

        <Route path="/user/test/:domain/:level" element={<TestPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;
