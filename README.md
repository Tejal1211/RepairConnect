# RepairConnect 🔧

RepairConnect is an AI-powered platform that helps people decide whether a
damaged electronic device or household item is worth repairing.

**Flow:** Damaged Item → Upload Evidence → AI Analysis → Repair Report →
Repair/Replace Decision → Find Repair Expert → Create Repair Request → Track
Repair Status.

> AI analysis is an initial assessment only, not a guaranteed professional
> diagnosis. Always consult a qualified technician before making final repair
> decisions.

---

## 1. Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- (Optional, for full "live" mode) A **Gemini API key** and a **Supabase**
  project

RepairConnect runs a complete, working demo **without** any of the optional
credentials — see "Demo mode" below.

---

## 2. Project Architecture

```
repairconnect/
├── frontend/        React + Vite + Tailwind (port 5173)
├── backend/          FastAPI + OpenCV + Gemini (port 8000)
└── database/         schema.sql for Supabase / PostgreSQL
```

Request flow: the frontend calls the FastAPI backend, which runs the image
through OpenCV (`image_processor.py`) for a quality check, sends the
processed image + form data to Gemini (`gemini_service.py`) for a structured
JSON repair report, scores it with the transparent, rule-based
`repair_engine.py`, and persists everything through `data_store.py` (Supabase
if configured, otherwise in-memory).

---

## 3. Backend installation

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## 4. Frontend installation

```bash
cd frontend
npm install
cp .env.example .env
```

---

## 5. Creating environment variables

**backend/.env**
```
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
GOOGLE_MAPS_API_KEY=
FRONTEND_URL=http://localhost:5173
FORCE_DEMO_MODE=false
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=
```

Never commit real `.env` files — only the `.env.example` templates are
checked in.

---

## 6. Setting up Gemini API (optional — for live AI analysis)

1. Go to https://aistudio.google.com/app/apikey and create an API key.
2. Paste it into `backend/.env` as `GEMINI_API_KEY=...`.
3. Restart the backend. `/health` will report `"gemini_mode": "live"`.

If you skip this step, RepairConnect automatically uses a clearly-labeled
**demo/mock mode** rule-based analyzer so the full flow still works — every
response in that mode says `"mode": "demo"` and every report includes a demo
disclaimer.

---

## 7. Setting up Supabase (optional — for persistent storage)

1. Create a project at https://supabase.com.
2. Open **SQL Editor** and run the contents of `database/schema.sql`. This
   creates `users`, `repair_requests`, `repair_reports`, and `technicians`
   tables (with sample technician rows), indexes, and RLS policies.
3. Copy your **Project URL** and **anon/service key** from
   Project Settings → API into `backend/.env` as `SUPABASE_URL` /
   `SUPABASE_KEY`.
4. (Optional) Create a public Storage bucket if you want to upload the raw
   images to Supabase Storage instead of local disk — the `image_processor`
   currently writes processed images to `backend/static/processed/`.

Without Supabase configured, the backend uses an in-memory store (reports and
requests persist for the life of the server process) plus a built-in sample
technician list, so the whole app still works for local development.

---

## 8. Running the backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive API docs, and
`http://localhost:8000/health` to see which mode each subsystem is running in.

---

## 9. Running the frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`.

---

## 10. Testing image analysis

1. Go to `/diagnose`, pick an item type, fill in details, upload a photo, and
   describe the problem.
2. Submit — you'll see the animated "Analyzing image... / Checking image
   quality... / Assessing visible damage... / Generating repair report..."
   loader.
3. You'll land on `/analysis/:reportId` with the full structured report,
   Repair Score, safety warnings, and cost estimate.
4. From there, click **Find Repair Experts** to browse/filter technicians,
   then **Request Repair** to submit a repair request and see it appear in
   `/dashboard` with a live status timeline.

You can also test the API directly:

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "image=@/path/to/photo.jpg;type=image/jpeg" \
  -F "item_name=My Phone" \
  -F "item_category=Smartphone" \
  -F "item_age_years=1.5" \
  -F "estimated_current_value=20000" \
  -F "description=Phone fell from table, screen is cracked and flickering with lines"
```

---

## API Reference

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Reports live/demo mode for each subsystem |
| POST | `/api/analyze` | Upload image + item details → full repair report |
| GET | `/api/reports/{report_id}` | Fetch a saved report |
| POST | `/api/repair-score` | Recompute the repair score standalone |
| GET | `/api/technicians` | List/filter technicians |
| GET | `/api/technicians/{id}` | Technician detail |
| POST | `/api/repair-requests` | Create a repair request |
| GET | `/api/repair-requests/{id}` | Fetch a repair request |
| PATCH | `/api/repair-requests/{id}/status` | Update request status |
| GET | `/api/dashboard` | Aggregate stats for the dashboard |

---

## Notes on demo/mock mode

RepairConnect never fakes a "live" AI response. Every `/api/analyze` result
includes a `mode` field (`"live"` or `"demo"`), and demo-mode reports carry an
explicit disclaimer in `analysis_disclaimer`. The same principle applies to
maps (`maps_enabled` in `/api/technicians`) and storage (Supabase vs.
in-memory) — the frontend surfaces this to the user rather than hiding it.

## License

MIT — build on this freely for your own projects.
