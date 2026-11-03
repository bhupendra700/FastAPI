
import { useState } from "react";
import { Link } from "react-router-dom";
import API from '../api/axios'
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("bhupendra7021@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await API.post(
        "/api/auth/login",
        {
          email: email,
          password: password,
        }
      );

      login(response.data.access_token)
    } catch (error) {
      console.error("Login Failed!");

      if (error.response) {
        console.error("Error:", error.response.data);
      } else {
        console.error("Error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">
        <span className="logo-icon">F</span>
        FileFlow
      </Link>

      <div className="auth-card">
        <div className="auth-icon">↗</div>

        <h1>Welcome back!</h1>
        <p className="auth-description">
          Sign in to continue sharing your files.
        </p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="password-label">
              <label>Password</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Don't have an account?
          <Link to="/signup"> Create account</Link>
        </p>
      </div>

      <p className="auth-bottom">
        Your files. Your control. Your privacy.
      </p>
    </div>
  );
}

export default Login;
