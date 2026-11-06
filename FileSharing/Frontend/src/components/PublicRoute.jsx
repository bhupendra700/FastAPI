import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useShallow } from "zustand/react/shallow";

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore(
    useShallow((state)=>({
      isAuthenticated: state.isAuthenticated,
      loading: state.loading
    }))
  );

  if (loading) return <h1>Checking authentication...</h1>;

  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default PublicRoute;