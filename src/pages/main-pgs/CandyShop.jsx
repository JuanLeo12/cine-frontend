import React, { useState, useEffect } from 'react';
import ComboCard from '../../components/comp/ComboCard';
import { getCombos } from '../../services/api';
import './css/CandyShop.css';

function CandyShop() {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarCombos = async () => {
            try {
                const data = await getCombos();
                setCombos(data);
            } catch (error) {
                console.error('Error al cargar combos:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarCombos();
    }, []);

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando dulcería...</p>;
    }

    return (
        <div className="candyshop">
            <h1 style={{ textAlign: 'center', color: '#e60000', marginBottom: '2rem' }}>
                🍿 Chocolatería
            </h1>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#ddd' }}>
                Disfruta de nuestros deliciosos combos mientras ves tu película favorita
            </p>
            <div className="combo-grid">
                {combos.length > 0 ? (
                    combos.map(combo => (
                        <ComboCard key={combo.id} combo={combo} />
                    ))
                ) : (
                    <p style={{ textAlign: 'center', width: '100%' }}>
                        No hay combos disponibles en este momento.
                    </p>
                )}
            </div>
        </div>
    );
}

export default CandyShop;