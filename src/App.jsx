
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { initAuthBridge } from './services/authService';
import Home from './pages/Home';
import Products from './pages/product/product';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRouter from './pages/user/DashboardRouter';
import BuyerDashboard from './pages/user/BuyerDashboard';
import PlantScanner from './pages/PlantScanner';
import SymptomChecker from './pages/SymptomChecker';
import AIRecommendations from './pages/AIRecommendations';
import PaymentSuccess from './pages/PaymentSuccess';
import Research from './pages/Research';
import ResearchPost from './pages/ResearchPost';
import ResearchNew from './pages/ResearchNew';
import ResearchEdit from './pages/ResearchEdit';
import TopSearchBar from './components/Topbar/TopSearchBar';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';
import ResearchHub from './pages/ResearchHub';
import Profile from './pages/user/Profile';
import AdminDashboard from './pages/user/AdminDashboard';
import ResearcherDashboard from './pages/user/ResearcherDashboard';
import HerbalistDashboard from './pages/user/HerbalistDashboard';
import NotFound from './pages/NotFound';
import SupabaseHealth from './pages/health/SupabaseHealth';
import Logout from './pages/Logout';

const App = () => {
  useEffect(() => {
    initAuthBridge();
  }, []);

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
            {/* Diagnostics */}
            <Route path="/health/supabase" element={<SupabaseHealth />} />
            
            {/* AI Tools */}
            <Route path="/plant-scanner" element={<PlantScanner />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/ai-recommendations" element={<AIRecommendations />} />
            <Route path="/research" element={<Research />} />
            <Route path="/research/:id" element={<ResearchPost />} />
            <Route path="/research-hub" element={<ResearchHub />} />
            <Route
              path="/research/new"
              element={
                <PrivateRoute roles={['researcher','herbalist']}>
                  <ResearchNew />
                </PrivateRoute>
              }
            />
            <Route
              path="/research/:id/edit"
              element={
                <PrivateRoute roles={['researcher','herbalist']}>
                  <ResearchEdit />
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
                <PrivateRoute roles={['buyer','seller','herbalist','researcher','admin']}>
                  <DashboardRouter />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/buyer"
              element={
                <PrivateRoute roles={['buyer','admin']}>
                  <BuyerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/researcher"
              element={
                <PrivateRoute roles={['researcher','admin','herbalist']}>
                  <ResearcherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/herbalist"
              element={
                <PrivateRoute roles={['herbalist','admin','researcher']}>
                  <HerbalistDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/logout" element={<Logout />} />
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

            {/* Seller dashboard is now a static page at /Seller.html. No React route here. */}

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      </div>
    </Router>
  );
};

export default App;
