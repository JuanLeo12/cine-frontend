import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const PurchaseContext = createContext();

export const usePurchase = () => {
    const context = useContext(PurchaseContext);
    if (!context) {
        throw new Error('usePurchase debe usarse dentro de PurchaseProvider');
    }
    return context;
};

export const PurchaseProvider = ({ children }) => {
    // Recuperar tiempo del localStorage si existe
    const getInitialTime = () => {
        const saved = localStorage.getItem('purchaseTimeRemaining');
        const savedTimestamp = localStorage.getItem('purchaseTimestamp');
        if (saved && savedTimestamp) {
            const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
            const remaining = parseInt(saved) - elapsed;
            return remaining > 0 ? remaining : 0;
        }
        return 300;
    };

    const [timeRemaining, setTimeRemaining] = useState(getInitialTime());
    const [timerActive, setTimerActive] = useState(localStorage.getItem('purchaseTimerActive') === 'true');
    const [purchaseData, setPurchaseData] = useState(null);
    const [hasActiveSelection, setHasActiveSelection] = useState(false);
    const onTimerExpireRef = useRef(null);
    const intervaloRef = useRef(null);

    // Temporizador global de compra
    useEffect(() => {
        if (!timerActive) {
            // Limpiar localStorage si el timer no está activo
            localStorage.removeItem('purchaseTimeRemaining');
            localStorage.removeItem('purchaseTimestamp');
            localStorage.removeItem('purchaseTimerActive');
            return;
        }

        // Guardar en localStorage
        localStorage.setItem('purchaseTimerActive', 'true');

        if (intervaloRef.current) {
            clearInterval(intervaloRef.current);
        }

        intervaloRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev - 1;
                
                // Guardar en localStorage
                localStorage.setItem('purchaseTimeRemaining', newTime.toString());
                localStorage.setItem('purchaseTimestamp', Date.now().toString());
                
                if (newTime <= 0) {
                    stopTimer();
                    // Llamar callback si existe
                    if (onTimerExpireRef.current) {
                        onTimerExpireRef.current();
                    }
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => {
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current);
            }
        };
    }, [timerActive]);

    const startTimer = (id_funcion = null) => {
        setTimeRemaining(300);
        setTimerActive(true);
        localStorage.setItem('purchaseTimeRemaining', '300');
        localStorage.setItem('purchaseTimestamp', Date.now().toString());
        localStorage.setItem('purchaseTimerActive', 'true');
        if (id_funcion) {
            localStorage.setItem('purchaseIdFuncion', id_funcion.toString());
        }
    };

    const stopTimer = () => {
        setTimerActive(false);
        if (intervaloRef.current) {
            clearInterval(intervaloRef.current);
        }
        // Limpiar localStorage
        localStorage.removeItem('purchaseTimeRemaining');
        localStorage.removeItem('purchaseTimestamp');
        localStorage.removeItem('purchaseTimerActive');
        localStorage.removeItem('purchaseIdFuncion');
    };

    const resetTimer = () => {
        setTimeRemaining(300);
    };

    const extendTimer = () => {
        setTimeRemaining(300); // Reiniciar a 5 minutos
        localStorage.setItem('purchaseTimeRemaining', '300');
        localStorage.setItem('purchaseTimestamp', Date.now().toString());
        if (!timerActive) {
            setTimerActive(true);
            localStorage.setItem('purchaseTimerActive', 'true');
        }
    };

    const setTimerExpireCallback = (callback) => {
        onTimerExpireRef.current = callback;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const setPurchase = (data) => {
        setPurchaseData(data);
    };

    const clearPurchase = () => {
        setPurchaseData(null);
        stopTimer();
        setHasActiveSelection(false);
    };

    // Prevenir recarga de página cuando hay compra activa
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (timerActive) {
                e.preventDefault();
                e.returnValue = '⚠️ Tienes una compra en proceso. ¿Estás seguro de que quieres salir? Perderás tu selección de asientos.';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [timerActive]);

    const value = {
        timeRemaining,
        timerActive,
        purchaseData,
        hasActiveSelection,
        startTimer,
        stopTimer,
        resetTimer,
        extendTimer,
        setTimerExpireCallback,
        formatTime,
        setPurchase,
        clearPurchase,
        setHasActiveSelection,
        getStoredIdFuncion: () => localStorage.getItem('purchaseIdFuncion')
    };

    return (
        <PurchaseContext.Provider value={value}>
            {children}
        </PurchaseContext.Provider>
    );
};
