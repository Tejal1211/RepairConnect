const RECOMMENDATION_META = {
  REPAIR: { label: "REPAIR RECOMMENDED", dot: "🟢", color: "text-mint-400", ring: "#2DD4A0" },
  PROFESSIONAL_INSPECTION_RECOMMENDED: { label: "PROFESSIONAL INSPECTION RECOMMENDED", dot: "🟠", color: "text-amber-400", ring: "#F2A93B" },
  REPLACE_OR_RECYCLE: { label: "REPLACE OR RECYCLE", dot: "🔴", color: "text-clay-400", ring: "#EF5350" },
};

export default function RepairScore({ score, recommendation, reasoning = [] }) {
  const meta = RECOMMENDATION_META[recommendation] || RECOMMENDATION_META.PROFESSIONAL_INSPECTION_RECOMMENDED;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card flex flex-col items-center gap-6 p-8 text-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#233029" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={meta.ring}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-display text-4xl font-bold">{score}</span>
          <span className="font-mono text-xs text-parchment/45">/ 100</span>
        </div>
      </div>

      <div>
        <p className={`font-display text-lg font-semibold ${meta.color}`}>
          {meta.dot} {meta.label}
        </p>
      </div>

      {reasoning.length > 0 && (
        <ul className="w-full space-y-2 text-left text-sm text-parchment/70">
          {reasoning.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-mint-400" />
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
