import { useEffect, useState } from "react";
import { ScanLine, ShieldCheck, Cpu, FileText } from "lucide-react";

const STEPS = [
  { label: "Analyzing image...", icon: ScanLine },
  { label: "Checking image quality...", icon: ShieldCheck },
  { label: "Assessing visible damage...", icon: Cpu },
  { label: "Generating repair report...", icon: FileText },
];

export default function AnalysisLoader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 py-16 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-mint-500/20" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-mint-500/10 text-mint-400 ring-1 ring-mint-500/30">
          {(() => {
            const Icon = STEPS[step].icon;
            return <Icon size={30} />;
          })()}
        </span>
      </div>

      <div className="w-full space-y-3">
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${
              i === step
                ? "border-mint-500/40 bg-mint-500/5 text-mint-300"
                : i < step
                ? "border-surface-border text-parchment/40"
                : "border-surface-border text-parchment/25"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                i <= step ? "bg-mint-400" : "bg-parchment/20"
              } ${i === step ? "animate-pulseSoft" : ""}`}
            />
            {s.label}
          </div>
        ))}
      </div>

      <p className="font-mono text-xs text-parchment/40">
        This usually takes a few seconds.
      </p>
    </div>
  );
}
