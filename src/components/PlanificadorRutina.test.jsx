import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlanificadorRutina from './PlanificadorRutina';
import api from '../services/api';
vi.mock('../services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn()
    }
}));

describe('PlanificadorRutina Component', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        api.get.mockImplementation((url) => {
            if (url === '/exercises') {
                return Promise.resolve({ 
                    data: [
                        { id: 1, name: 'Sentadilla Libre' }, 
                        { id: 2, name: 'Press Banca' }
                    ] 
                });
            }
            if (url.includes('/analytics/rm-progress/')) {
                return Promise.resolve({ data: [{ lastEstimatedRm: 100 }] });
            }
            return Promise.resolve({ data: [] });
        });
    });

    afterEach(() => {
        window.alert.mockRestore();
    });

    it('Debe renderizar con el estado inicial y cargar la librería de ejercicios', async () => {
        render(<PlanificadorRutina alumnoId={1} />);
        expect(screen.getByLabelText(/nombre de la rutina/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/fecha de ejecución/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('Bloque A')).toBeInTheDocument();
        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/exercises');
        });
    });

    it('Debe permitir añadir y eliminar bloques', () => {
        render(<PlanificadorRutina alumnoId={1} />);
        const btnAddBlock = screen.getByRole('button', { name: /\+ añadir nuevo bloque/i });
        fireEvent.click(btnAddBlock);
        expect(screen.getByDisplayValue('Bloque B')).toBeInTheDocument();
        const deleteButtons = screen.getAllByRole('button', { name: /🗑️ eliminar bloque/i });
        fireEvent.click(deleteButtons[1]); 
        expect(screen.queryByDisplayValue('Bloque B')).not.toBeInTheDocument();
    });

    it('Debe mostrar alerta si se intenta guardar sin nombre', async () => {
        render(<PlanificadorRutina alumnoId={1} />);

        const saveButton = screen.getByRole('button', { name: /🚀 asignar planificación/i });
        fireEvent.click(saveButton);

        expect(window.alert).toHaveBeenCalledWith("Por favor, ingresa el nombre de la rutina.");
        expect(api.post).not.toHaveBeenCalled();
    });

    it('Debe mostrar alerta si se intenta guardar sin fecha en modo normal', async () => {
        render(<PlanificadorRutina alumnoId={1} />);
        const nameInput = screen.getByPlaceholderText('Ej: Fuerza Máxima Centrales');
        fireEvent.change(nameInput, { target: { value: 'Rutina Potencia' } });

        const saveButton = screen.getByRole('button', { name: /🚀 asignar planificación/i });
        fireEvent.click(saveButton);

        expect(window.alert).toHaveBeenCalledWith("Por favor, selecciona una fecha.");
        expect(api.post).not.toHaveBeenCalled();
    });

    it('Debe guardar exitosamente una rutina completando nombre y fecha', async () => {
        const mockOnSaveSuccess = vi.fn();
        api.post.mockResolvedValueOnce({ data: { id: 99 } });

        render(<PlanificadorRutina alumnoId={1} onSaveSuccess={mockOnSaveSuccess} />);
        fireEvent.change(screen.getByPlaceholderText('Ej: Fuerza Máxima Centrales'), { target: { value: 'Día de Piernas' } });
        const dateInput = document.querySelector('input[type="date"]');
        fireEvent.change(dateInput, { target: { value: '2026-10-15' } });
        fireEvent.click(screen.getByRole('button', { name: /🚀 asignar planificación/i }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/workouts/create/1', expect.objectContaining({
                name: 'Día de Piernas',
                scheduledDate: '2026-10-15',
                template: false
            }));
            expect(window.alert).toHaveBeenCalledWith("¡Planificación guardada con éxito!");
            expect(mockOnSaveSuccess).toHaveBeenCalled();
        });
    });

    it('Debe renderizar en modo plantilla y guardar usando el endpoint correcto', async () => {
        render(<PlanificadorRutina alumnoId={null} isTemplateMode={true} />);

        expect(screen.queryByLabelText(/fecha de ejecución/i)).not.toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText('Ej: Fuerza Máxima Centrales'), { target: { value: 'Plantilla Base' } });
        
        api.post.mockResolvedValueOnce({ data: { id: 88 } });
        fireEvent.click(screen.getByRole('button', { name: /💾 guardar plantilla/i }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/workouts/create-template', expect.objectContaining({
                name: 'Plantilla Base',
                scheduledDate: null,
                template: true
            }));
        });
    });
});