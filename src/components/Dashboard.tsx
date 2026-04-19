"use client";
import { useState, useMemo } from "react";

type Status = "applied" | "interview" | "offer" | "rejected" | "withdrawn";

interface Job {
  id: string;
  title: string;
  company: string;
  link?: string;
  status: Status;
  notes?: string;
  location?: string;
  salary?: string;
  applied_at: string;
}

const STATUS_OPTIONS: Status[] = ["applied", "interview", "offer", "rejected", "withdrawn"];
const STATUS_LABELS: Record<Status, string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function StatCard({ n, label, accent }: { n: number; label: string; accent?: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "1rem 1.25rem" }}>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: accent || "var(--text)", lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function AddJobModal({ onClose, onAdd }: { onClose: () => void; onAdd: (job: Job) => void }) {
  const [form, setForm] = useState({ title: "", company: "", link: "", status: "applied" as Status, notes: "", location: "", salary: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.title.trim() || !form.company.trim()) { setErr("Title and company are required."); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { setErr("Failed to save."); setLoading(false); return; }
      const job = await res.json();
      onAdd(job);
      onClose();
    } catch { setErr("Network error."); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "2rem", width: "100%", maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Add application</h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: "4px 10px" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Job title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Working Student – Engineering" />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Company *</label>
            <input value={form.company} onChange={e => set("company", e.target.value)} placeholder="ACME GmbH" />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Job URL</label>
          <input value={form.link} onChange={e => set("link", e.target.value)} placeholder="https://..." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Location</label>
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Dortmund" />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Salary</label>
            <input value={form.salary} onChange={e => set("salary", e.target.value)} placeholder="€15/h" />
          </div>
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Interview on Tuesday, contact: ..." style={{ resize: "vertical" }} />
        </div>
        {err && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{err}</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={loading}>{loading ? "Saving…" : "Save application"}</button>
        </div>
      </div>
    </div>
  );
}

function EditStatusSelect({ job, onChange }: { job: Job; onChange: (status: Status) => void }) {
  const [loading, setLoading] = useState(false);
  async function change(val: Status) {
    setLoading(true);
    await fetch(`/api/jobs/${job.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: val }) });
    onChange(val);
    setLoading(false);
  }
  return (
    <select value={job.status} onChange={e => change(e.target.value as Status)} disabled={loading}
      style={{ width: "auto", padding: "4px 8px", fontSize: "0.75rem", height: 28 }}>
      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
    </select>
  );
}

export default function Dashboard({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: jobs.length,
    applied: jobs.filter(j => j.status === "applied").length,
    interview: jobs.filter(j => j.status === "interview").length,
    offer: jobs.filter(j => j.status === "offer").length,
    rejected: jobs.filter(j => j.status === "rejected").length,
  }), [jobs]);

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return jobs.filter(j => {
      if (filterStatus && j.status !== filterStatus) return false;
      if (q && !(j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.notes || "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [jobs, filterStatus, search]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    setJobs(prev => prev.filter(j => j.id !== id));
    setDeletingId(null);
  }

  function handleStatusChange(id: string, status: Status) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="mono" style={{ fontSize: "0.7rem", color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Werkstudent</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>Job Tracker</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add application</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: "2rem" }}>
        <StatCard n={stats.total} label="Total" />
        <StatCard n={stats.applied} label="Applied" accent="#7dea7d" />
        <StatCard n={stats.interview} label="Interview" accent="var(--accent)" />
        <StatCard n={stats.offer} label="Offer" accent="var(--accent2)" />
        <StatCard n={stats.rejected} label="Rejected" accent="var(--danger)" />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." style={{ maxWidth: 220 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        {(filterStatus || search) && (
          <button className="btn-ghost" style={{ fontSize: "0.78rem" }} onClick={() => { setFilterStatus(""); setSearch(""); }}>Clear filters</button>
        )}
        <span className="mono" style={{ fontSize: "0.72rem", color: "var(--muted)", marginLeft: "auto" }}>{visible.length} result{visible.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📋</div>
          <p style={{ fontSize: "1rem" }}>{jobs.length === 0 ? "No applications yet. Add your first one!" : "No results match your filters."}</p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface)" }}>
                {["Role & Company", "Status", "Location", "Salary", "Date", ""].map((h, i) => (
                  <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((job, i) => (
                <tr key={job.id} style={{ borderBottom: i < visible.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "12px 14px", maxWidth: 260 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: 2 }}>{job.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{job.company}</div>
                    {job.link && (
                      <a href={job.link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "0.72rem", color: "var(--accent2)", textDecoration: "none", display: "inline-block", marginTop: 3 }}>
                        Open listing ↗
                      </a>
                    )}
                    {job.notes && <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{job.notes}</div>}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <EditStatusSelect job={job} onChange={s => handleStatusChange(job.id, s)} />
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.82rem", color: "var(--muted)" }}>{job.location || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    {job.salary ? <span className="mono" style={{ fontSize: "0.8rem", color: "var(--accent)" }}>{job.salary}</span> : <span style={{ color: "var(--muted)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="mono" style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap" }}>{formatDate(job.applied_at)}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => handleDelete(job.id)} disabled={deletingId === job.id}
                      style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "var(--danger)"; (e.target as HTMLElement).style.color = "var(--danger)"; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "var(--border)"; (e.target as HTMLElement).style.color = "var(--muted)"; }}>
                      {deletingId === job.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddJobModal
          onClose={() => setShowAdd(false)}
          onAdd={job => setJobs(prev => [job, ...prev])}
        />
      )}
    </div>
  );
}
