import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import AtletasPage from './pages/AtletasPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegistroPage from './pages/RegistroPage';
import DescargaApp from './pages/DescargarApp';
import ResumenInicio from './pages/ResumenInicio';
import AtletaDetalle from './pages/AtletaDetalle';
import EjerciciosPage from './pages/EjerciciosPages';
import RutinasPage from './pages/RutinasPage';
import AtletaLayout from './components/AtletaLayout';
import AtletaInicio from './pages/AtletaInicio';
import EjecutarRutina from './pages/EjecutarRutina';
import AtletaHistorial from './pages/AtletaHistorial';
import AtletaRutinaPreview from './components/AtletaRutinaPreview';
import EditarResultados from './pages/EditarResultados';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/descargar-app" element={<DescargaApp />} />
                
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ROLE_COACH', 'COACH']}><Dashboard /></ProtectedRoute>}>
                    <Route index element={<ResumenInicio />} /> 
                    <Route path="atletas" element={<AtletasPage />} />
                    <Route path="atletas/:id" element={<AtletaDetalle />} /> 
                    <Route path="ejercicios" element={<EjerciciosPage />} />
                    <Route path="rutinas" element={<RutinasPage />} />
                </Route>

                <Route path="/atleta" element={<ProtectedRoute allowedRoles={['ROLE_ALUMNO', 'ALUMNO']}><AtletaLayout /></ProtectedRoute>}>
                    <Route index element={<AtletaInicio />} /> 
                    <Route path="historial" element={<AtletaHistorial />} />
                    <Route path="rutina-activa" element={<EjecutarRutina />} />
                    <Route path="rutina-preview" element={<AtletaRutinaPreview />} />
                    <Route path="editar-resultados" element={<EditarResultados />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;