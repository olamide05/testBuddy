import React from 'react';

// A shared color palette for a consistent look
const colors = {
  primary: '#0056b3',      // A deeper, professional blue
  white: '#FFFFFF',
  dark: '#343a40',
};

// The Header component
export function Header() {
  return (
    <header style={{
      backgroundColor: colors.primary,
      padding: '15px 30px',
      color: colors.white,
      textAlign: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      DriveNow - Test Cancellation Finder
    </header>
  );
}

// The Footer component
export function Footer() {
  return (
    <footer style={{
      backgroundColor: colors.dark,
      padding: '20px',
      color: colors.white,
      textAlign: 'center',
      position: 'fixed',
      width: '100%',
      bottom: 0,
      fontSize: '0.9rem'
    }}>
      &copy; 2025 DriveNow Hackathon Team. All rights reserved.
    </footer>
  );
}
