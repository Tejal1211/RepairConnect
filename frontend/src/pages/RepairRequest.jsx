import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { api } from "../services/api.js";

export default function RepairRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reportId, technician } = location.state || {};

  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  if (!reportId || !technician) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <AlertTriangle className="mx-auto text-amber-400" size={30} />
        <h1 className="mt-4 font-display text-xl font-semibold">Nothing to request yet</h1>
        <p className="mt-2 text-sm text-parchment/55">Start a diagnosis and choose a technician first.</p>
        <Link to="/diagnose" className="btn-primary mt-6 inline-flex">Diagnose an Item</Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!preferredDate) {
      setError("Please select a preferred date.");
      return;
    }
    setSubmitting(true);
    try {
      const record = await api.createRepairRequest({
        report_id: reportId,
        technician_id: technician.id,
        preferred_date: preferredDate,
        notes,
        user_name: userName || "Guest User",
        user_email: userEmail || undefined,
      });
      setCreated(record);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <CheckCircle2 className="mx-auto text-mint-400" size={36} />
        <h1 className="mt-4 font-display text-2xl font-bold">Repair request submitted</h1>
        <p className="mt-2 text-sm text-parchment/60">
          {technician.name} will review your request for "{created.item_name}".
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          <Link to="/diagnose" className="btn-secondary">Diagnose Another Item</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 lg:px-8">
      <p className="section-eyebrow">Repair Request</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Confirm your request</h1>

      <div className="card mt-6 p-6">
        <p className="text-sm text-parchment/50">Selected technician</p>
        <p className="mt-1 font-display text-lg font-semibold">{technician.name}</p>
        <p className="text-sm text-mint-400">{technician.specialization}</p>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 text-sm text-clay-400">
          <AlertTriangle size={15} /> {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="card mt-4 space-y-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-parchment/75">Your name</label>
            <input
              className="mt-2 w-full rounded-xl border border-surface-border bg-ink-900 px-4 py-3 text-sm"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Jordan Smith"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-parchment/75">Email (optional)</label>
            <input
              type="email"
              className="mt-2 w-full rounded-xl border border-surface-border bg-ink-900 px-4 py-3 text-sm"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-parchment/75">Preferred date *</label>
          <input
            type="date"
            required
            className="mt-2 w-full rounded-xl border border-surface-border bg-ink-900 px-4 py-3 text-sm"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-parchment/75">Additional notes</label>
          <textarea
            rows={4}
            className="mt-2 w-full rounded-xl border border-surface-border bg-ink-900 px-4 py-3 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the technician should know before visiting..."
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Repair Request"}
        </button>
      </form>
    </div>
  );
}
