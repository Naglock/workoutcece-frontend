import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AtletaInicio from './AtletaInicio';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('jwt-decode', () => ({
    jwtDecode: vi.fn(),
}));

vi.mock('../services/api', () => ({
    default: {
        get: vi.fn(),
    },
}));

vi.mock('../components/AtletaProgresoSaltos', () => ({
    default: () => <div data-testid="mock-progreso-saltos">Progreso Saltos</div>
}));

describe('AtletaInicio Component', () => {
    const FAKE_DATE = new Date('2026-06-22T10:00:00'); 
    const HOY_ISO = '2026-06-22';
    const MANANA_ISO = '2026-06-23';

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        
        vi.useFakeTimers({ toFake: ['Date'] }); 
        vi.setSystemTime(FAKE_DATE);

        localStorage.setItem('token', 'token-atleta');
        jwtDecode.mockReturnValue({ userId: 1 });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <AtletaInicio />
            </BrowserRouter>
        );
    };

    it('Debe renderizar la estructura principal y mostrar estado de carga inicialmente', async () => {
        api.get.mockResolvedValueOnce({ data: [] });
        
        renderComponent();

        expect(screen.getByText('¡A romperla hoy, atleta!')).toBeInTheDocument();
        expect(screen.getByText('Sincronizando cronograma...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Sincronizando cronograma...')).not.toBeInTheDocument();
        });
    });

    it('Debe cargar y mostrar rutinas pendientes del día actual', async () => {
        const mockRoutines = [
            {
                id: 101,
                name: 'Potencia de Bloqueo',
                scheduledDate: `${HOY_ISO}T10:00:00Z`,
                estado: 'PENDIENTE',
                isCompleted: false,
                exercises: [1, 2, 3]
            }
        ];
        api.get.mockResolvedValueOnce({ data: mockRoutines });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Potencia de Bloqueo')).toBeInTheDocument();
            expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
            expect(screen.getByText('3 ejercicios asignados')).toBeInTheDocument();
        });
    });

    it('Debe navegar a previsualización si la rutina está pendiente al hacer click', async () => {
        const mockRoutines = [
            {
                id: 102,
                name: 'Fuerza Piernas',
                scheduledDate: `${HOY_ISO}T10:00:00Z`,
                estado: 'PENDIENTE',
                isCompleted: false
            }
        ];
        api.get.mockResolvedValueOnce({ data: mockRoutines });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Fuerza Piernas')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Fuerza Piernas'));
        expect(mockNavigate).toHaveBeenCalledWith('rutina-preview?id=102');
    });

    it('Debe navegar a edición de resultados si la rutina está completada', async () => {
        const mockRoutines = [
            {
                id: 105,
                name: 'Pliometría Central',
                scheduledDate: `${HOY_ISO}T10:00:00Z`,
                estado: 'COMPLETADO',
                isCompleted: true
            }
        ];
        api.get.mockResolvedValueOnce({ data: mockRoutines });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Pliometría Central')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Pliometría Central'));
        expect(mockNavigate).toHaveBeenCalledWith('editar-resultados?id=105');
    });

    it('Debe mostrar día libre si se selecciona una fecha sin rutinas', async () => {
        const mockRoutines = [
            {
                id: 101,
                name: 'Fuerza',
                scheduledDate: `${HOY_ISO}T10:00:00Z`,
                estado: 'PENDIENTE'
            }
        ];
        api.get.mockResolvedValueOnce({ data: mockRoutines });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Fuerza')).toBeInTheDocument();
        });

        const bubbles = screen.getAllByText('M');
        fireEvent.click(bubbles[0]); 

        expect(screen.getByText('Día libre. No hay entrenamientos agendados para esta fecha.')).toBeInTheDocument();
        expect(screen.queryByText('Fuerza')).not.toBeInTheDocument();
    });

    it('Debe calcular correctamente el porcentaje de cumplimiento semanal', async () => {
        const mockRoutines = [
            { id: 1, name: 'R1', scheduledDate: `${HOY_ISO}T10:00:00Z`, estado: 'COMPLETADO', isCompleted: true },
            { id: 2, name: 'R2', scheduledDate: `${MANANA_ISO}T10:00:00Z`, estado: 'PENDIENTE', isCompleted: false }
        ];
        api.get.mockResolvedValueOnce({ data: mockRoutines });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('1 de 2 entrenamientos')).toBeInTheDocument();
            expect(screen.getByText('50%')).toBeInTheDocument();
        });
    });
});