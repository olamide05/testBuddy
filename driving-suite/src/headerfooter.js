import React from 'react';

// --- Color Palette for the Header ---
const headerColors = {
  primary: '#0056b3',      // A deeper, professional blue
  white: '#FFFFFF',
};

// --- The Header Component ---
export function Header() {
  return (
    <header style={{
      backgroundColor: headerColors.primary,
      padding: '15px 30px',
      color: headerColors.white,
      textAlign: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      DriveNow - Test Cancellation Finder
    </header>
  );
}

// --- Color Palette for the Footer ---
const footerColors = {
  background: 'rgba(25, 28, 32, 0.85)', // A semi-transparent dark background
  text: '#EAEAEA',                      // A soft white for the text
  accent: '#00D1B2',                   // A vibrant teal/mint for the border
  glow: 'rgba(0, 209, 178, 0.5)',      // A matching glow for the shadow
};

// --- The Beautiful Footer Component ---
export function Footer() {
  return (
    <footer style={{
      // Core Styling
      backgroundColor: footerColors.background,
      color: footerColors.text,
      textAlign: 'center',
      padding: '20px 30px',
      fontSize: '0.9rem',
      
      // Positioning
      position: 'fixed',
      width: '100%',
      bottom: 0,
      zIndex: 100, // Ensure it's above other content
          
      // Visual Effects for Beauty
      borderTop: `3px solid ${footerColors.accent}`,
      boxShadow: `0 -5px 20px -5px ${footerColors.glow}`,
      backdropFilter: 'blur(10px)', // The "glassmorphism" effect
      WebkitBackdropFilter: 'blur(10px)', // For Safari compatibility
      
      // Typography
      fontFamily: `'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
      fontWeight: '500',
      letterSpacing: '0.5px',
      textShadow: `0 0 8px rgba(255, 255, 255, 0.1)`,
    }}>
      &copy; 2025 DriveNow Hackathon Team. All rights reserved.
    </footer>
  );
}
