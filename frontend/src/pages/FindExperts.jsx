import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SlidersHorizontal, Loader2, MapPinOff } from "lucide-react";
import TechnicianCard from "../components/TechnicianCard.jsx";
import { api } from "../services/api.js";

const CATEGORY_OPTIONS = ["All", "Smartphone", "Laptop", "Tablet", "Television", "Refrigerator", "Washing Machine", "Bicycle", "Furniture"];

export default function FindExperts() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportId = location.state?.reportId;

  const [category, setCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [technicians, setTechnicians] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .listTechnicians({
        category: category === "All" ? undefined : category,
        min_rating: minRating || undefined,
      })
      .then((data) => {
        setTechnicians(data.technicians || []);
        setMeta(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, minRating]);

  function handleRequestRepair(tech) {
    if (!reportId) {
      navigate("/diagnose");
      return;
    }
    navigate("/repair-request", { state: { reportId, technician: tech } });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
      <p className="section-eyebrow">Find Repair Experts</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Compare nearby technicians</h1>

      {meta && !meta.maps_enabled && (
        <p className="mt-3 flex items-center gap-2 text-xs text-amber-400">
          <MapPinOff size={14} /> Live Google Maps isn't configured — showing {meta.source === "supabase" ? "technician data from Supabase" : "sample technician data"}.
        </p>
      )}

      <div className="card mt-6 flex flex-wrap items-center gap-4 p-4">
        <span className="flex items-center gap-2 text-sm text-parchment/60">
          <SlidersHorizontal size={15} /> Filters
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-surface-border bg-ink-900 px-3 py-2 text-sm"
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="rounded-lg border border-surface-border bg-ink-900 px-3 py-2 text-sm"
        >
          <option value={0}>Any rating</option>
          <option value={4}>4.0+ stars</option>
          <option value={4.5}>4.5+ stars</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-mint-400" size={26} />
        </div>
      ) : error ? (
        <p className="mt-10 text-center text-sm text-clay-400">{error}</p>
      ) : technicians.length === 0 ? (
        <p className="mt-10 text-center text-sm text-parchment/50">No technicians match those filters yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((t) => (
            <TechnicianCard key={t.id} tech={t} onRequestRepair={handleRequestRepair} />
          ))}
        </div>
      )}
    </div>
  );
}
