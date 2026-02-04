import { useState } from "react";
import { apiRequest } from "../api.js";

const initialState = {
  title: "",
  type_document: "procedimiento",
  product_family: "general",
  area: "produccion",
  version: "",
  effective_date: "",
  tags: ""
};

export default function Upload() {
  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    if (file) body.append("file", file);
    try {
      await apiRequest("/documents/upload", {
        method: "POST",
        body
      });
      setMessage("Documento cargado.");
      setForm(initialState);
      setFile(null);
    } catch (err) {
      setMessage("Error al cargar documento.");
    }
  };

  return (
    <div className="card">
      <h1>Subir documento</h1>
      <form className="form grid" onSubmit={handleSubmit}>
        <label>
          Título
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label>
          Tipo documento
          <select
            value={form.type_document}
            onChange={(e) => setForm({ ...form, type_document: e.target.value })}
          >
            <option value="plano">plano</option>
            <option value="procedimiento">procedimiento</option>
            <option value="BOM">BOM</option>
            <option value="reporte_produccion">reporte_produccion</option>
            <option value="cotizacion">cotizacion</option>
            <option value="calidad">calidad</option>
            <option value="otro">otro</option>
          </select>
        </label>
        <label>
          Familia
          <select
            value={form.product_family}
            onChange={(e) => setForm({ ...form, product_family: e.target.value })}
          >
            <option value="poste_acero">poste_acero</option>
            <option value="poste_fibra">poste_fibra</option>
            <option value="mastil">mastil</option>
            <option value="general">general</option>
          </select>
        </label>
        <label>
          Área
          <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
            <option value="produccion">produccion</option>
            <option value="compras">compras</option>
            <option value="calidad">calidad</option>
            <option value="comercial">comercial</option>
            <option value="ingenieria">ingenieria</option>
            <option value="gerencia">gerencia</option>
          </select>
        </label>
        <label>
          Versión
          <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} required />
        </label>
        <label>
          Fecha vigencia
          <input
            type="date"
            value={form.effective_date}
            onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
            required
          />
        </label>
        <label>
          Tags (separadas por coma)
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </label>
        <label>
          Archivo
          <input type="file" onChange={(e) => setFile(e.target.files?.[0])} required />
        </label>
        <button type="submit">Cargar</button>
      </form>
      {message && <div className="hint">{message}</div>}
    </div>
  );
}
