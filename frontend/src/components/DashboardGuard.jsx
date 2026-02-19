import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasConnectedProvider } from '../utils/auth';

export default function DashboardGuard({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/signup" replace />;
  }
  if (!hasConnectedProvider()) {
    return <Navigate to="/onboarding/connect-provider" replace />;
  }
  return children;
}
