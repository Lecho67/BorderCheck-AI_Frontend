import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/layout/Navbar";
import { Pitch } from "./pages/Pitch";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Locker from "./pages/Locker";
import Documents from "./pages/Documents";
import Tools from "./pages/Tools";
// import Historial, Dashboard, ConsultaNueva según ya existan en tu proyecto

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Pitch />} />
          <Route path="/pitch" element={<Pitch />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/herramientas" element={<Tools />} />

          {/* Rutas privadas */}
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
          {/* Repite el mismo patrón para /dashboard/historial y /consulta/nueva
              si también deben ser privadas */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}