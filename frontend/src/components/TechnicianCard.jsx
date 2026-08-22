import { Star, MapPin, Phone, CheckCircle2, XCircle } from "lucide-react";

export default function TechnicianCard({ tech, onViewDetails, onRequestRepair }) {
  return (
    <div className="card flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">{tech.name}</h3>
          <p className="text-sm text-mint-400">{tech.specialization}</p>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            tech.available ? "bg-mint-500/10 text-mint-400" : "bg-clay-500/10 text-clay-400"
          }`}
        >
          {tech.available ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          {tech.available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-parchment/65">
        <span className="flex items-center gap-1">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          {tech.rating?.toFixed?.(1) ?? tech.rating}
        </span>
        {tech.distance_km != null && <span>{tech.distance_km} km away</span>}
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {tech.address}
        </span>
      </div>

      <p className="flex items-center gap-1.5 text-sm text-parchment/50">
        <Phone size={13} /> {tech.phone}
      </p>

      <p className="font-mono text-sm text-parchment/80">
        ₹{tech.estimated_min_cost?.toLocaleString?.("en-IN")} – ₹{tech.estimated_max_cost?.toLocaleString?.("en-IN")}
      </p>

      <div className="mt-2 flex gap-3">
        <button onClick={() => onViewDetails?.(tech)} className="btn-secondary flex-1 !py-2 text-sm">
          View Details
        </button>
        <button
          onClick={() => onRequestRepair?.(tech)}
          disabled={!tech.available}
          className="btn-primary flex-1 !py-2 text-sm"
        >
          Request Repair
        </button>
      </div>
    </div>
  );
}
