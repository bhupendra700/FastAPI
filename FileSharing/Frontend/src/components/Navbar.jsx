
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useShallow } from "zustand/react/shallow";

function Navbar() {
  const { user, logout } = useAuthStore(
    useShallow((state)=>({
      user: state.user,
      logout: state.logout
    }))
  );

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        <span className="logo-icon">F</span>
        FileFlow
      </Link>

      <div className="nav-links">

        <Link to="/" className="nav-link">
          Home
        </Link>

        <div className="navbar-user">

          <div className="navbar-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="navbar-user-info">
            <span>{user?.name || "Loading..."}</span>
            <small>{user?.email || ""}</small>
          </div>

          <button
            className="navbar-logout"
            onClick={logout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={19} strokeWidth={2} />
          </button>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;
