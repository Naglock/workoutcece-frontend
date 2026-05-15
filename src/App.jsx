import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AtletasPage from './pages/AtletasPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegistroPage from './pages/RegistroPage';
import DescargaApp from './pages/DescargarApp';
import ResumenInicio from './pages/ResumenInicio';
import AtletaDetalle from './pages/AtletaDetalle';
import EjerciciosPage from './pages/EjerciciosPages';
import RutinasPage from './pages/RutinasPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroPage />} /> 
                <Route path="/descargar-app" element={<DescargaApp />} />
                {/* Ruta protegida principal */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['ROLE_COACH', 'COACH']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                >
                    <Route index element={<ResumenInicio />} /> 
                    <Route path="atletas" element={<AtletasPage />} />
                    <Route path="atletas/:id" element={<AtletaDetalle />} /> 
                    <Route path="ejercicios" element={<EjerciciosPage />} />
                    <Route path="rutinas" element={<RutinasPage />} />
                </Route>

                <Route path="*" element={<LoginPage />} />
            </Routes>
        </Router>
    );
}

export default App;