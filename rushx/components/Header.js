import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  FaTwitch, 
  FaUser,
  FaSignOutAlt,
  FaCrown,
  FaUsers,
  FaTrophy,
  FaCalendarAlt,
  FaHome,
  FaBars,
  FaBell
} from 'react-icons/fa';
import { GiTrophyCup } from 'react-icons/gi';
import { IoMdClose } from 'react-icons/io';
import AuthModal from './AuthModal';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(5);

    setNotifications(data || []);
  };

  const navItems = [
    { name: 'Home', href: '/', icon: <FaHome className="w-3 h-3" /> },
    { name: 'Tournaments', href: '/tournaments', icon: <GiTrophyCup className="w-3 h-3" /> },
    { name: 'Teams', href: '/teams', icon: <FaUsers className="w-3 h-3" /> },
    { name: 'Players', href: '/players', icon: <FaCrown className="w-3 h-3" /> },
    { name: 'Schedule', href: '/schedule', icon: <FaCalendarAlt className="w-3 h-3" /> },
    { name: 'Results', href: '/results', icon: <FaTrophy className="w-3 h-3" /> },
    { name: 'Watch', href: '/watch', icon: <FaTwitch className="w-3 h-3" /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-xl border-b border-cyan-500/20' 
          : 'bg-gradient-to-b from-gray-900 to-transparent'
      }`}>
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
                  <GiTrophyCup className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg tracking-wider">RUSHX</span>
                <span className="text-cyan-400 text-[10px] font-semibold tracking-widest">ESPORTS</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center space-x-1.5 font-medium tracking-wide transition-all duration-300 group text-sm ${
                    router.pathname === item.href
                      ? 'text-cyan-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-300 group-hover:w-full ${
                    router.pathname === item.href ? 'w-full' : ''
                  }`}></span>
                </Link>
              ))}
            </nav>

            {/* Auth + Notifications */}
            <div className="hidden lg:flex items-center space-x-3">
              {user && (
                <div className="relative">
                  {/* Notification Bell */}
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-300 hover:text-cyan-400 transition-colors duration-300"
                  >
                    <FaBell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 overflow-hidden z-50">
                      <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
                        <h3 className="text-white font-semibold">Notifications</h3>
                        <Link 
                          href="/notifications"
                          className="text-cyan-400 text-sm hover:text-cyan-300"
                          onClick={() => setShowNotifications(false)}
                        >
                          View All
                        </Link>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-400">
                            No new notifications
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <div key={notification.id} className="p-4 border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors duration-300">
                              <div className="text-white font-medium text-sm mb-1">
                                {notification.title}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {notification.message}
                              </div>
                              <div className="text-gray-500 text-xs mt-2">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Profile / Auth Buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                  >
                    <FaUser className="w-3 h-3" />
                    <span>Profile</span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 overflow-hidden">
                      <div className="p-4 border-b border-cyan-500/20">
                        <p className="text-white font-semibold text-sm">
                          {user.user_metadata?.username || user.email}
                        </p>
                        <p className="text-cyan-400 text-xs">
                          {user.user_metadata?.gamer_tag || 'Player'}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-cyan-500/10 transition-colors duration-300"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <FaUser className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-300"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 text-sm"
                >
                  <FaUser className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button + Notifications */}
            <div className="lg:hidden flex items-center space-x-2">
              {user && (
                <button
                  onClick={() => setShowMobileNotifications(!showMobileNotifications)}
                  className="relative p-2 text-white hover:text-cyan-400 transition-colors duration-300"
                >
                  <FaBell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              )}
              <button
                className="flex items-center justify-center w-8 h-8 text-white hover:text-cyan-400 transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <IoMdClose className="w-5 h-5" />
                ) : (
                  <FaBars className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Notifications Panel */}
          {user && (
            <div className={`lg:hidden transition-all bg-gray-900/95 duration-500 overflow-hidden ${
              showMobileNotifications ? 'max-h-96 pb-4' : 'max-h-0'
            }`}>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Notifications</h3>
                  <Link 
                    href="/notifications"
                    className="text-cyan-400 text-sm hover:text-cyan-300"
                    onClick={() => setShowMobileNotifications(false)}
                  >
                    View All
                  </Link>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} className="p-3 border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/30 transition-colors duration-300 rounded-lg mb-2">
                        <div className="text-white font-medium text-sm mb-1">
                          {notification.title}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {notification.message}
                        </div>
                        <div className="text-gray-500 text-xs mt-2">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          <div className={`lg:hidden transition-all bg-gray-900/95 duration-500 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
          }`}>
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 font-medium tracking-wide transition-all duration-300 py-1.5 text-sm ${
                    router.pathname === item.href
                      ? 'text-cyan-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="flex space-x-3 pt-3">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center justify-center space-x-1.5 flex-1 px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaUser className="w-3 h-3" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center space-x-1.5 flex-1 px-3 py-2 border border-red-500 text-red-400 font-medium rounded-lg text-sm"
                    >
                      <FaSignOutAlt className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center space-x-1.5 flex-1 px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg text-sm"
                  >
                    <FaUser className="w-3 h-3" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Header;
