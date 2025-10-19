import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, CssBaseline, Drawer, List, ListItemButton, 
  ListItemIcon, ListItemText, IconButton, Avatar, Tooltip, Divider 
} from '@mui/material';
import { 
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, Dashboard as DashboardIcon, DirectionsCar, 
  School, MonetizationOn, Assignment, AccountCircle, Login, SwapHoriz  // ← ADDED SwapHoriz
} from '@mui/icons-material';

// --- Page Imports (CRITICAL: Make sure these paths are correct) ---
import Dashboard from './pages/dashboard';
import InsurancePage from './pages/insurance';
import AdvertisementPage from './pages/instructors';
import LoginPage from './pages/login';
import ProfilePage from './pages/profile';
import BookingPage from './pages/booking';
import TheorySimulatorPage from './pages/simulator-theory';
import SwapMarketPage from './pages/swap-market';
import LiveVideo from './pages/live-video';

// --- Configuration ---
const openDrawerWidth = 260;
const closedDrawerWidth = 72;
const headerHeight = 64;

// --- Menu Configuration with Components ---
const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, component: <Dashboard /> },
  { key: 'booking', label: 'Find a Test', icon: <DirectionsCar />, component: <BookingPage /> },
  { key: 'theory', label: 'Theory & Simulator', icon: <School />, component: <TheorySimulatorPage /> },
  { key: 'swap', label: 'Test Swap Market', icon: <SwapHoriz />, component: <SwapMarketPage /> }, // ← ADDED THIS
  { key: 'insurance', label: 'Insurance Deals', icon: <MonetizationOn />, component: <InsurancePage /> },
  { key: 'instructors', label: 'Instructors', icon: <Assignment />, component: <AdvertisementPage /> },
  { key: 'live-video', label: 'Video', icon: <Assignment />, component: <LiveVideo/> },
];

const userMenuItems = [
  { key: 'profile', label: 'My Profile', icon: <AccountCircle />, component: <ProfilePage /> },
  { key: 'login', label: 'Login / Register', icon: <Login />, component: <LoginPage /> },
];

const allPages = [...menuItems, ...userMenuItems];

// --- Main App Layout Component ---
export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPageKey, setCurrentPageKey] = useState('dashboard');
  const [user, setUser] = useState({ loggedIn: true, name: 'Naza' });

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
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
        {menuItems.map(({ key, label, icon }) => (
          <Tooltip title={isSidebarOpen ? '' : label} placement="right" key={key}>
            <ListItemButton sx={{ py: 1.5 }} onClick={() => setCurrentPageKey(key)} selected={currentPageKey === key}>
              <ListItemIcon>{icon}</ListItemIcon>
              {isSidebarOpen && <ListItemText primary={label} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Divider />
      <List>
        {userMenuItems.map(({ key, label, icon }) => (
          <Tooltip title={isSidebarOpen ? '' : label} placement="right" key={key}>
            <ListItemButton sx={{ py: 1.5 }} onClick={() => setCurrentPageKey(key)} selected={currentPageKey === key}>
              <ListItemIcon>{icon}</ListItemIcon>
              {isSidebarOpen && <ListItemText primary={label} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </div>
  );

  const currentWidth = isSidebarOpen ? openDrawerWidth : closedDrawerWidth;
  const currentPage = allPages.find(p => p.key === currentPageKey);

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
            {currentPage?.label || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>{user.name ? user.name.charAt(0) : 'G'}</Avatar>
            <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user.name || 'Guest'}</Typography>
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
        {currentPage?.component || <Dashboard />}
      </Box>
    </Box>
  );
}