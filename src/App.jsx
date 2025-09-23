
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import TopSearchBar from './components/Topbar/TopSearchBar';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Home from './pages/Home';
import Products from './pages/product/product';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlantScanner from './pages/PlantScanner';
import SymptomChecker from './pages/SymptomChecker';
import AIRecommendations from './pages/AIRecommendations';
import PaymentSuccess from './pages/PaymentSuccess';
import Research from './pages/Research';
import ResearchHub from './pages/ResearchHub';
import Profile from './pages/user/Profile';
import AdminDashboard from './pages/user/AdminDashboard';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <TopSearchBar />
        <main className="pt-20"> {/* Padding-top for sticky navbar */}
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/ai-recommendations" element={<AIRecommendations />} />

            <Route path="/research" element={<Research />} />

            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route
              path="/research"
              element={
                <PrivateRoute roles={['researcher','admin','herbalist']}>
                  <ResearchHub />
                </PrivateRoute>
              }
            />

            {/* Authentication */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected User Pages */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={['buyer','seller','herbalist','researcher']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute roles={['buyer','seller','herbalist','researcher']}>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Admin Only */}
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
