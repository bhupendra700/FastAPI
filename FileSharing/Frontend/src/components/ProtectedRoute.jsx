import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useShallow } from "zustand/react/shallow";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore(
    useShallow((state)=>({
      isAuthenticated: state.isAuthenticated,
      loading: state.loading
    }))
  );

  if (loading) return <h1>Checking authentication...</h1>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;