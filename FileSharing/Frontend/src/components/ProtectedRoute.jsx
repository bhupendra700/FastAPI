import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <h1>Checking authentication...</h1>;

  return token ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;