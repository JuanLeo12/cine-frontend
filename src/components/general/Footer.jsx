import React from 'react';
import './css/Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h4>Contacto</h4>
                    <p>Teléfono: +51 999 888 777</p>
                    <p>Email: info@cinestar.com</p>
                </div>
                <div className="footer-section">
                    <h4>Enlaces Legales</h4>
                    <ul>
                        <li><a href="#">Términos y Condiciones</a></li>
                        <li><a href="#">Política de Privacidad</a></li>
                        <li><a href="#">Libro de Reclamaciones</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Síguenos</h4>
                    <div className="social-icons">
                        <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 CineStar. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;