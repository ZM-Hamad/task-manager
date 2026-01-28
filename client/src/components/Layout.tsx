import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/tasks">Tasks</Link>
      </nav>

      <Outlet />
    </div>
  );
}
