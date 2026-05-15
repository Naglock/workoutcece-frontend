export const colors = {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    success: '#10b981',
    danger: '#ef4444',
    dangerLight: '#fee2e2',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    background: '#f8fafc',
    surface: '#ffffff',
    textDark: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    disabledBg: '#f1f5f9'
};

export const globalStyles = {
    // 1. Contenedores Base 
    pageContainer: { padding: '20px', backgroundColor: colors.background, minHeight: '100vh', textAlign: 'left', fontFamily: 'system-ui, -apple-system, sans-serif' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: colors.surface, padding: '20px 25px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' },
    title: { margin: 0, color: colors.textDark, fontSize: '24px', fontWeight: 'bold' },
    subtitle: { margin: '5px 0 0 0', color: colors.textMuted, fontSize: '15px' },

    // 2. Botones Robustos
    btnPrimary: { backgroundColor: colors.primary, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' },
    btnSuccess: { backgroundColor: colors.success, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: '100%', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' },
    btnDanger: { backgroundColor: colors.danger, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
    btnCancel: { backgroundColor: colors.disabledBg, color: colors.textMuted, border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
    
    // Botones de Acción Especiales
    btnDangerIcon: { backgroundColor: colors.dangerLight, color: colors.danger, border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', width: '35px', height: '35px' },
    btnOutline: { backgroundColor: 'transparent', color: colors.primary, border: `2px dashed ${colors.primary}`, padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },

    // 3. Formularios e Inputs 
    formGroup: { display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' },
    label: { fontWeight: '600', color: colors.textDark, fontSize: '14px', marginBottom: '4px', display: 'block' },
    input: { padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '15px', width: '100%', boxSizing: 'border-box', backgroundColor: colors.surface, color: colors.textDark, outlineColor: colors.primary },
    inputMini: { width: '65px', padding: '8px', borderRadius: '6px', border: `1px solid ${colors.border}`, textAlign: 'center' },
    inputTiny: { width: '55px', padding: '8px', borderRadius: '6px', border: `1px solid ${colors.border}`, textAlign: 'center' },
    inputDisabled: { width: '65px', padding: '8px', borderRadius: '6px', border: `1px solid ${colors.border}`, backgroundColor: colors.disabledBg, color: '#94a3b8', textAlign: 'center' },

    // 4. Tarjetas y Grillas
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
    card: { backgroundColor: colors.surface, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, borderTop: `4px solid ${colors.warning}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', textAlign: 'left' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
    cardTitle: { margin: 0, fontSize: '18px', color: colors.textDark, fontWeight: '700', lineHeight: '1.2' },
    badge: { backgroundColor: colors.warningLight, color: '#b45309', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center' },
    
    // 5. Modales
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: colors.surface, padding: '32px', borderRadius: '20px', width: '90%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'left' },
    modalActions: { display: 'flex', gap: '12px', marginTop: '24px' },
    
    // 6. Varios
    emptyMsg: { color: colors.textMuted, textAlign: 'center', padding: '48px', backgroundColor: colors.surface, borderRadius: '16px', border: `2px dashed ${colors.border}` }
};