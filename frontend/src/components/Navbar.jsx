import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Wrench, Menu, X } from "lucide-react";

const links = [
  { to: "/diagnose", label: "Diagnose" },
  { to: "/find-experts", label: "Find Experts" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border/70 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint-500/15 text-mint-400 ring-1 ring-mint-500/30">
            <Wrench size={18} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">RepairConnect</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-mint-400" : "text-parchment/75 hover:text-parchment"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/diagnose" className="btn-primary !px-5 !py-2.5 text-sm">
            Diagnose My Item
          </Link>
        </nav>

        <button
          className="rounded-lg p-2 text-parchment md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-surface-border bg-ink-950 px-5 pb-5 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-mint-400" : "text-parchment/80"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/diagnose" onClick={() => setOpen(false)} className="btn-primary text-sm">
              Diagnose My Item
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
