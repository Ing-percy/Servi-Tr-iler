import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api.js";

const filterOptions = {
  type_document: ["plano", "procedimiento", "BOM", "reporte_produccion", "cotizacion", "calidad", "otro"],
  area: ["produccion", "compras", "calidad", "comercial", "ingenieria", "gerencia"],
  product_family: ["poste_acero", "poste_fibra", "mastil", "general"]
};

export default function Library() {
  const [documents, setDocuments] = useState([]);
  const [filters, setFilters] = useState({
    query: "",
    type_document: "",
    area: "",
    product_family: "",
    current_version: ""
  });

  useEffect(() => {
    apiRequest("/documents")
      .then(setDocuments)
      .catch((err) => console.error(err));
  }, []);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (filters.query && !doc.title.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      if (filters.type_document && doc.type_document !== filters.type_document) {
        return false;
      }
      if (filters.area && doc.area !== filters.area) {
        return false;
      }
      if (filters.product_family && doc.product_family !== filters.product_family) {
        return false;
      }
      if (filters.current_version) {
        const desired = filters.current_version === "vigente";
        if (doc.current_version !== desired) return false;
      }
      return true;
    });
  }, [documents, filters]);

  return (
    <div className="card">
      <h1>Biblioteca documental</h1>
      <div className="filters">
        <input
          placeholder="Buscar por título"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        />
        <select
          value={filters.type_document}
          onChange={(e) => setFilters({ ...filters, type_document: e.target.value })}
        >
          <option value="">Tipo</option>
          {filterOptions.type_document.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })}>
          <option value="">Área</option>
          {filterOptions.area.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select
          value={filters.product_family}
          onChange={(e) => setFilters({ ...filters, product_family: e.target.value })}
        >
          <option value="">Familia</option>
          {filterOptions.product_family.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select
          value={filters.current_version}
          onChange={(e) => setFilters({ ...filters, current_version: e.target.value })}
        >
          <option value="">Vigencia</option>
          <option value="vigente">Vigente</option>
          <option value="historico">Histórico</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Tipo</th>
            <th>Área</th>
            <th>Familia</th>
            <th>Versión</th>
            <th>Vigente</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.title}</td>
              <td>{doc.type_document}</td>
              <td>{doc.area}</td>
              <td>{doc.product_family}</td>
              <td>{doc.version}</td>
              <td>{doc.current_version ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
