import { Link, Outlet, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function Layout() {
  const navigate = useNavigate();
  const tokenStorage = useLocalStorage<string>("token", "");
  const token = tokenStorage.value;

  function logout() {
    tokenStorage.remove();
    navigate("/login");
  }

  return (
    <div style={{ padding: 16 }}>
      {token && (
        <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link to="/tasks">Tasks</Link>
          <button onClick={logout}>Logout</button>
        </nav>
      )}


      <Outlet />
    </div>
  );
}
