import React from 'react';

// --- Color Palette for the Sidebar ---
const colors = {
  white: '#FFFFFF',
  primary: '#0056b3',
  darkText: '#343a40',
  lightGray: '#f1f3f5',
};

// --- The Beautiful Sidebar Component ---
export function Sidebar({ currentPage, setCurrentPage }) {
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
      width: '260px',
      backgroundColor: colors.white,
      borderRight: '1px solid #e9ecef',
      height: '100vh',
      paddingTop: '90px', // Space for the fixed header
      boxShadow: '3px 0 15px -2px rgba(0,0,0,0.05)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      fontFamily: `'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
    }}>
      <div style={{ padding: '0 25px 20px 25px', fontSize: '1.2rem', fontWeight: 'bold', color: colors.primary }}>
        DriveNow
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {menuItems.map(({ key, label }) => {
          const isSelected = currentPage === key;
          return (
            <li key={key} style={{ padding: '5px 15px' }}>
              <button
                onClick={() => setCurrentPage(key)}
                style={{
                  width: '100%',
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  color: isSelected ? colors.white : colors.darkText,
                  border: 'none',
                  padding: '15px 20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = colors.lightGray;
                    e.currentTarget.style.color = colors.primary;
                  }
                }}
                onMouseOut={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.darkText;
                  }
                }}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
