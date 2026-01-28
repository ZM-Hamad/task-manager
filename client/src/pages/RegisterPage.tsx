import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    // TEMP: fake register until backend is connected
    localStorage.setItem("token", "test123");
    navigate("/tasks");
  }

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Create account</button>
      </form>
    </div>
  );
}
