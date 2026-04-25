import { Navigate } from 'react-router-dom';
import { isAdminUser } from '../utils/auth';

export default function ProtectedRoute({ children }) {
  if (!isAdminUser()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
