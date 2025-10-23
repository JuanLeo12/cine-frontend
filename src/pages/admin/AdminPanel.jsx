import React, { useState } from 'react';
import PeliculasAdmin from './PeliculasAdmin';
import SedesAdmin from './SedesAdmin';
import FuncionesAdmin from './FuncionesAdmin';
import CombosAdmin from './CombosAdmin';
import UsuariosAdmin from './UsuariosAdmin';
import ReportesAdmin from './ReportesAdmin';
import './css/AdminPanel.css';

function AdminPanel() {
    const [seccionActiva, setSeccionActiva] = useState('reportes');

    const renderSeccion = () => {
        switch (seccionActiva) {
            case 'reportes':
                return <ReportesAdmin />;
            case 'peliculas':
                return <PeliculasAdmin />;
            case 'sedes':
                return <SedesAdmin />;
            case 'funciones':
                return <FuncionesAdmin />;
            case 'combos':
                return <CombosAdmin />;
            case 'usuarios':
                return <UsuariosAdmin />;
            default:
                return <ReportesAdmin />;
        }
    };

    return (
        <div className="admin-panel">
            <h1 className="admin-title">🎬 Panel de Administración</h1>
            
            <nav className="admin-nav">
                <button
                    className={seccionActiva === 'reportes' ? 'active' : ''}
                    onClick={() => setSeccionActiva('reportes')}
                >
                    📊 Reportes
                </button>
                <button
                    className={seccionActiva === 'peliculas' ? 'active' : ''}
                    onClick={() => setSeccionActiva('peliculas')}
                >
                    🎥 Películas
                </button>
                <button
                    className={seccionActiva === 'sedes' ? 'active' : ''}
                    onClick={() => setSeccionActiva('sedes')}
                >
                    🏢 Sedes
                </button>
                <button
                    className={seccionActiva === 'funciones' ? 'active' : ''}
                    onClick={() => setSeccionActiva('funciones')}
                >
                    📅 Funciones
                </button>
                <button
                    className={seccionActiva === 'combos' ? 'active' : ''}
                    onClick={() => setSeccionActiva('combos')}
                >
                    🍿 Combos
                </button>
                <button
                    className={seccionActiva === 'usuarios' ? 'active' : ''}
                    onClick={() => setSeccionActiva('usuarios')}
                >
                    👥 Usuarios
                </button>
            </nav>

            <div className="admin-content">
                {renderSeccion()}
            </div>
        </div>
    );
}

export default AdminPanel;
