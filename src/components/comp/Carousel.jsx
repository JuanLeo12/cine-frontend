import React, { useState } from 'react';
import './css/Carousel.css';

function Carousel({ peliculas }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === peliculas.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? peliculas.length - 1 : prev - 1));
    };

    return (
        <div className="carousel">
            <button className="carousel-btn prev" onClick={prevSlide}>‹</button>
            <div className="carousel-content">
                <img src={peliculas[currentIndex]?.imagen}  alt={peliculas[currentIndex]?.titulo} />
                <div className="carousel-info">
                    <h3>{peliculas[currentIndex]?.titulo}</h3>
                    <p>{peliculas[currentIndex]?.sinopsis}</p>
                </div>
            </div>
            <button className="carousel-btn next" onClick={nextSlide}>›</button>
        </div>
    );
}

export default Carousel;