import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Library from "./pages/Library.jsx";
import Upload from "./pages/Upload.jsx";
import Chat from "./pages/Chat.jsx";

const Nav = () => (
  <nav className="nav">
    <div className="nav-brand">Dimmel Knowledge Hub</div>
    <div className="nav-links">
      <Link to="/library">Biblioteca</Link>
      <Link to="/upload">Subir documento</Link>
      <Link to="/chat">Chat</Link>
    </div>
  </nav>
);

export default function App() {
  return (
    <div className="app-shell">
      <Nav />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/library" element={<Library />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
}
