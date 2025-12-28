import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth' // Add this import
import toast from 'react-hot-toast'; // Add this import
import logoImage from "../../assets/024global_logo_200x200.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Add auth hook
  const [loading, setLoading] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
      setIsUserMenuOpen(false);
    } catch (err) {
      toast.error("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const targetId = href.substring(1);

      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      } else {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }

    setIsMenuOpen(false);
  };

  return (
    <header className="fixed w-full z-50 bg-white shadow-lg backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a 
            href="/" 
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={(e) => { e.preventDefault(); handleNavClick('/'); }}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-200">
              <img
                src={logoImage}
                alt="024 Global Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              024 GLOBAL CONNECT
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { label: 'Home', href: '/' },
              { label: 'Mission', href: '#mission' },
              { label: 'Contact', href: '/contact' },
              { label: 'About Us', href: '/aboutus' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group cursor-pointer"
                onClick={(e) => { e.preventDefault(); handleNavClick(href); }}
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </a>
            ))}
          </nav>

          {/* Desktop Auth Section - Conditional Rendering */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              // Logged in user menu
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>{user.first_name || user.username || user.email}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Profile
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{loading ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in - show login/register buttons
              <>
                <a
                  href="/login"
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium border border-blue-600 hover:border-blue-700 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
                  onClick={(e) => { e.preventDefault(); handleNavClick('/login'); }}
                >
                  Login
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 z-50 relative"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t transition-all duration-300 ${
          isMenuOpen 
            ? 'opacity-100 visible transform translate-y-0' 
            : 'opacity-0 invisible transform -translate-y-2'
        }`}>
          <nav className="flex flex-col py-4">
            {[
              { label: 'Home', href: '/' },
              { label: 'Mission', href: '#mission' },
              { label: 'Blog', href: '/blog' },
              { label: 'Contact', href: '/contact' },
              { label: 'About Us', href: '/aboutus' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200 cursor-pointer"
                onClick={(e) => { e.preventDefault(); handleNavClick(href); }}
              >
                {label}
              </a>
            ))}

            {/* Mobile Auth Section */}
            <div className="px-4 py-3 space-y-2 border-t mt-2">
              {user ? (
                // Mobile logged in user options
                <>
                  <div className="text-sm text-gray-600 mb-2">
                    Welcome, {user.first_name || user.username || user.email}
                  </div>
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                // Mobile not logged in - show login/register buttons
                <>
                  <a
                    href="/login"
                    className="block w-full px-4 py-2 text-center text-blue-600 hover:text-blue-700 font-medium border border-blue-600 hover:border-blue-700 rounded-lg transition-all duration-200 cursor-pointer"
                    onClick={(e) => { e.preventDefault(); handleNavClick('/login'); }}
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="block w-full px-4 py-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer"
                    onClick={(e) => { e.preventDefault(); handleNavClick('/register'); }}
                  >
                    Register
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;