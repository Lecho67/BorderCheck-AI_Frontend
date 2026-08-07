import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import Locker from "./pages/Locker";
import Documents from "./pages/Documents";
import Tools from "./pages/Tools";

import { AdminPanel } from "@/pages/AdminPanel";
import { GestorPanel } from "@/pages/GestorPanel";
import { AgentPanel } from "@/pages/AgentPanel";
import { AgentDocumentsPanel } from "@/pages/AgentDocumentsPanel";


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
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/pitch" element={<Pitch />} />
            <Route path="/" element={<Pitch />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/herramientas" element={<Tools />} />

            {/* Rutas privadas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/historial"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consulta/nueva"
              element={
                <ProtectedRoute>
                  <NewQuery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consulta/:id"
              element={
                <ProtectedRoute>
                  <ResultView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casillero"
              element={
                <ProtectedRoute>
                  <Locker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documentos"
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              }
              
            />
            <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gestor"
                  element={
                    <ProtectedRoute allowedRoles={['gestor']}>
                      <GestorPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/panel-agente"
                  element={
                    <ProtectedRoute allowedRoles={['agente', 'admin']}>
                      <AgentPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
  path="/panel-agente/documentos"
  element={
    <ProtectedRoute allowedRoles={['agente', 'admin']}>
      <AgentDocumentsPanel />
    </ProtectedRoute>
  }
/>
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}