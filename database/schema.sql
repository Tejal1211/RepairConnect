-- =============================================================================
-- RepairConnect - Supabase / PostgreSQL schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- =============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- users  (Supabase Auth already provides auth.users; this table stores
-- app-specific profile data and is optionally linked to auth.users.id)
-- ---------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- repair_requests
-- ---------------------------------------------------------------------------
create table if not exists repair_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  item_name text not null,
  item_category text not null,
  brand text,
  model text,
  item_age numeric default 0,
  estimated_value numeric default 0,
  description text,
  image_url text,
  technician_id uuid,
  technician_name text,
  preferred_date date,
  notes text,
  report_id uuid,
  status text not null default 'REQUEST_SUBMITTED'
    check (status in (
      'REQUEST_SUBMITTED', 'TECHNICIAN_REVIEW', 'INSPECTION_SCHEDULED',
      'INSPECTION_IN_PROGRESS', 'REPAIR_APPROVED', 'REPAIR_IN_PROGRESS',
      'READY_FOR_COLLECTION', 'COMPLETED'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- repair_reports  (AI-generated assessment + score, one per diagnosis)
-- ---------------------------------------------------------------------------
create table if not exists repair_reports (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid unique not null default uuid_generate_v4(),
  repair_request_id uuid references repair_requests(id) on delete cascade,
  mode text not null default 'demo' check (mode in ('live', 'demo')),
  item_details jsonb,
  visible_damage text,
  possible_issue text,
  possible_cause text,
  severity text check (severity in ('Low', 'Medium', 'High')),
  repairability text check (repairability in (
    'Likely Repairable', 'Possibly Repairable', 'Uncertain', 'Unlikely Repairable'
  )),
  confidence int check (confidence between 0 and 100),
  safe_next_steps jsonb default '[]',
  warnings jsonb default '[]',
  professional_help_required boolean default false,
  estimated_min_cost numeric,
  estimated_max_cost numeric,
  analysis_disclaimer text,
  image_quality jsonb,
  repair_score int check (repair_score between 0 and 100),
  recommendation text check (recommendation in (
    'REPAIR', 'PROFESSIONAL_INSPECTION_RECOMMENDED', 'REPLACE_OR_RECYCLE'
  )),
  reasoning jsonb default '[]',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- technicians
-- ---------------------------------------------------------------------------
create table if not exists technicians (
  id text primary key,
  name text not null,
  specialization text not null,
  phone text,
  address text,
  latitude double precision,
  longitude double precision,
  rating numeric default 4.5,
  estimated_min_cost numeric default 0,
  estimated_max_cost numeric default 0,
  available boolean default true,
  created_at timestamptz not null default now()
);

-- Foreign key from repair_requests -> technicians (added after both tables exist)
alter table repair_requests
  add constraint fk_repair_requests_technician
  foreign key (technician_id) references technicians(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_repair_requests_status on repair_requests(status);
create index if not exists idx_repair_requests_user on repair_requests(user_id);
create index if not exists idx_repair_reports_request on repair_reports(repair_request_id);
create index if not exists idx_technicians_specialization on technicians(specialization);

-- ---------------------------------------------------------------------------
-- Sample technician data (used if you want live Supabase data instead of
-- the backend's in-memory sample fallback)
-- ---------------------------------------------------------------------------
insert into technicians (id, name, specialization, phone, address, latitude, longitude, rating, estimated_min_cost, estimated_max_cost, available)
values
  ('tech-001', 'Chetan Electronics Repair', 'Smartphone & Laptop', '+91 98200 11122', 'Andheri West, Mumbai', 19.1364, 72.8296, 4.7, 500, 6000, true),
  ('tech-002', 'QuickFix Appliance Care', 'Refrigerator & Washing Machine', '+91 98670 44551', 'Bandra East, Mumbai', 19.0596, 72.8656, 4.4, 800, 5000, true),
  ('tech-003', 'ScreenSavers TV & Display', 'Television', '+91 99870 33221', 'Powai, Mumbai', 19.1176, 72.9060, 4.6, 1000, 9000, true),
  ('tech-004', 'CycleWorks Bike Studio', 'Bicycle', '+91 90040 12345', 'Dadar, Mumbai', 19.0176, 72.8438, 4.8, 200, 2500, true),
  ('tech-005', 'Urban Furniture Restorers', 'Furniture', '+91 98200 99887', 'Malad West, Mumbai', 19.1863, 72.8489, 4.3, 300, 4000, false),
  ('tech-006', 'TechMed Mobile Clinic', 'Smartphone & Tablet', '+91 91367 22110', 'Ghatkopar, Mumbai', 19.0864, 72.9081, 4.5, 400, 5500, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security (adjust policies to your auth model before going live)
-- ---------------------------------------------------------------------------
alter table users enable row level security;
alter table repair_requests enable row level security;
alter table repair_reports enable row level security;
alter table technicians enable row level security;

-- Public read access to technicians (needed for the "Find Experts" page)
create policy "Public can read technicians" on technicians
  for select using (true);

-- Users can manage only their own requests/reports (example policy - adapt
-- once Supabase Auth is wired into the FastAPI backend with JWT verification)
create policy "Users manage own repair requests" on repair_requests
  for all using (auth.uid() = user_id);

create policy "Users read own repair reports" on repair_reports
  for select using (
    repair_request_id in (select id from repair_requests where user_id = auth.uid())
  );
