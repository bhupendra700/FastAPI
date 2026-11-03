
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import API from '../api/axios'

function Home() {
  const { token, logout , setUser} = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data:res } = await API.get("/api/auth/users/me");

        setUser(res.data);
        // console.log("User Details:", res.data);

      } catch (error) {
        console.error(
          "User Fetch Error:",
          error.response?.data || error.message
        );

        if (error.response?.status === 401) {
          logout();
        } else {
          setError("Unable to fetch user details");
        }

      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }

  }, []);

  return (
    <div>
      <Navbar />

      <main className="home-container">

        {/* Hero Section */}
        <section className="hero">

          <div className="hero-content">

            <span className="tag">
              ✦ SIMPLE. FAST. SECURE.
            </span>

            <h1>
              Share files.
              <br />
              <span>Without limits.</span>
            </h1>

            <p>
              Send your files anywhere, anytime. Upload, share and
              manage your files with a simple and secure experience.
            </p>

            <div className="trust-text">
              ✓ Easy to use &nbsp;
              ✓ Fast sharing &nbsp;
              ✓ Secure access
            </div>

          </div>

          {/* Upload Card */}
          <div className="upload-card">

            <div className="upload-header">
              <div>
                <h3>Upload your files</h3>
                <p>Share anything, anywhere.</p>
              </div>

              <span className="upload-icon">↥</span>
            </div>

            <div className="drop-area">
              <div className="cloud-icon">☁</div>

              <h3>Drop your files here</h3>

              <p>or browse files from your device</p>

              <button className="browse-btn">
                Browse Files
              </button>
            </div>

            <div className="upload-footer">
              <span>🔒 Secure file sharing</span>
              <span>⚡ Fast transfers</span>
            </div>

          </div>

        </section>

        {/* Features */}
        <section className="features">

          <div className="section-heading">
            <span className="tag">WHY FILEFLOW?</span>

            <h2>Everything you need to share files</h2>

            <p>
              Simple tools to make file sharing effortless.
            </p>
          </div>

          <div className="feature-grid">

            <div className="feature-card">
              <div className="feature-icon purple">↥</div>
              <h3>Easy Uploads</h3>
              <p>
                Upload your documents, images and other files easily.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">↗</div>
              <h3>Instant Sharing</h3>
              <p>
                Share files with anyone using a simple shareable link.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">♢</div>
              <h3>Secure Storage</h3>
              <p>
                Keep your files protected with secure access controls.
              </p>
            </div>

          </div>

        </section>

      </main>

      <footer className="footer">
        © 2026 FileFlow. Made for easy file sharing.
      </footer>

    </div>
  );
}

export default Home;
