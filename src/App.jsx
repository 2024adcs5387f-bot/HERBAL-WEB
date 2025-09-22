import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlantScanner from './components/PlantScanner/PlantScanner';
import SymptomChecker from './pages/SymptomChecker';
import AIRecommendations from './pages/AIRecommendations';
import PaymentSuccess from './pages/PaymentSuccess';
import ScanHistory from './pages/ScanHistory';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plant-scanner" element={<PlantScanner />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/ai-recommendations" element={<AIRecommendations />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/scan-history" element={<ScanHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;