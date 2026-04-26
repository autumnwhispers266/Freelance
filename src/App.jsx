import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import JobDetail from './pages/JobDetail';
import JobListings from './pages/JobListings';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfAgreement from './pages/TermsOfAgreement';
import AdminDashboard from './pages/AdminDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import PreferencesPage from './pages/PreferencesPage';
import TranscriptionTestPage from './pages/TranscriptionTestPage';
import CategoryPage from './pages/CategoryPage';
import SavedItemsPage from './pages/SavedItemsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfAgreement />} />
          <Route path="transcription-test" element={<TranscriptionTestPage />} />
          <Route path="categories/:slug" element={<CategoryPage />} />
        </Route>
        
        {/* Authenticated Routes with Sidebar Navigation */}
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<FreelancerDashboard />} />
          <Route path="client-dashboard" element={<ClientDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="saved-items" element={<SavedItemsPage />} />
          <Route path="jobs" element={<JobListings />} />
          <Route path="jobs/:id" element={<JobDetail />} />
        </Route>
        
        {/* 404 Catch All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
