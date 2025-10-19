import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, CssBaseline, Drawer, List, ListItemButton, 
  ListItemIcon, ListItemText, IconButton, Avatar, Tooltip, Divider, Button 
} from '@mui/material';
import { 
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, Dashboard as DashboardIcon, 
  DirectionsCar, School, MonetizationOn, Assignment, AccountCircle, 
  Login as LoginIcon, Logout as LogoutIcon, SwapHoriz  
} from '@mui/icons-material';

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

// --- Configuration ---
const openDrawerWidth = 260;
const closedDrawerWidth = 72;
const headerHeight = 64;

// --- Main App Layout Component ---
export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPageKey, setCurrentPageKey] = useState('landing');
  const [user, setUser] = useState({ loggedIn: false, name: '' });

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogin = (userData) => {
    // userData can include name, email, etc. from login form
    setUser({ loggedIn: true, name: userData?.name || 'User' });
    setCurrentPageKey('dashboard');
  };

  const handleLogout = () => {
    setUser({ loggedIn: false, name: '' });
    setCurrentPageKey('landing');
  };

  // Handle navigation with authentication check
  const handleNavigation = (pageKey, requiresAuth) => {
    if (requiresAuth && !user.loggedIn) {
      setCurrentPageKey('login');
    } else {
      setCurrentPageKey(pageKey);
    }
  };

  // --- Menu Configuration (defined inside component to access handleLogin) ---
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, component: <Dashboard />, requiresAuth: true },
    { key: 'booking', label: 'Find a Test', icon: <DirectionsCar />, component: <BookingPage />, requiresAuth: true },
    { key: 'theory', label: 'Theory & Simulator', icon: <School />, component: <TheorySimulatorPage />, requiresAuth: true },
    { key: 'swap', label: 'Test Swap Market', icon: <SwapHoriz />, component: <SwapMarketPage />, requiresAuth: true },
    { key: 'insurance', label: 'Insurance Deals', icon: <MonetizationOn />, component: <InsurancePage />, requiresAuth: true },
    { key: 'instructors', label: 'Instructors', icon: <Assignment />, component: <AdvertisementPage />, requiresAuth: true },
    { key: 'live-video', label: 'Live Video', icon: <Assignment />, component: <LiveVideo />, requiresAuth: true },
    { key: 'profile', label: 'My Profile', icon: <AccountCircle />, component: <ProfilePage user={user} />, requiresAuth: true },
  ];

  const publicPages = [
    { key: 'landing', label: 'Home', component: <LandingPage onGetStarted={() => setCurrentPageKey('login')} />, requiresAuth: false },
    { key: 'login', label: 'Login', component: <LoginPage onLogin={handleLogin} />, requiresAuth: false },
  ];

  // Get current page from all available pages
  const allPages = [...menuItems, ...publicPages];
  const currentPage = allPages.find(p => p.key === currentPageKey) || publicPages[0];

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [2], height: `${headerHeight}px` }}>
        {isSidebarOpen && (
          <Typography variant="h5" noWrap sx={{ fontWeight: 'bold' }}>
            DriveNow
          </Typography>
        )}
        <IconButton onClick={handleSidebarToggle}>
          {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map(({ key, label, icon, requiresAuth }) => (
          <Tooltip title={isSidebarOpen ? '' : label} placement="right" key={key}>
            <ListItemButton 
              sx={{ py: 1.5 }} 
              onClick={() => handleNavigation(key, requiresAuth)} 
              selected={currentPageKey === key}
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
            {currentPage?.label || 'DriveNow'}
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
                  onClick={() => setCurrentPageKey('login')}
                  startIcon={<LoginIcon />}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Login
                </Button>
                <IconButton 
                  color="inherit" 
                  onClick={() => setCurrentPageKey('login')} 
                  sx={{ display: { xs: 'flex', sm: 'none' } }}
                >
                  <LoginIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar / Drawer - ALWAYS VISIBLE */}
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
        {currentPage?.component}
      </Box>
    </Box>
  );
}
