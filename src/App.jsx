import { useEffect, useState } from "react";

// Backend address comes from the environment. Falls back to the local backend.
const API = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

function daysLeft(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

function dueLabel(n) {
  if (n === null) return { text: "date unclear", cls: "unknown" };
  if (n < 0) return { text: `${-n} day${n === -1 ? "" : "s"} ago`, cls: "past" };
  if (n === 0) return { text: "due today", cls: "soon" };
  if (n === 1) return { text: "due tomorrow", cls: "soon" };
  return { text: `in ${n} days`, cls: n <= 3 ? "soon" : "later" };
}

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function App() {
  const [text, setText] = useState("");
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // {kind: "ok" | "info" | "error", text}

  async function loadDeadlines() {
    try {
      const res = await fetch(`${API}/api/deadlines`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setDeadlines(await res.json());
    } catch (e) {
      setMessage({ kind: "error", text: `Could not load deadlines: ${e.message}` });
    }
  }

  useEffect(() => {
    loadDeadlines();
  }, []);

  async function submit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Server returned ${res.status}`);
      if (data.saved) {
        setMessage({ kind: "ok", text: `Saved: ${data.deadline.title}` });
        setText("");
        await loadDeadlines();
      } else {
        setMessage({ kind: "info", text: data.message });
      }
    } catch (e) {
      setMessage({ kind: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>DeadlineIQ <span>AI</span></h1>
        <p>Paste a class announcement. Get the deadline, on a timeline.</p>
      </header>

      <section className="card">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. DBMS assignment 3 must be submitted by next Friday on the portal."
          rows={5}
          maxLength={4000}
        />
        <div className="row">
          <span className="count">{text.length} / 4000</span>
          <button onClick={submit} disabled={loading || !text.trim()}>
            {loading ? "Extracting..." : "Extract deadline"}
          </button>
        </div>
        {message && <div className={`msg ${message.kind}`}>{message.text}</div>}
      </section>

      <h2>Upcoming deadlines</h2>
      {deadlines.length === 0 ? (
        <p className="empty">Nothing yet. Submit an announcement above.</p>
      ) : (
        <ul className="list">
          {deadlines.map((d) => {
            const due = dueLabel(daysLeft(d.deadlineDate));
            return (
              <li key={d.id} className="item">
                <div className="date">
                  <strong>{formatDate(d.deadlineDate)}</strong>
                  <span className={`pill ${due.cls}`}>{due.text}</span>
                </div>
                <div className="body">
                  <div className="title">
                    {d.title} <span className="type">{d.type}</span>
                  </div>
                  {d.course && <div className="course">{d.course}</div>}
                  <div className="summary">{d.summary}</div>
                  {!d.deadlineDate && d.whenText && (
                    <div className="hint">Model read the date as &ldquo;{d.whenText}&rdquo; but it could not be turned into a calendar date.</div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
