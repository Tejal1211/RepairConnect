import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smartphone, Laptop, Tablet, Tv, Refrigerator, WashingMachine,
  Bike, Sofa, MoreHorizontal, ArrowLeft, ArrowRight, AlertTriangle,
} from "lucide-react";
import ImageUploader from "../components/ImageUploader.jsx";
import AnalysisLoader from "../components/AnalysisLoader.jsx";
import { api, ApiError } from "../services/api.js";

const CATEGORIES = [
  { value: "Smartphone", icon: Smartphone },
  { value: "Laptop", icon: Laptop },
  { value: "Tablet", icon: Tablet },
  { value: "Television", icon: Tv },
  { value: "Refrigerator", icon: Refrigerator },
  { value: "Washing Machine", icon: WashingMachine },
  { value: "Bicycle", icon: Bike },
  { value: "Furniture", icon: Sofa },
  { value: "Other", icon: MoreHorizontal },
];

const STEP_TITLES = ["Item Type", "Item Details", "Upload Image", "Describe Problem"];

export default function Diagnose() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    item_category: "",
    item_name: "",
    brand: "",
    model: "",
    item_age_years: "",
    estimated_current_value: "",
    purchase_price: "",
    image: null,
    description: "",
    when_occurred: "",
    how_it_happened: "",
    still_functioning: "",
  });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.item_category;
    if (step === 1) return form.item_name.trim().length > 0;
    if (step === 2) return !!form.image;
    if (step === 3) return form.description.trim().length > 5;
    return true;
  };

  async function handleSubmit() {
    setErrorMsg("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("image", form.image);
      fd.append("item_name", form.item_name);
      fd.append("item_category", form.item_category);
      fd.append("brand", form.brand);
      fd.append("model", form.model);
      fd.append("item_age_years", form.item_age_years || 0);
      fd.append("estimated_current_value", form.estimated_current_value || 0);
      fd.append("purchase_price", form.purchase_price || 0);
      fd.append("description", form.description);
      fd.append("when_occurred", form.when_occurred);
      fd.append("how_it_happened", form.how_it_happened);
      fd.append("still_functioning", form.still_functioning);

      const result = await api.analyzeItem(fd);
      navigate(`/analysis/${result.report_id}`, { state: { report: result } });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.payload?.detail?.error === "image_quality_too_low") {
        setErrorMsg(err.payload.detail.message || "Please upload a clearer image.");
        setStep(2);
      } else {
        setErrorMsg(err.message || "Something went wrong while analyzing your item.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
        <AnalysisLoader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 lg:px-8">
      <p className="section-eyebrow">Diagnose Item</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Tell us what happened</h1>

      {/* Progress */}
      <div className="mt-8 flex items-center gap-2">
        {STEP_TITLES.map((t, i) => (
          <div key={t} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? "bg-mint-500 text-ink-950" : "bg-surface text-parchment/35 ring-1 ring-surface-border"
              }`}
            >
              {i + 1}
            </div>
            {i < STEP_TITLES.length - 1 && (
              <div className={`h-0.5 flex-1 ${i < step ? "bg-mint-500" : "bg-surface-border"}`} />
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-parchment/40">{STEP_TITLES[step]}</p>

      {errorMsg && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-clay-500/30 bg-clay-500/5 px-4 py-3 text-sm text-clay-400">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="card mt-6 p-6 sm:p-8">
        {step === 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold">Select item type</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set("item_category")(c.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-5 text-sm transition ${
                    form.item_category === c.value
                      ? "border-mint-500 bg-mint-500/10 text-mint-300"
                      : "border-surface-border text-parchment/70 hover:border-mint-500/40"
                  }`}
                >
                  <c.icon size={22} />
                  {c.value}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-lg font-semibold">Item details</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Item name" required value={form.item_name} onChange={set("item_name")} placeholder="e.g. My laptop" />
              <Field label="Brand" value={form.brand} onChange={set("brand")} placeholder="e.g. Dell" />
              <Field label="Model" value={form.model} onChange={set("model")} placeholder="e.g. Inspiron 15" />
              <Field label="Approximate age (years)" type="number" value={form.item_age_years} onChange={set("item_age_years")} placeholder="2" />
              <Field label="Estimated current value (₹)" type="number" value={form.estimated_current_value} onChange={set("estimated_current_value")} placeholder="25000" />
              <Field label="Purchase price (₹)" type="number" value={form.purchase_price} onChange={set("purchase_price")} placeholder="45000" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-lg font-semibold">Upload a photo of the damage</h2>
            <p className="mt-1 text-sm text-parchment/50">A clear, well-lit photo gives the most reliable assessment.</p>
            <div className="mt-5">
              <ImageUploader file={form.image} onChange={set("image")} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-lg font-semibold">Describe the problem</h2>
            <textarea
              className="mt-4 w-full rounded-xl border border-surface-border bg-ink-900 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-mint-500"
              rows={5}
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="Example: My laptop fell from a table. The screen is cracked, flickering, and showing horizontal lines."
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="When did the problem occur?" value={form.when_occurred} onChange={set("when_occurred")} placeholder="Yesterday" />
              <Field label="How did the damage happen?" value={form.how_it_happened} onChange={set("how_it_happened")} placeholder="Dropped it" />
              <div>
                <label className="text-sm font-medium text-parchment/75">Is the item still functioning?</label>
                <select
                  className="mt-2 w-full rounded-xl border border-surface-border bg-ink-900 px-4 py-3 text-sm text-parchment focus:border-mint-500"
                  value={form.still_functioning}
                  onChange={(e) => set("still_functioning")(e.target.value)}
                >
                  <option value="">Not sure</option>
                  <option value="true">Yes, partially or fully</option>
                  <option value="false">No, not at all</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-30"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => canNext() && setStep((s) => s + 1)}
              disabled={!canNext()}
              className="btn-primary !px-5 !py-2.5 text-sm"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canNext()}
              className="btn-primary !px-6 !py-2.5 text-sm"
            >
              Analyze My Item <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-parchment/75">
        {label} {required && <span className="text-clay-400">*</span>}
      </label>
      <input
        className="mt-2 w-full rounded-xl border border-surface-border bg-ink-900 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-mint-500"
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}
