
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { setAuthToken } from "../api/axios";
import API from '../api/axios'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((accessToken) => {
    setToken(accessToken);
    setAuthToken(accessToken)
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthToken(null);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
  const initializeAuth = async () => {
    try {
      const { data: res } = await API.get(
        "/api/auth/refresh"
      );

      login(res.access_token);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
}, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
