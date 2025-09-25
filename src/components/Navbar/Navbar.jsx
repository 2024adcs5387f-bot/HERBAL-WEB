
import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getCurrentUser } from '../../services/userService';

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [hasResearchAccess, setHasResearchAccess] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Sticky on scroll
  useEffect(() => {
    const updateCartCount = () => {
    try {
      const cartPageItems = localStorage.getItem('cartPageItems');
      const cartPageItemsCount = cartPageItems
        ? JSON.parse(cartPageItems).reduce((sum, item) => sum + (item.qty || 0), 0)
        : 0;
      setCartCount(cartPageItemsCount);
    } catch (e) {
      setCartCount(0);
    }
  };

  // Determine user and research access (herbalist or researcher)
  (async () => {
    try {
      const u = await getCurrentUser();
      setUser(u || null);
      const role = u?.profile?.user_type || u?.user_type;
      setHasResearchAccess(role === 'researcher' || role === 'herbalist');
    } catch (_) {
      setUser(null);
      setHasResearchAccess(false);
    }
  })();

  window.addEventListener('storage', updateCartCount);
  window.addEventListener('cartUpdated', updateCartCount);

  return () => {
    window.removeEventListener('storage', updateCartCount);
    window.removeEventListener('cartUpdated', updateCartCount);
  };
  }, []);

  const researchHubPath = '/research-hub';

  const handleLogout = async () => {
    try {
      // Clear user session (you may need to implement this in your auth service)
      // For example: await authService.logout();
      setUser(null);
      // Redirect to home or login page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const closeDropdown = () => setShowDropdown(false);

  return (
    <div className="navbar-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: 'white',
      padding: '0',
      border: 'none',
      lineHeight: 'normal'
    }}>
      {/* Top Navigation */}
      <div className="top-nav" style={{ margin: 0, padding: 20 }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <Link className="navbar-brand" to="/" style={{paddingRight: 50}}>
              <i className="fas fa-leaf me-2"></i>HerbalMarket <br />
              <small className="text-muted ms-2 d-none d-md-inline">Natural Wellness</small>
            </Link>

            <div className="d-flex nav-search me-3" style={{ width: '50%', borderRadius: '5px' }}>
              <input 
                className="form-control border-0" 
                type="search" 
                placeholder="What are you looking for?"
                aria-label="Search" 
              />
              <button className="btn btn-green px-3" type="submit" style={{borderRadius: 0}}>
                <i className="fas fa-search"></i>
              </button>
            </div>

            <div className="d-flex align-items-center">
              {user ? (
                <div className="d-flex align-items-center">
                  <div className="dropdown" style={{ position: 'relative' }}>
                    <button 
                      className="btn btn-link text-dark text-decoration-none dropdown-toggle" 
                      onClick={toggleDropdown}
                      onBlur={() => setTimeout(closeDropdown, 200)}
                      style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        padding: '0.25rem 0.5rem'
                      }}
                    >
                      <i className="fas fa-user-circle me-1"></i>
                      Hi, {user.name || user.email?.split('@')[0]}
                    </button>
                    {showDropdown && (
                      <div 
                        className="dropdown-menu show" 
                        style={{
                          position: 'absolute',
                          right: 0,
                          left: 'auto',
                          marginTop: '0.5rem',
                          minWidth: '10rem',
                          borderRadius: '0.25rem',
                          boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        <Link 
                          to="/profile" 
                          className="dropdown-item" 
                          onClick={closeDropdown}
                        >
                          <i className="fas fa-user me-2"></i> My Profile
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button 
                          className="dropdown-item text-danger" 
                          onClick={handleLogout}
                        >
                          <i className="fas fa-sign-out-alt me-2"></i> Logout
                        </button>
                      </div>
                    )}
                  </div>
                  <Link to="/help" className="btn btn-sm btn-outline-secondary me-3">
                    <i className="fas fa-question-circle me-1"></i> Help
                  </Link>
                  
                  {(user.profile?.user_type === 'buyer' || user.user_type === 'buyer') && (
                    <Link to="/cart" className="cart-icon me-3 text-decoration-none text-dark position-relative">
                      <i className="fas fa-shopping-cart fa-lg"></i>
                      {cartCount > 0 && (
                        <span className="cart-count">{cartCount}</span>
                      )}
                    </Link>
                  )}
                  
                  {(user.profile?.user_type === 'seller' || user.user_type === 'seller' || 
                    user.profile?.user_type === 'herbalist' || user.user_type === 'herbalist') && (
                    <Link to="/orders" className="btn btn-sm btn-outline-primary me-3">
                      <i className="fas fa-clipboard-list me-1"></i> Orders
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/cart" className="cart-icon me-3 text-decoration-none text-dark position-relative">
                    <i className="fas fa-shopping-cart fa-lg"></i>
                    {cartCount > 0 && (
                      <span className="cart-count">{cartCount}</span>
                    )}
                  </Link>
                  <Link to="/login" className="btn btn-green btn-sm me-2">
                    <i className="fas fa-user me-1"></i> Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-sm me-4" 
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      textDecoration: 'none',
                      transition: 'background-color 0.3s',
                      ':hover': {
                        backgroundColor: '#c82333',
                        color: 'white'
                      }
                    }}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                  >
                    <i className="fas fa-user-plus me-1"></i> Create Account
                  </Link>
                  <Link
                    to="/sell" 
                    className="btn btn-outline-success btn-sm me-2"
                    style={{ display: user ? 'none' : 'inline-block' }}
                  >
                    <i className="fas fa-store me-1"></i> Sell with Herbal Market
                  </Link>
                </>
              )}
              
              {user && (user.profile?.user_type === 'seller' || user.user_type === 'seller') && (
                <Link
                  to="/seller-dashboard"
                  className="btn btn-outline-success btn-sm me-2"
                >
                  <i className="fas fa-user-circle me-1"></i> Seller Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-black" style={{ borderBottom: '1px solid #33e407' }}>
        <div className="container">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
                  <i className="fas fa-home me-1"></i> Home
                </NavLink>
              </li>
              <li className="nav-item dropdown">
                <NavLink to="/products" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <i className="fas fa-seedling me-1"></i> Products
                </NavLink>
                <ul className="dropdown-menu" aria-labelledby="productsDropdown">
                  <li><Link className="dropdown-item" to="/products">Medicinal Herbs</Link></li>
                  <li><Link className="dropdown-item" to="/products">Essential Oils</Link></li>
                  <li><Link className="dropdown-item" to="/products">Herbal Teas</Link></li>
                  <li><Link className="dropdown-item" to="/products">Natural Supplements</Link></li>
                  <li><Link className="dropdown-item" to="/products">Skincare Products</Link></li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink to="/plant-scanner" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <i className="fas fa-camera me-1"></i> Plant Scanner
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/symptom-checker" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <i className="fas fa-stethoscope me-1"></i> Symptom Checker
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/ai-recommendations" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <i className="fas fa-robot me-1"></i> AI Recommendations
                </NavLink>
              </li>
              {hasResearchAccess && (
                <li className="nav-item">
                  <NavLink to={researchHubPath} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                    <i className="fas fa-flask me-1"></i> Research Hub
                  </NavLink>
                </li>
              )}

              {user && (
                <li className="nav-item">
                  <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                    <i className="fas fa-user-circle me-1"></i> Profile
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .navbar-brand {
          color: #2E7D32 !important;
          font-weight: bold;
          font-size: 1.5rem;
        }

        .top-nav {
          background-color: #f8f8f8;
          border-bottom: 1px solid #33e407;
          padding: 8px 0;
        }

        .nav-search {
          border: 2px solid #4CAF50;
          border-radius: 4px;
        }

        .nav-search .form-control:focus {
          box-shadow: none;
          border-color: #4CAF50;
        }

        .btn-green {
          background-color: #4CAF50;
          color: white;
        }

        .btn-green:hover {
          background-color: #2E7D32;
          color: white;
        }

        .nav-item {
          font-weight: bold;
          margin-left: 50px;
        }

        .nav-link {
          color: #666;
          font-size: 20px;
          padding: 0.5rem 0.8rem;
        }

        .nav-link:hover {
          color: #4CAF50;
        }

        .nav-link.active {
          color: #ffffff !important;
        }

        .dropdown:hover .dropdown-menu {
          display: block;
          margin-top: 0;
        }

        .cart-icon {
          position: relative;
        }

        .cart-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: #ff6b6b;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
