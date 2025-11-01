import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "../../components/general/LoginModal";
import { useAuth } from "../../context/AuthContext";
import "./css/Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserOpen(!isUserOpen);

  const handleLogout = () => {
    logout();
    setIsUserOpen(false);
    setTimeout(() => navigate("/"), 0);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* 🔹 Logo + Nombre CineStar */}
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="CineStar" className="logo-img" />
          <span className="logo-text">CineStar</span>
        </Link>

        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Inicio
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/movies" className="nav-link">
              Películas
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/cinemas" className="nav-link">
              Cines
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/candyshop" className="nav-link">
              Dulcería
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/corporate" className="nav-link">
              Ventas Corporativas
            </Link>
          </li>
        </ul>

        <div className="nav-user">
          {isLoggedIn && user ? (
            <div className="dropdown">
              <button onClick={toggleUserMenu} className="user-btn">
                <img 
                  src={user.foto_perfil || '/images/default-avatar.svg'} 
                  alt={user.nombre}
                  className="user-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-avatar.svg';
                  }}
                />
                <span className="user-name">{user.nombre}</span>
              </button>
              {isUserOpen && (
                <ul className="dropdown-menu">
                  {user.rol === 'admin' && (
                    <li>
                      <Link to="/admin" onClick={() => setIsUserOpen(false)}>🎬 Panel Admin</Link>
                    </li>
                  )}
                  <li>
                    <Link to="/mis-compras" onClick={() => setIsUserOpen(false)}>Mis Compras</Link>
                  </li>
                  <li>
                    <Link to="/mis-datos" onClick={() => setIsUserOpen(false)}>Mis Datos</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Cerrar Sesión</button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => setShowLoginModal(true)}>
                Iniciar Sesión
              </button>
              {showLoginModal && (
                <LoginModal onClose={() => setShowLoginModal(false)} />
              )}
            </>
          )}
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
