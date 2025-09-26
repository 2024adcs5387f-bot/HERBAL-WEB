
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '../../services/userService';

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [hasResearchAccess, setHasResearchAccess] = useState(false);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();


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

    updateCartCount();

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
      await signOut();
      setUser(null);
      navigate('/login', { replace: true });
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <div style={{
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
            <Link className="navbar-brand" to="/"style={{paddingRight:50}}>
              <i className="fas fa-leaf me-2"></i>HerbalMarket <br />
              <small className="text-muted ms-2 d-none d-md-inline">Natural Wellness</small>
            </Link>

            <div className="d-flex nav-search me-3" style={{ width: '50%',borderRadius:'5px' }}>
              <input className="form-control border-0" type="search" placeholder="What are you looking for?"
                aria-label="Search" />
              <button className="btn btn-green px-3" type="submit" style={{borderRadius:0}}>
                <i className="fas fa-search"></i>
              </button>
            </div>

            <div className="d-flex align-items-center">
              <Link to="/cart" className="cart-icon me-3 text-decoration-none text-dark">
                <i className="fas fa-shopping-cart fa-lg"></i>
                {cartCount > 0 && (
                  <span className="cart-count">{cartCount}</span>
                )}
              </Link>
              {!user ? (
                <>
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
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(221, 17, 10)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                  >
                    <i className="fas fa-user-plus me-1"></i> Create Account
                  </Link>
                  <Link
                    to="/sell"
                    className="btn btn-green btn-sm"
                    style={{ marginLeft: '8px' }}
                  >
                    <i className="fas fa-store me-1"></i> Sell with HERBAL MARKET
                  </Link>
                </>
              ) : (
                <div className="position-relative" style={{ marginLeft: '12px', zIndex: 2001 }} onMouseLeave={() => setProfileOpen(false)}>
                  <button className="btn btn-light d-flex align-items-center" type="button" onClick={() => setProfileOpen((v) => !v)}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32, backgroundColor: '#2E7D32', color: 'white', fontWeight: 700 }}>
                      {(user?.profile?.name || user?.email || 'U')[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{user?.profile?.name || user?.email}</span>
                    <i className="fas fa-chevron-down ms-2" style={{ fontSize: 12 }}></i>
                  </button>
                  {profileOpen && (
                    <ul className="dropdown-menu dropdown-menu-end show" style={{ display: 'block', position: 'absolute', right: 0, minWidth: '240px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 2001 }}>
                      <li>
                        <div className="px-3 py-2" style={{ borderBottom: '1px solid #eee' }}>
                          <div style={{ fontSize: 12, color: '#6c757d' }}>Signed in as</div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.profile?.name || user?.email}</div>
                          <div style={{ fontSize: 12, color: '#6c757d' }}>{user?.email}</div>
                        </div>
                      </li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center" to="/dashboard" onClick={() => setProfileOpen(false)}>
                          <i className="fas fa-gauge-high me-2" style={{ color: '#2E7D32' }}></i> Dashboard
                        </Link>
                      </li>
                      <li>
                        <button className="dropdown-item d-flex align-items-center" onClick={handleLogout}>
                          <i className="fas fa-right-from-bracket me-2" style={{ color: '#dc3545' }}></i> Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Main Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-black" style={{ borderBottom: '1px solid #33e407',}}>
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
              <li className="nav-item">
                <NavLink to={researchHubPath} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <i className="fas fa-flask me-1"></i> Research Hub
                </NavLink>
              </li>

              {/* When logged in, Profile/Dashboard lives in the top bar dropdown */}
            </ul>
          </div>
        </div>
      </nav>

      {/* <p style={{ textAlign: 'center', color: 'white',backgroundColor: 'black',paddingTop: '20px',paddingBottom: '0px', fontWeight: 'bold', borderBottom: '1px solid #33e407' }}>
        Learn, Treat, Research and Heal with the best HerbalMarket
      </p> */}

      <style>{`
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

        .bottom-nav {
          background-color: yellow;
          padding: 8px 0;
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
