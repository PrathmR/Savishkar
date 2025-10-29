import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./pages/Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Payment = lazy(() => import('./pages/Payment'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AddEvent = lazy(() => import('./pages/admin/AddEvent'));
const EditEvent = lazy(() => import('./pages/admin/EditEvent'));
const BackgroundDemo = lazy(() => import('./pages/BackgroundDemo'));

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading (checking auth, loading assets, etc.)
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000); // Show loading screen for 3 seconds minimum

    return () => clearTimeout(timer);
  }, []);

  // Show initial loading screen
  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen">
            <Navbar />
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/background-demo" element={<BackgroundDemo />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/payment/:registrationId" element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/events/new" element={
                  <ProtectedRoute adminOnly>
                    <AddEvent />
                  </ProtectedRoute>
                } />
                <Route path="/admin/events/edit/:id" element={
                  <ProtectedRoute adminOnly>
                    <EditEvent />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
            
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: '#4A2511',
                  border: '2px solid rgba(74, 37, 17, 0.2)',
                },
                success: {
                  iconTheme: {
                    primary: '#2d7a3e',
                    secondary: '#F5E6D3',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#a83232',
                    secondary: '#F5E6D3',
                  },
                },
              }}
              containerStyle={{
                top: 20,
                left: 20,
                bottom: 20,
                right: 20,
              }}
              limit={1}
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
