import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationsAPI } from '../services/api';
import { LayoutDashboard, Users, LogOut, User, Shield, Settings, Sun, Moon, Bell, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsAPI.getAll(),
        notificationsAPI.getUnreadCount()
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 shadow-lg relative">
        {/* Logo/Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mini CRM</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lead Management</p>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6">
          <Link
            to="/dashboard"
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
          >
            <LayoutDashboard size={20} className="mr-3" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/leads"
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
          >
            <Users size={20} className="mr-3" />
            <span>Leads</span>
          </Link>
          
          {/* Admin Panel - Only for admins */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 transition-colors"
            >
              <Shield size={20} className="mr-3" />
              <span>Admin Panel</span>
            </Link>
          )}
          
          {/* Profile */}
          <Link
            to="/profile"
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
          >
            <Settings size={20} className="mr-3" />
            <span>Profile</span>
          </Link>
          <Link
            to="/security"
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
          >
            <Shield size={20} className="mr-3" />
            <span>Security</span>
          </Link>
          
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors"
          >
            <span className="text-sm">🔗 View Public Page</span>
          </a>
        </nav>
        
        {/* Theme Toggle & User Info */}
        <div className="absolute bottom-0 w-64 p-6 border-t dark:border-gray-700">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full mb-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
            <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <div className="flex items-center mb-4">
            {user?.photo ? (
              <img 
                src={user.photo} 
                alt={user.username} 
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="bg-blue-100 dark:bg-gray-800 p-2 rounded-full">
                <User size={20} className="text-blue-600 dark:text-gray-300" />
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-red-600 w-full transition-colors"
          >
            <LogOut size={20} className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header Bar */}
        <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 p-4 flex justify-between items-center">
          <div></div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notif.isRead ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800 dark:text-white">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif._id, e)}
                              className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;