// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');

    // Si no hay token, redirigimos al login
    if (!token) {
        return <Navigate to="/" replace />;
    }
    try {
        const decoded = jwtDecode(token);

        if (allowedRoles && !allowedRoles.includes(decoded.role)) {
            // Si el rol del usuario no está permitido, redirigimos al login
            return <Navigate to="/" replace />;
        }
        return children;
    } catch (error) {
        localStorage.removeItem('token'); // Si el token es inválido, lo eliminamos
        console.error("Error decodificando el token", error);
    }
};

export default ProtectedRoute;