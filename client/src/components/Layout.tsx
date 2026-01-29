import { Link, Outlet, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useEffect, useRef } from "react";
import "../styles/layout.css";

export default function Layout() {
  const navigate = useNavigate();
  const tokenStorage = useLocalStorage<string>("token", "");
  const token = tokenStorage.value;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => { });
  }, []);

  function logout() {
    tokenStorage.remove();
    navigate("/login");
  }

  return (
  <div className="app-shell">
    <video
      ref={videoRef}
      className="bg-video"
      autoPlay
      muted
      playsInline
      loop
      preload="auto"
      src="/bg.mp4"
    />
    <div className="bg-overlay" />

    <div className="app-content">
      <nav className="top-nav">
        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <button className="nav-btn" type="button" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </nav>

      <Outlet />
    </div>
  </div>
);

}
