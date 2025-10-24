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
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutos
    const [timerActive, setTimerActive] = useState(false);
    const [purchaseData, setPurchaseData] = useState(null);
    const [hasActiveSelection, setHasActiveSelection] = useState(false); // Para bloquear navegación
    const intervaloRef = useRef(null);

    // Temporizador global de compra
    useEffect(() => {
        if (!timerActive) return;

        if (intervaloRef.current) {
            clearInterval(intervaloRef.current);
        }

        intervaloRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current);
            }
        };
    }, [timerActive]);

    const startTimer = () => {
        setTimeRemaining(300);
        setTimerActive(true);
    };

    const stopTimer = () => {
        setTimerActive(false);
        if (intervaloRef.current) {
            clearInterval(intervaloRef.current);
        }
    };

    const resetTimer = () => {
        setTimeRemaining(300);
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
    };

    const value = {
        timeRemaining,
        timerActive,
        purchaseData,
        hasActiveSelection,
        startTimer,
        stopTimer,
        resetTimer,
        formatTime,
        setPurchase,
        clearPurchase,
        setHasActiveSelection
    };

    return (
        <PurchaseContext.Provider value={value}>
            {children}
        </PurchaseContext.Provider>
    );
};
