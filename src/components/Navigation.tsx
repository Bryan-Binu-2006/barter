import React, { useState, useEffect } from 'react';
import { LogOut, ArrowLeft, Bell, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';
import { notificationService } from '../services/notificationService';
import { NotificationCenter } from './NotificationCenter';
import { BarterRequestsModal } from './BarterRequestsModal';
import { ProfileModal } from './ProfileModal';

export function Navigation() {
  const { user, logout } = useAuth();
  const { selectedCommunity, selectCommunity } = useCommunity();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Set up interval to check for new notifications
      const interval = setInterval(loadUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      selectCommunity(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBackToCommunities = () => {
    selectCommunity(null);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Baarter
              </h1>
              {selectedCommunity && (
                <>
                  <div className="hidden md:flex items-center space-x-2">
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-700 font-medium">{selectedCommunity.name}</span>
                  </div>
                  <button
                    onClick={handleBackToCommunities}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    title="Switch community"
                  >
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Switch</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  {/* Notifications */}
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                    title="Notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Profile Button */}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                    title="Edit Profile"
                  >
                    <User size={20} />
                  </button>

                  {/* User Info */}
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-medium text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                  </div>
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} />
      )}

      {showRequests && (
        <BarterRequestsModal
          onClose={() => setShowRequests(false)}
          onOpenChat={() => {}} // Removed chat functionality
        />
      )}

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}