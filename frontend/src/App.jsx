import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authRoutes } from "./modules/auth/routes";
import { portalAlumnoRoutes } from "./modules/portal-alumno/routes";
import { reinscripcionRoutes } from "./modules/reinscripcion/routes";
import { solicitudesRoutes } from "./modules/solicitudes/routes";
import { coordinacionRoutes } from "./modules/coordinacion/routes";
import { pagosRoutes } from "./modules/pagos/routes";
import { reportesRoutes } from "./modules/reportes/routes";
import { notificacionesRoutes } from "./modules/notificaciones/routes";

const allRoutes = [
  ...authRoutes,
  ...portalAlumnoRoutes,
  ...reinscripcionRoutes,
  ...solicitudesRoutes,
  ...coordinacionRoutes,
  ...pagosRoutes,
  ...reportesRoutes,
  ...notificacionesRoutes,
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {allRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}