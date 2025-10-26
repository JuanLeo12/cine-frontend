import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePurchase } from '../context/PurchaseContext';

// Componente que intercepta navegación cuando hay compra activa
function NavigationGuard() {
    const location = useLocation();
    const { hasActiveSelection, stopTimer, clearPurchase, setHasActiveSelection } = usePurchase();
    const previousLocation = useRef(location.pathname);

    useEffect(() => {
        // Rutas del proceso de compra que NO deben mostrar advertencia
        const purchaseRoutes = ['/seat-selection', '/ticket-type', '/combos', '/payment', '/confirmation'];
        const currentRoute = location.pathname;
        const prevRoute = previousLocation.current;
        
        // Actualizar ubicación anterior
        previousLocation.current = currentRoute;
        
        // Si navegamos DESDE una ruta de compra HACIA fuera del flujo
        const salioDelFlujo = purchaseRoutes.includes(prevRoute) && !purchaseRoutes.includes(currentRoute);
        
        // Si hay selección activa y salimos del flujo
        if (salioDelFlujo && hasActiveSelection) {
            // Detener timer y limpiar automáticamente
            console.log('🚪 Usuario salió del flujo de compra. Limpiando...');
            stopTimer();
            clearPurchase();
            setHasActiveSelection(false);
        }
    }, [location.pathname, hasActiveSelection, stopTimer, clearPurchase, setHasActiveSelection]);

    return null; // No renderiza nada
}

export default NavigationGuard;
