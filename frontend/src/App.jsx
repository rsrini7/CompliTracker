import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Sidebar from "./components/layout/Sidebar";
import Notifications from "./components/common/Notifications";

// Pages
import Profile from "./pages/profile/Profile";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import SSOCallback from "./pages/SSOCallback";

// Document Pages
import DocumentList from "./pages/documents/DocumentList";
import DocumentDetail from "./pages/documents/DocumentDetail";
import DocumentUpload from "./pages/documents/DocumentUpload";
import DocumentSign from "./pages/documents/DocumentSign";

// Compliance Pages
import ComplianceList from "./pages/compliance/ComplianceList";
import ComplianceDetail from "./pages/compliance/ComplianceDetail";
import ComplianceForm from "./pages/compliance/ComplianceForm";

// Risk Analysis Pages
import RiskAnalysisDashboard from "./pages/risk/RiskAnalysisDashboard";
import ComplianceRiskAnalysis from "./pages/risk/ComplianceRiskAnalysis";

// Profile Pages
import ProfileSettings from "./pages/profile/ProfileSettings";
import CalendarIntegration from "./pages/profile/CalendarIntegration";
import NotificationChannels from "./pages/profile/NotificationChannels";
import SignatureIntegration from "./pages/profile/SignatureIntegration";

import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="app-container">
          <Header toggleSidebar={toggleSidebar} />

          <div className="content-container">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <Notifications />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/sso/callback" element={<SSOCallback />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                {/* Compliance routes */}
                <Route
                  path="/compliance"
                  element={
                    <PrivateRoute>
                      <ComplianceList />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/compliance/create"
                  element={
                    <PrivateRoute>
                      <ComplianceForm />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/compliance/:id"
                  element={
                    <PrivateRoute>
                      <ComplianceDetail />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/compliance/:id/edit"
                  element={
                    <PrivateRoute>
                      <ComplianceForm />
                    </PrivateRoute>
                  }
                />

                {/* Document routes */}
                <Route
                  path="/documents"
                  element={
                    <PrivateRoute>
                      <DocumentList />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/documents/upload"
                  element={
                    <PrivateRoute>
                      <DocumentUpload />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/documents/:id"
                  element={
                    <PrivateRoute>
                      <DocumentDetail />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/documents/:id/sign"
                  element={
                    <PrivateRoute>
                      <DocumentSign />
                    </PrivateRoute>
                  }
                />

                {/* Risk analysis routes */}
                <Route
                  path="/risk-analysis"
                  element={
                    <PrivateRoute>
                      <RiskAnalysisDashboard />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/risk-analysis/compliance/:id"
                  element={
                    <PrivateRoute>
                      <ComplianceRiskAnalysis />
                    </PrivateRoute>
                  }
                />

                {/* Profile routes */}
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfileSettings />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/profile/calendar-integration"
                  element={
                    <PrivateRoute>
                      <CalendarIntegration />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/profile/notification-channels"
                  element={
                    <PrivateRoute>
                      <NotificationChannels />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/profile/signature-integration"
                  element={
                    <PrivateRoute>
                      <SignatureIntegration />
                    </PrivateRoute>
                  }
                />

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>

          <Footer />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
