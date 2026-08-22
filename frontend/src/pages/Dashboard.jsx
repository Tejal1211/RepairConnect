import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ClipboardList, Wrench, CheckCircle2, Leaf, PlusCircle } from "lucide-react";
import StatusTimeline from "../components/StatusTimeline.jsx";
import { api } from "../services/api.js";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-mint-400" size={26} />
      </div>
    );
  }

  if (error) {
    return <p className="mx-auto max-w-xl px-5 py-24 text-center text-sm text-clay-400">{error}</p>;
  }

  const stats = [
    { label: "Total diagnoses", value: data.total_diagnoses, icon: ClipboardList },
    { label: "Repair recommended", value: data.repair_recommended, icon: CheckCircle2 },
    { label: "Under repair", value: data.items_under_repair, icon: Wrench },
    { label: "Completed", value: data.completed_repairs, icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow">Dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Your repair activity</h1>
        </div>
        <Link to="/diagnose" className="btn-primary text-sm">
          <PlusCircle size={16} /> New Diagnosis
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <s.icon size={18} className="text-mint-400" />
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-parchment/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 card flex items-center gap-3 p-5">
        <Leaf size={20} className="text-mint-400" />
        <p className="text-sm text-parchment/65">
          <span className="font-semibold text-mint-300">{data.items_potentially_repairable}</span> item(s) assessed as
          potentially repairable — potential waste avoided through good repair decisions.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold">Recent diagnoses</h2>
          <div className="mt-4 space-y-4">
            {data.recent_reports.length === 0 && (
              <p className="text-sm text-parchment/45">No diagnoses yet. Start your first one.</p>
            )}
            {data.recent_reports.map((r) => (
              <Link
                key={r.report_id}
                to={`/analysis/${r.report_id}`}
                state={{ report: r }}
                className="card block p-4 transition hover:border-mint-500/40"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.repair_report.item}</p>
                  <span className="font-mono text-xs text-mint-400">{r.repair_score.repair_score}/100</span>
                </div>
                <p className="mt-1 text-xs text-parchment/45">
                  {r.repair_score.recommendation.replaceAll("_", " ")}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">Repair requests</h2>
          <div className="mt-4 space-y-4">
            {data.recent_requests.length === 0 && (
              <p className="text-sm text-parchment/45">No repair requests yet.</p>
            )}
            {data.recent_requests.map((req) => (
              <div key={req.id} className="card p-4">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                >
                  <div>
                    <p className="font-medium">{req.item_name}</p>
                    <p className="text-xs text-parchment/45">{req.technician_name}</p>
                  </div>
                  <span className="chip !py-1 !text-[10px]">{req.status.replaceAll("_", " ")}</span>
                </button>
                {expanded === req.id && (
                  <div className="mt-5 border-t border-surface-border pt-5">
                    <StatusTimeline status={req.status} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
