import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <Wrench className="text-mint-400" size={32} />
      <h1 className="mt-4 font-display text-4xl font-bold">404</h1>
      <p className="mt-2 text-parchment/60">This page couldn't be found — maybe it needs repairing too.</p>
      <Link to="/" className="btn-primary mt-6">Back to Home</Link>
    </div>
  );
}
