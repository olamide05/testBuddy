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
import { auth } from './firebase';
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
const TESTBUDDY_COLOR = '#17a2b8'; // ✅ TestBuddy teal color from logo

// --- Layout Component (with navigation) ---
function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState({ loggedIn: false, name: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ PERSIST AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
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
        setUser({ loggedIn: false, name: '' });
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

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
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser({ loggedIn: false, name: '' });
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

  const currentPage = menuItems.find(item => item.path === location.pathname);
  const pageTitle = currentPage?.label || (location.pathname === '/' ? 'Home' : 'TestBuddy');

  const drawerContent = (
    <div>
      {/* ✨ Enhanced Sidebar Header with TestBuddy Color */}
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          px: 2.5, 
          height: `${headerHeight}px`,
          backgroundColor: TESTBUDDY_COLOR,
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        {isSidebarOpen && (
          <Typography 
            variant="h5" 
            noWrap 
            sx={{ 
              fontWeight: 700, 
              cursor: 'pointer',
              letterSpacing: '-0.5px',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }} 
            onClick={() => navigate('/')}
          >
            TestBuddy
          </Typography>
        )}
        {!isSidebarOpen && (
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              fontSize: '1.75rem',
              cursor: 'pointer'
            }} 
            onClick={() => navigate('/')}
          >
            
          </Typography>
        )}
        <IconButton 
          onClick={handleSidebarToggle}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.15)'
            }
          }}
        >
          {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      
      <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />
      
      {/* ✨ Enhanced Menu Items with TestBuddy Color */}
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map(({ path, label, icon, requiresAuth }) => {
          const isSelected = location.pathname === path;
          return (
            <Tooltip title={isSidebarOpen ? '' : label} placement="right" key={path}>
              <ListItemButton 
                sx={{ 
                  py: 1.5,
                  px: 2,
                  mb: 0.5,
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: isSelected ? `${TESTBUDDY_COLOR}15` : 'transparent',
                  color: isSelected ? TESTBUDDY_COLOR : 'inherit',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundColor: isSelected ? `${TESTBUDDY_COLOR}25` : 'rgba(0,0,0,0.04)',
                    transform: 'translateX(4px)',
                    boxShadow: isSelected ? `0 4px 12px ${TESTBUDDY_COLOR}40` : 'none'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: TESTBUDDY_COLOR,
                    opacity: isSelected ? 1 : 0,
                    transition: 'opacity 0.3s',
                    borderRadius: '0 4px 4px 0'
                  }
                }} 
                onClick={() => handleNavigation(path, requiresAuth)}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isSelected ? TESTBUDDY_COLOR : 'rgba(0,0,0,0.6)',
                    minWidth: isSidebarOpen ? 40 : 'auto',
                    '& svg': {
                      fontSize: '1.4rem',
                      transition: 'transform 0.3s',
                    },
                    '&:hover svg': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {icon}
                </ListItemIcon>
                {isSidebarOpen && (
                  <ListItemText 
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: isSelected ? 600 : 500,
                      letterSpacing: '0.02em'
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      
    </div>
  );

  const currentWidth = isSidebarOpen ? openDrawerWidth : closedDrawerWidth;

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
      
      {/* ✨ Enhanced Header with TestBuddy Color */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentWidth}px)` },
          ml: { sm: `${currentWidth}px` },
          backgroundColor: TESTBUDDY_COLOR,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: `${headerHeight}px` }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
            {pageTitle}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user.loggedIn ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontWeight: 700,
                      border: '2px solid rgba(255,255,255,0.5)'
                    }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
                    {user.name || 'User'}
                  </Typography>
                </Box>
                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    borderRadius: '8px',
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    }
                  }}
                >
                  Logout
                </Button>
                <IconButton 
                  color="inherit" 
                  onClick={handleLogout} 
                  sx={{ 
                    display: { xs: 'flex', sm: 'none' },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  startIcon={<LoginIcon />}
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    borderRadius: '8px',
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    }
                  }}
                >
                  Login
                </Button>
                <IconButton 
                  color="inherit" 
                  onClick={() => navigate('/login')} 
                  sx={{ 
                    display: { xs: 'flex', sm: 'none' },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    }
                  }}
                >
                  <LoginIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✨ Enhanced Sidebar / Drawer */}
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
            borderRight: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
            background: '#ffffff'
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
          bgcolor: '#f5f7fa',
          minHeight: '100vh',
          mt: `${headerHeight}px`,
        }}
      >
        <Routes>
          <Route path="/" element={<LandingPage onGetStarted={() => navigate('/login')} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/become-instructor" element={<BecomeInstructorPage />} />
          <Route path="/dashboard" element={<ProtectedRoute user={user} loading={loading}><Dashboard /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute user={user} loading={loading}><BookingPage /></ProtectedRoute>} />
          <Route path="/theory" element={<ProtectedRoute user={user} loading={loading}><TheorySimulatorPage /></ProtectedRoute>} />
          <Route path="/swap" element={<ProtectedRoute user={user} loading={loading}><SwapMarketPage /></ProtectedRoute>} />
          <Route path="/insurance" element={<ProtectedRoute user={user} loading={loading}><InsurancePage /></ProtectedRoute>} />
          <Route path="/instructors" element={<ProtectedRoute user={user} loading={loading}><AdvertisementPage /></ProtectedRoute>} />
          <Route path="/live-video" element={<ProtectedRoute user={user} loading={loading}><LiveVideo /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={user} loading={loading}><ProfilePage user={user} /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
