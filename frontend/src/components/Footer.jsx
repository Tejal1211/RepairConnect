import { Link } from "react-router-dom";
import { Wrench, Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-ink-950">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint-500/15 text-mint-400 ring-1 ring-mint-500/30">
                <Wrench size={16} />
              </span>
              <span className="font-display text-base font-semibold">RepairConnect</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-parchment/60">
              An AI-assisted first step for repair decisions — never a
              replacement for a qualified technician's judgment.
            </p>
          </div>

          <div>
            <p className="section-eyebrow">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-parchment/65">
              <li><Link to="/diagnose" className="hover:text-mint-300">Diagnose an item</Link></li>
              <li><Link to="/find-experts" className="hover:text-mint-300">Find repair experts</Link></li>
              <li><Link to="/dashboard" className="hover:text-mint-300">Your dashboard</Link></li>
            </ul>
          </div>

          <div>
            <p className="section-eyebrow">How it works</p>
            <ul className="mt-4 space-y-2 text-sm text-parchment/65">
              <li>Upload evidence</li>
              <li>AI + computer vision analysis</li>
              <li>Repair / replace guidance</li>
            </ul>
          </div>

          <div>
            <p className="section-eyebrow">Sustainability</p>
            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-parchment/65">
              <Leaf size={16} className="mt-0.5 shrink-0 text-mint-400" />
              Every repair chosen over a replacement is a small step toward
              less electronic waste.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-surface-border pt-6 text-xs text-parchment/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} RepairConnect. AI analysis is an initial assessment only, not a guaranteed professional diagnosis.</p>
          <p className="font-mono">Built with FastAPI · Gemini · OpenCV · Supabase</p>
        </div>
      </div>
    </footer>
  );
}
