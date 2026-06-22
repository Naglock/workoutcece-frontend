import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { jwtDecode } from 'jwt-decode';

vi.mock('jwt-decode', () => ({
    jwtDecode: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    Navigate: vi.fn(({ to }) => <div data-testid="navigate-mock">{to}</div>),
}));

describe('ProtectedRoute Component', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it('Debe redirigir a "/" si no hay token en el localStorage', () => {
        render(
            <ProtectedRoute allowedRoles={['ROLE_COACH']}>
                <div>Contenido Top Secret</div>
            </ProtectedRoute>
        );

        expect(screen.getByTestId('navigate-mock')).toHaveTextContent('/');
        expect(screen.queryByText('Contenido Top Secret')).not.toBeInTheDocument();
    });

    it('Debe renderizar los hijos (children) si el token y el rol son correctos', () => {
        localStorage.setItem('token', 'token-valido-123');
        jwtDecode.mockReturnValue({ role: 'ROLE_COACH' });

        render(
            <ProtectedRoute allowedRoles={['ROLE_COACH']}>
                <div>Panel del Coach</div>
            </ProtectedRoute>
        );

        expect(screen.getByText('Panel del Coach')).toBeInTheDocument();
        expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
    });

    it('Debe redirigir a "/" si el rol del token no está en allowedRoles', () => {
        localStorage.setItem('token', 'token-valido-123');
        jwtDecode.mockReturnValue({ role: 'ROLE_ALUMNO' });

        render(
            <ProtectedRoute allowedRoles={['ROLE_COACH']}>
                <div>Panel del Coach</div>
            </ProtectedRoute>
        );

        expect(screen.getByTestId('navigate-mock')).toHaveTextContent('/');
        expect(screen.queryByText('Panel del Coach')).not.toBeInTheDocument();
    });

    it('Debe borrar el token y manejar el error si el token es inválido/corrupto', () => {
        localStorage.setItem('token', 'token-corrupto');
        jwtDecode.mockImplementation(() => {
            throw new Error('Token malformado');
        });

        render(
            <ProtectedRoute allowedRoles={['ROLE_COACH']}>
                <div>Contenido</div>
            </ProtectedRoute>
        );

        expect(localStorage.getItem('token')).toBeNull();
        expect(console.error).toHaveBeenCalled();
    });
});