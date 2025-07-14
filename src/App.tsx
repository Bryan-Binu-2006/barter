import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { Navigation } from './components/Navigation';
import { AuthForm } from './components/AuthForm';
import { CommunitySelector } from './components/CommunitySelector';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './contexts/AuthContext';
import { useCommunity } from './contexts/CommunityContext';

function AppContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { selectedCommunity } = useCommunity();
  const [currentView, setCurrentView] = useState<'auth' | 'community' | 'dashboard'>('auth');

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      setCurrentView('auth');
    } else if (!selectedCommunity) {
      setCurrentView('community');
    } else {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, selectedCommunity, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Baarter...</h2>
            <p className="text-gray-600">Please wait while we set up your experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      {isAuthenticated && <Navigation />}
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'auth' && <AuthForm />}
        {currentView === 'community' && <CommunitySelector />}
        {currentView === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CommunityProvider>
        <AppContent />
      </CommunityProvider>
    </AuthProvider>
  );
}

export default App;