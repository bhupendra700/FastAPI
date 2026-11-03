import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <h1>Checking authentication...</h1>;

  return token ? <Navigate to="/" replace /> : children;
}

export default PublicRoute;