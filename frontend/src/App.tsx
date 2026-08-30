import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/ToastContainer";
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
import { SupportCenter } from "@/pages/SupportCenter";
import { Profile } from "@/pages/Profile";
import { RequireCompliance } from "@/components/RequireCompliance";
import { AdminPanel } from "@/pages/AdminPanel";
import { GestorPanel } from "@/pages/GestorPanel";
import { AgentPanel } from "@/pages/AgentPanel";
import { AgentDocumentsPanel } from "@/pages/AgentDocumentsPanel";
import { Reports } from "@/pages/Reports";


function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <ToastContainer />
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
            <Route path="/soporte" element={<SupportCenter />} />
            

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
              path="/reportes"
              element={
                <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                  <Reports />
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
            {/* Perfil de usuario (todos los roles autenticados) */}
                  <Route
                    path="/perfil"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Casillero: protegido además por RequireCompliance (Ley 1581 de 2012) */}
                  <Route
                    path="/casillero"
                    element={
                      <ProtectedRoute>
                        <RequireCompliance>
                          <Locker />
                        </RequireCompliance>
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