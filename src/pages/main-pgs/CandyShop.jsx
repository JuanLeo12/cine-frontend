import React, { useState } from 'react';
import ComboCard from '../../components/comp/ComboCard';
import { combos, categoriasDulceria } from '../../data/mockData';
import './css/CandyShop.css';

function CandyShop() {
    const [filtroCategoria, setFiltroCategoria] = useState('Todos');
    const categorias = ['Todos', ...categoriasDulceria.map(c => c.nombre)];

    const combosFiltrados = filtroCategoria === 'Todos'
        ? combos
        : combos.filter(c => c.categoria === filtroCategoria);

    return (
        <div className="candyshop">
            <div className="category-tabs">
                {categorias.map(cat => (
                    <button
                        key={cat}
                        className={filtroCategoria === cat ? 'active' : ''}
                        onClick={() => setFiltroCategoria(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="combo-grid">
                {combosFiltrados.map(combo => (
                    <ComboCard key={combo.id} combo={combo} />
                ))}
            </div>
        </div>
    );
}

export default CandyShop;