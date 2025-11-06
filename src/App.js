import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contextos
import { AuthProvider } from './context/AuthContext';
import { PurchaseProvider } from './context/PurchaseContext';

// Componentes 
import Navbar from './components/general/Navbar';
import Footer from './components/general/Footer';
import NavigationGuard from './components/NavigationGuard';

// Páginas de Contenido
import Home from './pages/main-pgs/Home';
import Movies from './pages/main-pgs/Movies';
import MovieDetails from './pages/main-pgs/MovieDetails';
import Cinemas from './pages/main-pgs/Cinemas';
import CandyShop from './pages/main-pgs/CandyShop';
import CorporateSales from './pages/main-pgs/CorporateSales';

// Páginas de Flujo de Compra
import SeatSelection from './pages/purchase/SeatSelection';
import TicketType from './pages/purchase/TicketType';
import Combos from './pages/purchase/Combos';
import Payment from './pages/purchase/Payment';
import PaymentCorporativo from './pages/purchase/PaymentCorporativo';
import Confirmation from './pages/purchase/Confirmation';

// Páginas del usuario
import MisCompras from './pages/usr/MisCompras';
import MisDatos from './pages/usr/MisDatos';

// Panel de Administrador
import AdminPanel from './pages/admin/AdminPanel';

import './App.css';


function App() {
  return (
    <Router>
      <AuthProvider>
        <PurchaseProvider>
          <div className="App">
            <NavigationGuard />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/cinemas" element={<Cinemas />} />
                <Route path="/candyshop" element={<CandyShop />} />
                <Route path="/corporate" element={<CorporateSales />} />
                <Route path="/seat-selection" element={<SeatSelection />} />
                <Route path="/ticket-type" element={<TicketType />} />
                <Route path="/combos" element={<Combos />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment-corporativo" element={<PaymentCorporativo />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/mis-compras" element={<MisCompras />} />
                <Route path="/mis-datos" element={<MisDatos />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </PurchaseProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;