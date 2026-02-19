import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import QuickCarbonEstimate from './pages/QuickCarbonEstimate';
import Dashboard from './pages/Dashboard';
import ResearchPage from './pages/ResearchPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/estimate" element={<QuickCarbonEstimate />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-carbon-outlook-2026" element={<ResearchPage />} />
        <Route path="/research/ai-carbon-outlook-2026" element={<ResearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
