import React, { useState, useEffect } from 'react';
import CinemaCard from '../../components/comp/CinemaCard';
import { getSedes } from '../../services/api';
import './css/Cinemas.css';

function Cinemas() {
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroCiudad, setFiltroCiudad] = useState('Todas');

    useEffect(() => {
        const cargarSedes = async () => {
            try {
                const data = await getSedes();
                setSedes(data);
            } catch (error) {
                console.error('Error al cargar sedes:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarSedes();
    }, []);

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando cines...</p>;
    }

    const ciudades = ['Todas', ...new Set(sedes.map(s => s.ciudad))];
    const sedesFiltradas = filtroCiudad === 'Todas'
        ? sedes
        : sedes.filter(s => s.ciudad === filtroCiudad);

    return (
        <div className="cinemas">
            <h1 style={{ textAlign: 'center', color: '#e60000', marginBottom: '2rem' }}>
                Nuestros Cines
            </h1>
            <div className="filters">
                <h3>Filtrar por ciudad</h3>
                <select onChange={(e) => setFiltroCiudad(e.target.value)} value={filtroCiudad}>
                    {ciudades.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
            <div className="cinema-grid">
                {sedesFiltradas.length > 0 ? (
                    sedesFiltradas.map(sede => (
                        <CinemaCard key={sede.id} sede={sede} />
                    ))
                ) : (
                    <p style={{ textAlign: 'center', width: '100%' }}>
                        No hay cines disponibles en esta ciudad.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Cinemas;