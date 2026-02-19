import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import QuickCarbonEstimate from './pages/QuickCarbonEstimate';
import Dashboard from './pages/Dashboard';
import ResearchPage from './pages/ResearchPage';
import Signup from './pages/Signup';
import AuthVerify from './pages/AuthVerify';
import OnboardingLayout from './pages/onboarding/OnboardingLayout';
import ConnectProvider from './pages/onboarding/ConnectProvider';
import DashboardGuard from './components/DashboardGuard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/estimate" element={<QuickCarbonEstimate />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/verify" element={<AuthVerify />} />
        <Route path="/onboarding" element={<OnboardingLayout />}>
          <Route index element={<Navigate to="connect-provider" replace />} />
          <Route path="connect-provider" element={<ConnectProvider />} />
        </Route>
        <Route
          path="/dashboard"
          element={
            <DashboardGuard>
              <Dashboard />
            </DashboardGuard>
          }
        />
        <Route path="/ai-carbon-outlook-2026" element={<ResearchPage />} />
        <Route path="/research/ai-carbon-outlook-2026" element={<ResearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
