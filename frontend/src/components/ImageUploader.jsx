import { useRef, useState } from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";

const MAX_MB = 10;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploader({ file, onChange, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState("");

  const preview = file ? URL.createObjectURL(file) : null;

  function validateAndSet(f) {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setLocalError("Please upload a JPEG, PNG, or WEBP image.");
      return;
    }
    if (f.size / (1024 * 1024) > MAX_MB) {
      setLocalError(`Image is too large. Please keep it under ${MAX_MB}MB.`);
      return;
    }
    setLocalError("");
    onChange(f);
  }

  return (
    <div>
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            validateAndSet(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
            dragOver ? "border-mint-500 bg-mint-500/5" : "border-surface-border bg-surface/50 hover:border-mint-500/50"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-500/10 text-mint-400">
            <UploadCloud size={26} />
          </span>
          <p className="font-medium text-parchment">Drag and drop your photo here</p>
          <p className="text-sm text-parchment/50">or click to browse · JPEG, PNG, WEBP · up to {MAX_MB}MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => validateAndSet(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface/50">
          <img src={preview} alt="Uploaded item damage preview" className="max-h-96 w-full object-contain" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/80 text-parchment ring-1 ring-surface-border hover:bg-clay-500/80"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 border-t border-surface-border bg-surface/80 px-4 py-2 text-xs text-parchment/60">
            <ImageIcon size={14} />
            {file.name} · {(file.size / (1024 * 1024)).toFixed(1)}MB
          </div>
        </div>
      )}
      {(localError || error) && (
        <p className="mt-2 text-sm text-clay-400">{localError || error}</p>
      )}
    </div>
  );
}
