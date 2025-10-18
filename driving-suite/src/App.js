import React from 'react';
import CalendarPage from './CalendarPage'; // Assuming your calendar logic is here
import { Header, Footer } from './headerfooter'; // Import Header and Footer
import './App.css'; // Optional, if you have global styles

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <CalendarPage />
      </main>
      <Footer />
    </div>
  );
}

export default App;
