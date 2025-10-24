import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePurchase } from '../context/PurchaseContext';

// Componente que intercepta navegación cuando hay compra activa
function NavigationGuard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { hasActiveSelection } = usePurchase();

    useEffect(() => {
        // Rutas del proceso de compra que NO deben mostrar advertencia
        const purchaseRoutes = ['/seat-selection', '/ticket-type', '/combos', '/payment', '/confirmation'];
        const currentRoute = location.pathname;
        
        // Si estamos en una ruta de compra, no hacemos nada
        if (purchaseRoutes.includes(currentRoute)) {
            return;
        }

        // Si hay selección activa y navegamos fuera del flujo, advertir
        if (hasActiveSelection) {
            const confirmLeave = window.confirm(
                '⚠️ Tienes asientos seleccionados. Si sales ahora, perderás tu selección. ¿Deseas continuar?'
            );
            
            if (!confirmLeave) {
                // Evitar la navegación - volver a la ruta anterior
                navigate(-1);
            }
        }
    }, [location, hasActiveSelection, navigate]);

    return null; // No renderiza nada
}

export default NavigationGuard;
