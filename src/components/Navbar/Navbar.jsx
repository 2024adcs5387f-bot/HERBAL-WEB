import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  LogOut, 
  Settings, 
  Package,
  Leaf,
  BookOpen,
  History,
  Search,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Mock user data - replace with actual auth context
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null,
    userType: 'buyer'
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load cart items count from localStorage
    const savedCart = localStorage.getItem('herbalCart');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      setCartItemCount(cartItems.length);
    }

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('herbalTheme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('herbalTheme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Leaf },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Plant Scanner', href: '/plant-scanner', icon: Leaf },
    { name: 'Scan History', href: '/scan-history', icon: History },
    { name: 'Symptom Checker', href: '/symptom-checker', icon: BookOpen },
    { name: 'AI Recommendations', href: '/ai-recommendations', icon: BookOpen },
  ];

  const userMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Sign Out', href: '/logout', icon: LogOut, action: 'logout' },
  ];

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
    setIsUserMenuOpen(false);
  };

  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg border-b border-neutral-200 dark:border-neutral-700' 
        : 'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                HerbalMarket
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Natural Wellness</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActiveRoute(item.href)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-700'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Search */}
            <button className="hidden md:flex items-center justify-center w-10 h-10 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="hidden md:flex items-center justify-center w-10 h-10 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full border-2 border-white dark:border-neutral-900"></span>
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center justify-center w-10 h-10 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{user.userType}</p>
                </div>
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.userType === 'buyer' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' :
                          user.userType === 'seller' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                          'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                        }`}>
                          {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        if (item.action === 'logout') {
                          return (
                            <button
                              key={item.name}
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
            >
              <div className="py-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActiveRoute(item.href)
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-700'
                          : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile User Actions */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      if (item.action === 'logout') {
                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </button>
                        );
                      }
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;