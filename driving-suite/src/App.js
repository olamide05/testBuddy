import React, { useState } from 'react';

// Import layout components
import { Header, Footer } from './headerfooter';

import MainPage from './pages/dashboard';
import InsurancePage from './pages/insurance';
import AdvertisementPage from './pages/instructors';
import LoginPage from './pages/login';
import ProfilePage from './pages/profile';
import BookingPage from './pages/booking';
import TheorySimulatorPage from './pages/simulator-theory';

// --- Color Palette ---
const colors = {
  primary: '#0056b3',
  white: '#FFFFFF',
  darkText: '#343a40',
  background: '#f8f9fa',
};

// --- Sidebar Component ---
function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { key: 'main', label: 'Dashboard' },
    { key: 'booking', label: 'Find a Test' },
    { key: 'theory', label: 'Theory & Simulator' },
    { key: 'insurance', label: 'Insurance Deals' },
    { key: 'advertisement', label: 'Instructors' },
    { key: 'profile', label: 'My Profile' },
    { key: 'login', label: 'Login / Register' },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: colors.white,
      borderRight: '1px solid #dee2e6',
      height: '100%',
      paddingTop: '20px',
      boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
    }}>
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {menuItems.map(item => (
          <li key={item.key}>
            <button
              onClick={() => setCurrentPage(item.key)}
              style={{
                width: '100%',
                backgroundColor: currentPage === item.key ? colors.primary : 'transparent',
                color: currentPage === item.key ? colors.white : colors.darkText,
                border: 'none',
                padding: '18px 25px',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: currentPage === item.key ? '600' : 'normal',
                fontSize: '1rem',
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// --- Main App Component ---
function App() {
  const [currentPage, setCurrentPage] = useState('main');

  const renderPage = () => {
    switch (currentPage) {
      case 'main': return <MainPage />;
      case 'insurance': return <InsurancePage />;
      case 'advertisement': return <AdvertisementPage />;
      case 'login': return <LoginPage />;
      case 'profile': return <ProfilePage />;
      case 'booking': return <BookingPage />;
      case 'theory': return <TheorySimulatorPage />;
      default: return <MainPage />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: colors.background }}>
          {renderPage()}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
