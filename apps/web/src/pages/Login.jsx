import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);
      navigate("/library");
    } catch (err) {
      setError(err.message || "Error al ingresar");
    }
  };

  return (
    <div className="card narrow">
      <h1>Ingreso</h1>
      <p>Accede con tu correo corporativo.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit">Entrar</button>
      </form>
      <div className="hint">
        Demo: admin@dimmel.com / admin123 · planner@dimmel.com / planner123
      </div>
    </div>
  );
}
