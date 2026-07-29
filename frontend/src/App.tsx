import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { NewQuery } from "@/pages/NewQuery";
import { ResultView } from "@/pages/ResultView";
import { History } from "@/pages/History";
import { Pitch } from "@/pages/Pitch";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/historial" element={<History />} />
          <Route path="/consulta/nueva" element={<NewQuery />} />
          <Route path="/consulta/:id" element={<ResultView />} />
          <Route path="/pitch" element={<Pitch />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
