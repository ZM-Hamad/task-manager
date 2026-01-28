import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/tasks">Tasks</Link>

        {token && <button onClick={logout}>Logout</button>}
      </nav>

      <Outlet />
    </div>
  );
}
