import React, { useState } from 'react';

// --- Configuration ---

// Fake data to simulate cancellations found by a scraper
const fakeCancellationData = [
  { date: '2025-11-05', location: 'Dublin (Finglas)', slots: ['09:15 AM', '11:45 AM', '02:30 PM'] },
  { date: '2025-11-10', location: 'Cork (Wilton)', slots: ['08:30 AM', '10:15 AM'] },
  { date: '2025-11-15', location: 'Galway (Westside)', slots: ['12:00 PM', '03:00 PM', '04:15 PM'] },
  { date: '2025-11-20', location: 'Limerick (Woodview)', slots: ['09:00 AM', '01:45 PM'] },
];

// A modern color palette for a professional look
const colors = {
  primary: '#007BFF',      // A vibrant blue for interactive elements
  secondary: '#6C757D',    // Muted gray for secondary text
  background: '#F8F9FA',   // Soft, light gray for the page background
  white: '#FFFFFF',         // Clean white for cards
  success: '#28A745',      // Green for available slots
  text: '#212529',          // Primary text color
};

// --- React Component ---

function CalendarPage() {
  // State to track which date is currently selected/expanded
  const [selectedDate, setSelectedDate] = useState(null);

  // Function to handle clicks on a date item
  const handleDateClick = (date) => {
    // If the clicked date is already selected, deselect it (toggle effect)
    if (selectedDate === date) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: colors.background, minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '700px', margin: 'auto' }}>
        <h1 style={{ color: colors.primary, textAlign: 'center', marginBottom: '30px' }}>
          Driving Test Cancellations
        </h1>
        <div style={{ backgroundColor: colors.white, padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <p style={{ color: colors.secondary, textAlign: 'center', marginBottom: '25px' }}>
            The following test slots were found by our automated cancellation checker. Click a date to view available times.
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {fakeCancellationData.map(({ date, location, slots }) => (
              <li
                key={date}
                onClick={() => handleDateClick(date)}
                style={{
                  cursor: 'pointer',
                  marginBottom: '12px',
                  padding: '15px 20px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  borderLeft: selectedDate === date ? `5px solid ${colors.primary}` : `5px solid transparent`,
                  backgroundColor: selectedDate === date ? '#e7f3ff' : colors.white,
                  transition: 'all 0.3s ease',
                  boxShadow: selectedDate === date ? '0 2px 5px rgba(0,123,255,0.2)' : 'none',
                }}
                title="Click to view available slots"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: colors.text, fontSize: '1.1em' }}>{date}</strong>
                  <span style={{ color: colors.secondary }}>{location}</span>
                </div>
                {selectedDate === date && (
                  <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <p style={{ margin: '0 0 10px 0', color: colors.secondary, fontSize: '0.9em' }}>Available Times:</p>
                    {slots.map((time) => (
                      <button 
                        key={time} 
                        style={{ 
                          backgroundColor: colors.success, 
                          color: colors.white, 
                          border: 'none', 
                          borderRadius: '4px', 
                          padding: '8px 12px', 
                          margin: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;

