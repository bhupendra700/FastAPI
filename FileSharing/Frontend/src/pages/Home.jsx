import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { useShallow } from "zustand/react/shallow";


function Home() {

const { isAuthenticated, logout, setUser } = useAuthStore(
  useShallow((state) => ({
    isAuthenticated: state.isAuthenticated,
    logout: state.logout,
    setUser: state.setUser,
  }))
);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fetch all uploaded files
  const fetchUploadedFiles = async () => {
    try {
      const { data: res } = await API.get("/api/files/all-file");

      setUploadedFiles(res.files || []);

      console.log("Uploaded Files:", res.data);

    } catch (error) {
      console.error(
        "Fetch Files Error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        logout();
      } else {
        setError(
          error.response?.data?.message ||
          "Unable to fetch uploaded files"
        );
      }
    }
  };

  // Fetch user and uploaded files
  useEffect(() => {
    const initialize = async () => {
      try {
        if (!isAuthenticated) return;

        const { data: res } = await API.get("/api/auth/users/me");

        setUser(res.data);

        await fetchUploadedFiles();

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

    initialize();
  }, [isAuthenticated]);

  // Select files
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    setFiles((prev) => [...prev, ...selectedFiles]);
    setError("");

    e.target.value = "";
  };

  // Drag and Drop
  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFiles = Array.from(e.dataTransfer.files);

    setFiles((prev) => [...prev, ...droppedFiles]);
    setError("");
  };

  // Remove selected file
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const { data: res } = await API.post(
        "/api/files/upload",
        formData
      );

      console.log("Upload Success:", res);

      setFiles([]);

      // Refresh uploaded files after successful upload
      await fetchUploadedFiles();

      alert("Files uploaded successfully!");

    } catch (error) {
      console.error(
        "Upload Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message || "File upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // Uploaded files statistics
  const totalFiles = uploadedFiles.length;

  const totalStorage = uploadedFiles.reduce(
    (total, file) => total + Number(file.size || 0),
    0
  );

  // Open file
  const handleOpenFile = (file) => {
    if (!file.url) {
      setError("File URL is not available");
      return;
    }

    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  // File icon
  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return "📄";
      case "image":
      case "png":
      case "jpg":
      case "jpeg":
        return "🖼️";
      case "video":
        return "🎬";
      case "document":
        return "📝";
      default:
        return "📁";
    }
  };

  // Delete uploaded file
const handleDeleteFile = async (filename , fileId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this file?"
  );

  if (!confirmDelete) return;

  try {
    const { data: res } = await API.delete(
      `/api/files/file/${filename}/${fileId}`
    );

    console.log("File Deleted:", res);

    await fetchUploadedFiles();

    alert("File deleted successfully!");

  } catch (error) {
    console.error(
      "Delete Error:",
      error.response?.data || error.message
    );

    setError(
      error.response?.data?.message || "Unable to delete file"
    );
  }
};

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

            <div
              className="drop-area"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="cloud-icon">☁</div>

              <h3>Drop your files here</h3>

              <p>or browse files from your device</p>

              <input
                type="file"
                id="fileInput"
                multiple
                hidden
                onChange={handleFileChange}
              />

              <button
                type="button"
                className="browse-btn"
                disabled={uploading}
                onClick={() =>
                  document.getElementById("fileInput").click()
                }
              >
                Browse Files
              </button>
            </div>

            {files.length > 0 && (
              <div className="selected-files">

                <h4>Selected Files ({files.length})</h4>

                {files.map((file, index) => (
                  <div
                    className="file-item"
                    key={`${file.name}-${index}`}
                  >
                    <div>
                      <strong>{file.name}</strong>
                      <small>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="upload-btn"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload Files"}
                </button>

              </div>
            )}

            {error && (
              <p className="upload-error">{error}</p>
            )}

            <div className="upload-footer">
              <span>🔒 Secure file sharing</span>
              <span>⚡ Fast transfers</span>
            </div>

          </div>
        </section>

        {/* Uploaded Files Section */}
        <section className="uploaded-section">

          <div className="uploaded-heading">
            <div>
              <span className="tag">MY STORAGE</span>
              <h2>My Uploaded Files</h2>
              <p>Manage and access all your uploaded files.</p>
            </div>

            <button
              type="button"
              className="browse-btn"
              onClick={fetchUploadedFiles}
            >
              ↻ Refresh Files
            </button>
          </div>

          {/* Storage Statistics */}
          <div className="storage-stats">

            <div className="storage-card">
              <div className="storage-icon purple">📁</div>
              <div>
                <p>Total Files</p>
                <h3>{totalFiles}</h3>
              </div>
            </div>

            <div className="storage-card">
              <div className="storage-icon blue">💾</div>
              <div>
                <p>Storage Used</p>
                <h3>{totalStorage.toFixed(2)} MB</h3>
              </div>
            </div>

            <div className="storage-card">
              <div className="storage-icon green">✓</div>
              <div>
                <p>Storage Status</p>
                <h3>Available</h3>
              </div>
            </div>

          </div>

          {/* Files List */}
          <div className="uploaded-files-card">

            <div className="files-list-header">
              <h3>All Files</h3>
              <span>{totalFiles} Files</span>
            </div>

            {loading ? (

              <div className="empty-files">
                <h3>Loading files...</h3>
              </div>

            ) : uploadedFiles.length > 0 ? (

              <div className="uploaded-files-list">

                {uploadedFiles.map((file) => (

                  <div
                    className="uploaded-file-item"
                    key={file.id}
                    onClick={() => handleOpenFile(file)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleOpenFile(file);
                      }
                    }}
                  >

                    <div className="uploaded-file-info">

                      <div className="uploaded-file-icon">
                        {getFileIcon(file.type)}
                      </div>

                      <div className="uploaded-file-details">
                        <h4>{file.name}</h4>

                        <p>
                          {file.type} • {file.size} MB
                        </p>
                      </div>

                    </div>

                    <div className="uploaded-file-meta">
                      <span>{file.date}</span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFile(file);
                        }}
                      >
                        Open ↗
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.name , file.id);
                        }}
                        className="delete-btn"
                        >
                          Delete
                      </button>
                    </div>
                  </div>

                ))}

              </div>

            ) : (

              <div className="empty-files">
                <div>📂</div>
                <h3>No files uploaded yet</h3>
                <p>Your uploaded files will appear here.</p>
              </div>

            )}

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