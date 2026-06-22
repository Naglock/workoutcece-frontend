import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../services/api', () => ({
    default: {
        post: vi.fn(),
    },
}));

vi.mock('jwt-decode', () => ({
    jwtDecode: vi.fn(),
}));

describe('LoginPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });
    const renderComponent = () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );
    };

    it('Debe renderizar el formulario correctamente', () => {
        renderComponent();
        
        expect(screen.getByText('WorkoutCeCeApp')).toBeInTheDocument();
        expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
    });

    it('Debe iniciar sesión como COACH y redirigir al dashboard', async () => {
        api.post.mockResolvedValueOnce({ data: { token: 'token-falso-123' } });
        jwtDecode.mockReturnValueOnce({ role: 'ROLE_COACH' });

        renderComponent();
        fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'ivan.coach' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
        expect(screen.getByRole('button', { name: /conectando/i })).toBeInTheDocument();
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'ivan.coach', password: 'password123' });
            expect(localStorage.getItem('token')).toBe('token-falso-123');
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('Debe mostrar error 401 si las credenciales son incorrectas', async () => {
        const axiosError = { response: { status: 401 } };
        api.post.mockRejectedValueOnce(axiosError);

        renderComponent();

        fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'usuario.malo' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'clavemala' } });
        fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
        await waitFor(() => {
            expect(screen.getByText('Usuario o contraseña incorrectos.')).toBeInTheDocument();
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});