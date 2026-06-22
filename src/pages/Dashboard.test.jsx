import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { jwtDecode } from 'jwt-decode';
const mockNavigate = vi.fn();
let mockLocation = { pathname: '/dashboard' };

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => mockLocation,
        Outlet: () => <div data-testid="outlet-mock">Contenido Dinámico</div>
    };
});
vi.mock('jwt-decode', () => ({
    jwtDecode: vi.fn(),
}));

describe('Dashboard Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockLocation = { pathname: '/dashboard' }; 
    });

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );
    };

    it('Debe decodificar el token al montar (useEffect) y mostrar el nombre del coach', () => {
        localStorage.setItem('token', 'token-valido');
        jwtDecode.mockReturnValue({ sub: 'coach_experto', role: 'ROLE_COACH' });

        renderComponent();
        expect(jwtDecode).toHaveBeenCalledWith('token-valido');
        expect(screen.getByText('👤 coach_experto')).toBeInTheDocument();
        expect(screen.getByText('ROLE_COACH')).toBeInTheDocument();
        expect(screen.getByTestId('outlet-mock')).toBeInTheDocument();
    });

    it('Debe navegar a las diferentes secciones del menú', () => {
        renderComponent();
        const btnAtletas = screen.getByRole('button', { name: /mis atletas/i });
        fireEvent.click(btnAtletas);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/atletas');
        const btnPlanificador = screen.getByRole('button', { name: /planificador de rutinas/i });
        fireEvent.click(btnPlanificador);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/rutinas');
    });

    it('Debe cambiar el título del Header dependiendo de la ruta actual (useLocation)', () => {
        mockLocation = { pathname: '/dashboard/atletas' };
        
        renderComponent();
        expect(screen.getByText('Gestión de Atletas')).toBeInTheDocument();
        expect(screen.queryByText('Panel de Control')).not.toBeInTheDocument();
    });

    it('Debe cerrar sesión, borrar el localStorage y redirigir al Login', () => {
        localStorage.setItem('token', 'token-a-borrar');
        renderComponent();

        const btnLogout = screen.getByRole('button', { name: /cerrar sesión/i });
        fireEvent.click(btnLogout);

        expect(localStorage.getItem('token')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});