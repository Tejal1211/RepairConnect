import { Link } from "react-router-dom";
import {
  ScanEye, Camera, Sparkles, Scale, Users, Leaf,
  ArrowRight, ShieldCheck, Cpu, ClipboardList,
} from "lucide-react";

function MendDivider() {
  return (
    <svg viewBox="0 0 400 28" className="mend-divider" preserveAspectRatio="none" aria-hidden="true">
      <path className="mend-path" d="M0 14 L140 14 L155 4 L170 24 L185 4 L200 14 L400 14" />
    </svg>
  );
}

const FEATURES = [
  { icon: Camera, title: "Upload evidence", desc: "Snap a photo of the damage and describe what happened, in your own words." },
  { icon: Cpu, title: "OpenCV + Gemini analysis", desc: "Computer vision checks image quality; Gemini's multimodal AI reads the damage and your description together." },
  { icon: ClipboardList, title: "Structured repair report", desc: "Severity, possible cause, safety warnings, and an estimated repair cost range." },
  { icon: Scale, title: "Repair Score", desc: "A transparent, explainable score weighs cost, age, and severity into one clear recommendation." },
  { icon: Users, title: "Find repair experts", desc: "Compare nearby technicians by specialization, rating, and price." },
  { icon: Leaf, title: "Track & reduce waste", desc: "Follow your repair from request to completion, and see the waste you helped avoid." },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-surface-border">
        <div className="absolute inset-0 bg-grid-fade" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            <div>
              <span className="chip">
                <Sparkles size={13} /> RepairConnect 🔧
              </span>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Don't Replace It Yet.
                <br />
                <span className="text-mint-400">Find Out If It Can Be Repaired.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-parchment/65">
                Upload a photo, describe the problem, and get an AI-powered
                initial repair assessment with guidance on your next steps.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link to="/diagnose" className="btn-primary">
                  Diagnose My Item <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="btn-secondary">
                  How It Works
                </a>
              </div>

              <p className="mt-6 flex items-center gap-2 text-xs text-parchment/40">
                <ShieldCheck size={14} className="text-mint-400" />
                AI analysis is an initial assessment only, not a guaranteed professional diagnosis.
              </p>
            </div>

            {/* Hero illustration: a cracked-to-mended device silhouette */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="card relative overflow-hidden p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-parchment/40">repair_report.json</span>
                  <span className="chip !py-0.5 !text-[10px]">LIVE PREVIEW</span>
                </div>
                <svg viewBox="0 0 300 220" className="mt-6 w-full" aria-hidden="true">
                  <rect x="60" y="10" width="180" height="200" rx="18" fill="#182320" stroke="#233029" strokeWidth="2" />
                  <path
                    d="M150 30 L128 90 L156 96 L118 170"
                    fill="none"
                    stroke="#EF5350"
                    strokeWidth="3"
                    strokeDasharray="200"
                    strokeDashoffset="200"
                    className="animate-mend"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <path
                    d="M150 30 L128 90 L156 96 L118 170"
                    fill="none"
                    stroke="#2DD4A0"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    opacity="0.9"
                  />
                  <circle cx="150" cy="185" r="4" fill="#2DD4A0" className="animate-pulseSoft" />
                </svg>
                <div className="mt-4 space-y-2 font-mono text-xs text-parchment/55">
                  <p><span className="text-mint-400">severity:</span> "Medium"</p>
                  <p><span className="text-mint-400">repairability:</span> "Likely Repairable"</p>
                  <p><span className="text-mint-400">repair_score:</span> 78</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <p className="section-eyebrow text-center">How It Works</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl font-bold tracking-tight">
          From damaged item to decision, in minutes
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-500/10 text-mint-400">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-parchment/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 lg:px-8"><MendDivider /></div>

      {/* AI + CV EXPLANATION */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="section-eyebrow">AI + Computer Vision</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
              Two specialists, one report
            </h2>
            <p className="mt-4 leading-relaxed text-parchment/65">
              OpenCV checks whether your photo is sharp and well-lit enough to
              analyze — it doesn't diagnose anything itself. Once the image
              passes that check, Gemini's multimodal AI reads the processed
              photo together with your description to produce a structured
              repair report: visible damage, a possible issue, a possible
              cause, and clear next steps.
            </p>
            <p className="mt-4 text-sm text-parchment/45">
              Neither OpenCV nor Gemini can see inside your device. Treat every
              result as a starting point, not a certified diagnosis.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <ScanEye size={22} className="text-mint-400" />
              <h4 className="mt-3 font-display font-semibold">OpenCV</h4>
              <p className="mt-2 text-sm text-parchment/55">Blur detection, brightness checks, resizing, contrast enhancement.</p>
            </div>
            <div className="card p-6">
              <Sparkles size={22} className="text-mint-400" />
              <h4 className="mt-3 font-display font-semibold">Gemini</h4>
              <p className="mt-2 text-sm text-parchment/55">Multimodal reasoning over the image and your written description.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REPAIR/REPLACE EXPLANATION */}
      <section className="border-y border-surface-border bg-surface/40 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="card p-8">
                <p className="font-mono text-xs text-parchment/40">repair_score.py</p>
                <pre className="mt-4 overflow-x-auto text-xs leading-relaxed text-parchment/70">
{`score = (
  cost_to_value * 0.40 +
  item_age      * 0.20 +
  severity      * 0.15 +
  repairability * 0.15 +
  ai_confidence * 0.10
)`}
                </pre>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="section-eyebrow">Repair / Replace</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
                A transparent score, not a black box
              </h2>
              <p className="mt-4 leading-relaxed text-parchment/65">
                RepairConnect weighs repair cost against item value, age,
                damage severity, AI repairability, and confidence into one
                Repair Score from 0–100 — with plain-language reasoning for
                every point.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUSTAINABILITY */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8">
        <Leaf size={28} className="mx-auto text-mint-400" />
        <h2 className="mx-auto mt-4 max-w-xl font-display text-3xl font-bold tracking-tight">
          Repair, when it makes sense, is the greener choice
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-parchment/60">
          Potential waste avoided through successful repair decisions — every
          item kept in use a little longer is one less item in a landfill.
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 pb-24 lg:px-8">
        <div className="card flex flex-col items-center gap-6 p-12 text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Got something broken sitting around?
          </h2>
          <p className="max-w-md text-parchment/60">
            Find out in minutes whether it's worth fixing.
          </p>
          <Link to="/diagnose" className="btn-primary">
            Diagnose My Item <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
