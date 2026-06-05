import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" replace />;
    }
    try {
        const decoded = jwtDecode(token);

        if (allowedRoles && !allowedRoles.includes(decoded.role)) {
            return <Navigate to="/" replace />;
        }
        return children;
    } catch (error) {
        localStorage.removeItem('token'); 
        console.error("Error decodificando el token", error);
    }
};

export default ProtectedRoute;