import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import DonorDashboard from './pages/donor/DonorDashboard';
import AddFood from './pages/donor/AddFood';
import MyListings from './pages/donor/MyListings';
import DonorChat from './pages/donor/DonorChat'; // <-- ADD THIS IMPORT
import ReceiverDashboard from './pages/receiver/ReceiverDashboard';
import ReceiverClaims from './pages/receiver/ReceiverClaims';

// Components
import Navbar from './components/common/Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Donor Routes */}
        <Route 
          path="/donor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/donor/add-food" 
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <AddFood />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/donor/listings" 
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <MyListings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/donor/chat"  // <-- ADD THIS ROUTE
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorChat />
            </ProtectedRoute>
          } 
        />
        
        {/* Receiver Routes */}
        <Route 
          path="/receiver/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['receiver']}>
              <ReceiverDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/receiver/claims" 
          element={
            <ProtectedRoute allowedRoles={['receiver']}>
              <ReceiverClaims />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;