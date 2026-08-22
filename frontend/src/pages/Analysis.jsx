import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import {
  AlertTriangle, CheckCircle2, ShieldAlert, IndianRupee,
  Loader2, RefreshCcw, Users, Save, PlusCircle,
} from "lucide-react";
import RepairScore from "../components/RepairScore.jsx";
import { api } from "../services/api.js";

const SEVERITY_STYLES = {
  Low: "text-mint-400 bg-mint-500/10 ring-mint-500/25",
  Medium: "text-amber-400 bg-amber-500/10 ring-amber-500/25",
  High: "text-clay-400 bg-clay-500/10 ring-clay-500/25",
};

export default function Analysis() {
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [report, setReport] = useState(location.state?.report || null);
  const [loading, setLoading] = useState(!location.state?.report);
  const [error, setError] = useState("");

  useEffect(() => {
    if (report) return;
    setLoading(true);
    api
      .getReport(reportId)
      .then((data) => setReport(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-mint-400" size={28} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <ShieldAlert className="mx-auto text-clay-400" size={32} />
        <h1 className="mt-4 font-display text-xl font-semibold">Report not found</h1>
        <p className="mt-2 text-sm text-parchment/55">{error || "We couldn't find this repair report."}</p>
        <Link to="/diagnose" className="btn-primary mt-6 inline-flex">Start New Diagnosis</Link>
      </div>
    );
  }

  const rr = report.repair_report;
  const score = report.repair_score;

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow">Repair Assessment</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{rr.item}</h1>
        </div>
        {report.mode === "demo" && (
          <span className="chip !border-amber-500/40 !text-amber-400">
            <RefreshCcw size={12} /> DEMO MODE RESULT
          </span>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT: report details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${SEVERITY_STYLES[rr.severity]}`}>
                {rr.severity} severity
              </span>
              <span className="chip !py-1">{rr.repairability}</span>
              <span className="chip !py-1">AI confidence: {rr.confidence}%</span>
            </div>

            <dl className="mt-6 space-y-5 text-sm">
              <Row label="Visible damage" value={rr.visible_damage} />
              <Row label="Possible issue" value={rr.possible_issue} />
              <Row label="Possible cause" value={rr.possible_cause} />
            </dl>
          </div>

          {rr.safe_next_steps?.length > 0 && (
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-display font-semibold">
                <CheckCircle2 size={18} className="text-mint-400" /> Safe Next Steps
              </h3>
              <ul className="mt-4 space-y-2">
                {rr.safe_next_steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-parchment/70">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-mint-400" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rr.warnings?.length > 0 && (
            <div className="card border-clay-500/30 bg-clay-500/5 p-6">
              <h3 className="flex items-center gap-2 font-display font-semibold text-clay-400">
                <AlertTriangle size={18} /> Important Warnings
              </h3>
              <ul className="mt-4 space-y-2">
                {rr.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-clay-300/90">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display font-semibold">
              <IndianRupee size={18} className="text-mint-400" /> Estimated Repair Cost
            </h3>
            <p className="mt-3 font-display text-2xl font-bold">
              ₹{rr.estimated_repair_range.min.toLocaleString("en-IN")} – ₹{rr.estimated_repair_range.max.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs text-parchment/45">
              Estimated range — actual cost requires professional inspection.
            </p>
          </div>

          <p className="rounded-xl border border-surface-border bg-surface/40 px-4 py-3 text-xs leading-relaxed text-parchment/45">
            {rr.analysis_disclaimer}
          </p>
        </div>

        {/* RIGHT: score + actions */}
        <div className="space-y-6">
          <RepairScore score={score.repair_score} recommendation={score.recommendation} reasoning={score.reasoning} />

          <div className="card space-y-3 p-5">
            <Link to="/find-experts" state={{ reportId: report.report_id }} className="btn-primary w-full text-sm">
              <Users size={16} /> Find Repair Experts
            </Link>
            <button
              onClick={() => window.print()}
              className="btn-secondary w-full text-sm"
            >
              <Save size={16} /> Save Report
            </button>
            <Link to="/diagnose" className="btn-secondary w-full text-sm">
              <PlusCircle size={16} /> Start New Diagnosis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-wide text-parchment/40">{label}</dt>
      <dd className="mt-1 leading-relaxed text-parchment/80">{value}</dd>
    </div>
  );
}
