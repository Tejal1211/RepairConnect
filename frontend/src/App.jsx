import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Diagnose from "./pages/Diagnose.jsx";
import Analysis from "./pages/Analysis.jsx";
import FindExperts from "./pages/FindExperts.jsx";
import RepairRequest from "./pages/RepairRequest.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/diagnose" element={<Diagnose />} />
          <Route path="/analysis/:reportId" element={<Analysis />} />
          <Route path="/find-experts" element={<FindExperts />} />
          <Route path="/repair-request" element={<RepairRequest />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
