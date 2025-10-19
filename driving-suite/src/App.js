import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Box, CssBaseline, Drawer, List, ListItemButton, 
  ListItemIcon, ListItemText, IconButton, Avatar, Tooltip, Divider, Button 
} from '@mui/material';
import { 
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, Dashboard as DashboardIcon, 
  DirectionsCar, School, MonetizationOn, Assignment, AccountCircle, 
  Login as LoginIcon, Logout as LogoutIcon, SwapHoriz  
} from '@mui/icons-material';
import { auth } from './firebase'; // Make sure this path is correct
import { onAuthStateChanged, signOut } from 'firebase/auth';

// --- Page Imports ---
import Dashboard from './pages/dashboard';
import InsurancePage from './pages/insurance';
import AdvertisementPage from './pages/instructors';
import LoginPage from './pages/login';
import ProfilePage from './pages/profile';
import BookingPage from './pages/booking';
import TheorySimulatorPage from './pages/simulator-theory';
import SwapMarketPage from './pages/swap-market';
import LandingPage from './pages/landing';
import LiveVideo from './pages/live-video';
import BecomeInstructorPage from './pages/become-instructor';
import ProtectedRoute from './protected-route';

// --- Configuration ---
const openDrawerWidth = 260;
const closedDrawerWidth = 72;
const headerHeight = 64;

// --- Layout Component (with navigation) ---
function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState({ loggedIn: false, name: '' });
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ PERSIST AUTH STATE - Listen to Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - restore from localStorage or Firebase
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Set from Firebase user
          const userData = {
            loggedIn: true,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            uid: firebaseUser.uid
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        // User is signed out
        setUser({ loggedIn: false, name: '' });
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogin = (userData) => {
    const user = {
      loggedIn: true,
      name: userData?.name || 'User',
      email: userData?.email,
      uid: userData?.uid
    };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user)); // Persist to localStorage
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      setUser({ loggedIn: false, name: '' });
      localStorage.removeItem('user'); // Clear localStorage
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle navigation with authentication check
  const handleNavigation = (path, requiresAuth) => {
    if (requiresAuth && !user.loggedIn) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  // --- Menu Configuration ---
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, requiresAuth: true },
    { path: '/booking', label: 'Find a Test', icon: <DirectionsCar />, requiresAuth: true },
    { path: '/theory', label: 'Theory & Simulator', icon: <School />, requiresAuth: true },
    { path: '/swap', label: 'Test Swap Market', icon: <SwapHoriz />, requiresAuth: true },
    { path: '/insurance', label: 'Insurance Deals', icon: <MonetizationOn />, requiresAuth: true },
    { path: '/instructors', label: 'Instructors', icon: <Assignment />, requiresAuth: true },
    { path: '/live-video', label: 'Live Video', icon: <Assignment />, requiresAuth: true },
    { path: '/profile', label: 'My Profile', icon: <AccountCircle />, requiresAuth: true },
  ];

  // Get current page label
  const currentPage = menuItems.find(item => item.path === location.pathname);
  const pageTitle = currentPage?.label || (location.pathname === '/' ? 'Home' : 'DriveNow');

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [2], height: `${headerHeight}px` }}>
        {isSidebarOpen && (
          <Typography variant="h5" noWrap sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
            DriveNow
          </Typography>
        )}
        <IconButton onClick={handleSidebarToggle}>
          {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map(({ path, label, icon, requiresAuth }) => (
          <Tooltip title={isSidebarOpen ? '' : label} placement="right" key={path}>
            <ListItemButton 
              sx={{ py: 1.5 }} 
              onClick={() => handleNavigation(path, requiresAuth)} 
              selected={location.pathname === path}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              {isSidebarOpen && <ListItemText primary={label} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </div>
  );

  const currentWidth = isSidebarOpen ? openDrawerWidth : closedDrawerWidth;

  // Show loading state while checking auth
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Header / AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentWidth}px)` },
          ml: { sm: `${currentWidth}px` },
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: `${headerHeight}px` }}>
          <Typography variant="h6" noWrap>
            {pageTitle}
          </Typography>
          
          {/* RIGHT SIDE: Login/Logout + User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user.loggedIn ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user.name ? user.name.charAt(0) : 'U'}
                  </Avatar>
                  <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {user.name || 'User'}
                  </Typography>
                </Box>
                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Logout
                </Button>
                <IconButton color="inherit" onClick={handleLogout} sx={{ display: { xs: 'flex', sm: 'none' } }}>
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  startIcon={<LoginIcon />}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Login
                </Button>
                <IconButton 
                  color="inherit" 
                  onClick={() => navigate('/login')} 
                  sx={{ display: { xs: 'flex', sm: 'none' } }}
                >
                  <LoginIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar / Drawer */}
      <Drawer
        variant="permanent"
        open={isSidebarOpen}
        sx={{
          width: currentWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentWidth,
            boxSizing: 'border-box',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
          display: { xs: 'none', sm: 'block' }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#f4f6f8',
          minHeight: '100vh',
          mt: `${headerHeight}px`,
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onGetStarted={() => navigate('/login')} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/become-instructor" element={<BecomeInstructorPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/booking" element={
            <ProtectedRoute user={user}>
              <BookingPage />
            </ProtectedRoute>
          } />
          <Route path="/theory" element={
            <ProtectedRoute user={user}>
              <TheorySimulatorPage />
            </ProtectedRoute>
          } />
          <Route path="/swap" element={
            <ProtectedRoute user={user}>
              <SwapMarketPage />
            </ProtectedRoute>
          } />
          <Route path="/insurance" element={
            <ProtectedRoute user={user}>
              <InsurancePage />
            </ProtectedRoute>
          } />
          <Route path="/instructors" element={
            <ProtectedRoute user={user}>
              <AdvertisementPage />
            </ProtectedRoute>
          } />
          <Route path="/live-video" element={
            <ProtectedRoute user={user}>
              <LiveVideo />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute user={user}>
              <ProfilePage user={user} />
            </ProtectedRoute>
          } />

          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

// --- Main App Component ---
export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
