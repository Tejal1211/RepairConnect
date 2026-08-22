import { Check } from "lucide-react";

const STATUS_FLOW = [
  "REQUEST_SUBMITTED",
  "TECHNICIAN_REVIEW",
  "INSPECTION_SCHEDULED",
  "INSPECTION_IN_PROGRESS",
  "REPAIR_APPROVED",
  "REPAIR_IN_PROGRESS",
  "READY_FOR_COLLECTION",
  "COMPLETED",
];

const LABELS = {
  REQUEST_SUBMITTED: "Request Submitted",
  TECHNICIAN_REVIEW: "Technician Review",
  INSPECTION_SCHEDULED: "Inspection Scheduled",
  INSPECTION_IN_PROGRESS: "Inspection In Progress",
  REPAIR_APPROVED: "Repair Approved",
  REPAIR_IN_PROGRESS: "Repair In Progress",
  READY_FOR_COLLECTION: "Ready For Collection",
  COMPLETED: "Completed",
};

export default function StatusTimeline({ status }) {
  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <ol className="space-y-0">
      {STATUS_FLOW.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const isLast = i === STATUS_FLOW.length - 1;
        return (
          <li key={s} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[13px] top-7 h-full w-0.5 ${
                  done ? "bg-mint-500" : "bg-surface-border"
                }`}
              />
            )}
            <span
              className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                done
                  ? "bg-mint-500 text-ink-950"
                  : active
                  ? "bg-mint-500/15 text-mint-400 ring-2 ring-mint-500 animate-pulseSoft"
                  : "bg-surface text-parchment/30 ring-1 ring-surface-border"
              }`}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <div className="pt-0.5">
              <p className={`text-sm font-medium ${active ? "text-mint-300" : done ? "text-parchment" : "text-parchment/40"}`}>
                {LABELS[s]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
