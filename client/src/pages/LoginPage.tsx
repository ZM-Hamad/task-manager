import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../services/apiClient";

type LoginResponse = { token: string };

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const data = await apiPost<LoginResponse>("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      navigate("/tasks");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
