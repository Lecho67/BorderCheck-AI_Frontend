import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RequireCompliance } from "@/components/RequireCompliance";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/ToastContainer";
// Pitch es la home ("/" y "/pitch"): se carga eager para que la primera visita
// no vea un spinner. El resto de las vistas van por ruta con React.lazy.
import { Pitch } from "@/pages/Pitch";

const Landing = lazy(() => import("@/pages/Landing").then((m) => ({ default: m.Landing })));
const Login = lazy(() => import("@/pages/Login").then((m) => ({ default: m.Login })));
const ResetPassword = lazy(() => import("@/pages/ResetPassword").then((m) => ({ default: m.ResetPassword })));
const Register = lazy(() => import("@/pages/Register").then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const NewQuery = lazy(() => import("@/pages/NewQuery").then((m) => ({ default: m.NewQuery })));
const ResultView = lazy(() => import("@/pages/ResultView").then((m) => ({ default: m.ResultView })));
const History = lazy(() => import("@/pages/History").then((m) => ({ default: m.History })));
const Locker = lazy(() => import("@/pages/Locker"));
const Documents = lazy(() => import("@/pages/Documents"));
const Tools = lazy(() => import("@/pages/Tools"));
const SupportCenter = lazy(() => import("@/pages/SupportCenter").then((m) => ({ default: m.SupportCenter })));
const Profile = lazy(() => import("@/pages/Profile").then((m) => ({ default: m.Profile })));
const AdminPanel = lazy(() => import("@/pages/AdminPanel").then((m) => ({ default: m.AdminPanel })));
const GestorPanel = lazy(() => import("@/pages/GestorPanel").then((m) => ({ default: m.GestorPanel })));
const AgentPanel = lazy(() => import("@/pages/AgentPanel").then((m) => ({ default: m.AgentPanel })));
const AgentDocumentsPanel = lazy(() => import("@/pages/AgentDocumentsPanel").then((m) => ({ default: m.AgentDocumentsPanel })));
const AgentKycPanel = lazy(() => import("@/pages/AgentKycPanel").then((m) => ({ default: m.AgentKycPanel })));
// Reports arrastra powerbi-client + recharts: mantenerlo fuera del bundle inicial es clave.
const Reports = lazy(() => import("@/pages/Reports").then((m) => ({ default: m.Reports })));

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

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/pitch" element={<Pitch />} />
              <Route path="/" element={<Pitch />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/restablecer-contrasena" element={<ResetPassword />} />
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
                  <ProtectedRoute allowedRoles={["admin", "gestor"]}>
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
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestor"
                element={
                  <ProtectedRoute allowedRoles={["gestor", "admin"]}>
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
                  <ProtectedRoute allowedRoles={["agente", "admin"]}>
                    <AgentPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/panel-agente/documentos"
                element={
                  <ProtectedRoute allowedRoles={["agente", "admin"]}>
                    <AgentDocumentsPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/panel-agente/kyc"
                element={
                  <ProtectedRoute allowedRoles={["agente", "admin"]}>
                    <AgentKycPanel />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
