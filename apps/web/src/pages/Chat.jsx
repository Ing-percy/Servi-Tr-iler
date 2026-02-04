import { useState } from "react";
import { apiRequest } from "../api.js";

const templates = [
  { label: "Estado de OT / avance", text: "Estado de OT / avance" },
  { label: "Bloqueos por material", text: "Bloqueos por material" },
  { label: "Procedimiento vigente", text: "¿Cuál es el procedimiento vigente?" },
  { label: "Historial de No Conformidades", text: "Historial de No Conformidades" }
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [sources, setSources] = useState([]);

  const sendQuestion = async (text) => {
    if (!text) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    const response = await apiRequest("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text, thread_id: threadId })
    });
    setThreadId(response.thread_id);
    setSources(response.sources);
    setMessages([...newMessages, { role: "assistant", content: response.answer }]);
  };

  return (
    <div className="chat-layout">
      <div className="chat-main">
        <div className="chat-header">
          <h1>Chat</h1>
          <button className="secondary" onClick={() => {
            setMessages([]);
            setThreadId(null);
            setSources([]);
          }}>
            Nueva conversación
          </button>
        </div>
        <div className="templates">
          {templates.map((tpl) => (
            <button key={tpl.label} className="secondary" onClick={() => sendQuestion(tpl.text)}>
              {tpl.label}
            </button>
          ))}
        </div>
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`bubble ${msg.role}`}>
              <strong>{msg.role === "user" ? "Tú" : "Hub"}</strong>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
        <form
          className="chat-input"
          onSubmit={(event) => {
            event.preventDefault();
            sendQuestion(input);
          }}
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Haz tu pregunta" />
          <button type="submit">Enviar</button>
        </form>
      </div>
      <aside className="chat-sources">
        <h2>Fuentes</h2>
        {sources.length === 0 && <p>No hay fuentes cargadas.</p>}
        <ul>
          {sources.map((source, index) => (
            <li key={`${source.document_id}-${index}`}>
              <div className="source-title">{source.title}</div>
              <div className="source-meta">Versión {source.version} · {source.location}</div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
