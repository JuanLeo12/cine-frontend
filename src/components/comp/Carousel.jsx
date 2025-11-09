import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Carousel.css";

function Carousel({ peliculas }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === peliculas.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? peliculas.length - 1 : prev - 1));
  };

  // 🔹 Auto-rotación automática cada 5 segundos
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peliculas]);

  const startAutoSlide = () => {
    stopAutoSlide(); // evitar duplicados
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev === peliculas.length - 1 ? 0 : prev + 1));
    }, 5000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div
      className="carousel"
      onMouseEnter={stopAutoSlide} // 🔹 Pausa al pasar el mouse
      onMouseLeave={startAutoSlide} // 🔹 Reanuda al salir
    >
      <button className="carousel-btn prev" onClick={prevSlide}>
        ‹
      </button>

      <div className="carousel-content">
        <div className="carousel-image-container">
          <img
            src={peliculas[currentIndex]?.imagen_url}
            alt={peliculas[currentIndex]?.titulo}
          />
          <div className="carousel-overlay"></div>
        </div>
        
        <div className="carousel-info">
          <span className="carousel-badge">
            {peliculas[currentIndex]?.genero}
          </span>
          <h2>{peliculas[currentIndex]?.titulo}</h2>
          <p className="carousel-sinopsis">
            {peliculas[currentIndex]?.sinopsis?.substring(0, 150)}
            {peliculas[currentIndex]?.sinopsis?.length > 150 ? '...' : ''}
          </p>
          <div className="carousel-details">
            <span>⏱️ {peliculas[currentIndex]?.duracion} min</span>
            <span>🎬 {peliculas[currentIndex]?.clasificacion}</span>
          </div>
          <button 
            className="carousel-more-btn"
            onClick={() => navigate(`/movie/${peliculas[currentIndex]?.id}`)}
          >
            <span>Ver más detalles</span>
          </button>
        </div>
      </div>

      <button className="carousel-btn next" onClick={nextSlide}>
        ›
      </button>

      {/* 🔹 Indicadores (puntos) */}
      <div className="carousel-indicators">
        {peliculas.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default Carousel;
