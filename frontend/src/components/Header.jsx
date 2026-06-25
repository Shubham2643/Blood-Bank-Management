import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Settings,
  Shield,
  Droplet,
} from "lucide-react";
import { getUser, logout, isAuthenticated } from "../utils/auth";
import {
  getDashboardPath,
  getProfilePath,
} from "../utils/rolePaths";
import { useNotification } from "../context/NotificationContext";

const WEBSITE_NAME = import.meta.env.VITE_WEBSITE_NAME || "LifeDrop";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const authenticated = isAuthenticated();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Find Camps", path: "/camps" },
    { name: "Stock Search", path: "/stock-search" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-rose-100/60 shadow-[0_4px_30px_rgba(244,63,94,0.03)] py-1.5"
          : "bg-white/70 backdrop-blur-sm border-b border-slate-100/50 py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-rose-600 shadow-md shadow-red-200/50 group-hover:shadow-lg group-hover:shadow-rose-500/25 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Heart className="w-5 h-5 text-white group-hover:animate-pulse" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none flex items-center">
                {WEBSITE_NAME === "LifeDrop" ? (
                  <>
                    <span>Life</span>
                    <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">Drop</span>
                  </>
                ) : (
                  <span className="bg-gradient-to-r from-slate-900 to-red-600 bg-clip-text text-transparent">{WEBSITE_NAME}</span>
                )}
              </h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                Blood Management System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  location.pathname === link.path
                    ? "text-red-600 bg-red-50/60 shadow-sm border border-red-100/40"
                    : "text-slate-600 hover:text-red-600 hover:bg-slate-50/50"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {authenticated ? (
              <>
                {/* Notifications */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-500 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm shadow-red-500/30 animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100/80 overflow-hidden z-50 origin-top-right animate-scale-in">
                      <div className="p-3.5 bg-red-50/50 border-b border-red-100/60 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-sm">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                         {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif._id || notif.id}
                              className={`p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all duration-200 ${
                                !notif.read ? "bg-red-50/30 border border-red-50/20" : "border border-transparent"
                              }`}
                              onClick={() => markAsRead(notif._id || notif.id)}
                            >
                              <p className="text-sm font-medium text-slate-700">
                                {notif.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                {formatTimeAgo(notif.createdAt) || notif.time}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-sm font-medium">
                            No notifications
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-100/80 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200/80 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                        {user?.name || "User"}
                      </p>
                      <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                        {user?.role?.replace("-", " ")}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-1.5 z-50 origin-top-right animate-scale-in">
                      <Link
                        to={user?.role ? getDashboardPath(user.role) : "/login"}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Droplet className="w-4 h-4 text-red-500" />
                        Dashboard
                      </Link>
                      <Link
                        to={user?.role ? getProfilePath(user.role) : "/login"}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profile
                      </Link>
                      <Link
                        to={user?.role ? getProfilePath(user.role) : "/login"}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        Settings
                      </Link>
                      <hr className="my-1.5 border-slate-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4.5 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-slate-50 rounded-xl transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register/donor"
                  className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 via-rose-500 to-rose-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98] transition-all duration-300 shadow-md shadow-red-500/10"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-red-50 text-slate-600 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
            <div className="md:hidden border-t border-slate-100 py-4 mobile-menu-enter relative z-50 bg-white/95 backdrop-blur-xl max-h-[calc(100vh-5rem)] overflow-y-auto rounded-b-2xl shadow-xl">
              <div className="px-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                      location.pathname === link.path
                        ? "bg-red-50 text-red-600"
                        : "text-slate-700 hover:bg-slate-50 hover:text-red-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {authenticated ? (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {user?.name}
                        </p>
                        <p className="text-xs font-bold text-slate-400 capitalize">
                          {user?.role?.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link
                        to={user?.role ? getDashboardPath(user.role) : "/login"}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-red-50/60 hover:text-red-600 rounded-xl"
                      >
                        <Droplet className="w-4 h-4 text-red-500" />
                        Dashboard
                      </Link>
                      <Link
                        to={user?.role ? getProfilePath(user.role) : "/login"}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-red-50/60 hover:text-red-600 rounded-xl"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-slate-100 px-4 space-y-2.5">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register/donor"
                      className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg shadow-md shadow-red-500/10 transition-all"
                    >
                      Register as Donor
                    </Link>
                    <Link
                      to="/register/facility"
                      className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all"
                    >
                      Register as Facility
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
