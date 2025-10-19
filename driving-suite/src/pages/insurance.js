// import React from 'react';
//
// export default function InsurancePage() {
//   return <div style={{ padding: '20px 40px' }}><h2>Insurance Deals</h2><p>Compare quotes from Ireland's top insurance providers for learner drivers.</p></div>;
// }
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './Insurance.css';

const InsurancePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    experience: 'Intermediate',
  });

  const [quotes, setQuotes] = useState([]);

  const companies = [
    'AquaSure Insurance',
    'DiveSafe Co.',
    'OceanGuard Ltd.',
    'BlueBubble Assurance',
    'Neptune Risk Solutions',
  ];

  const baseQuote = 100;

  // Simulated fetch
  useEffect(() => {
    const fetchProfile = async () => {
      await new Promise((res) => setTimeout(res, 500));
      setProfile({
        name: 'Mahmoud Olamide Alimi Adetoro',
        age: 32,
        experience: 'Intermediate',
      });
    };
    fetchProfile();
  }, []);

  const generateQuotes = (profileData) => {
    const ageFactor = profileData.age > 40 ? 1.2 : 1;
    const experienceFactor =
        profileData.experience === 'Beginner'
            ? 1.5
            : profileData.experience === 'Intermediate'
                ? 1.2
                : 1;

    return companies.map((company, index) => {
      const modifier = 1 + index * 0.05;
      const quote = Math.round(baseQuote * ageFactor * experienceFactor * modifier * 100) / 100;
      return { company, quote };
    });
  };

  useEffect(() => {
    if (profile.name && profile.age) {
      setQuotes(generateQuotes(profile));
    }
  }, [profile]);

  const getGrade = (experience) => {
    if (experience === 'Beginner') return 'B';
    if (experience === 'Intermediate') return 'A';
    if (experience === 'Expert') return 'A+';
    return 'C';
  };

  // Download Certificate
  const downloadCertificate = async (company, quote) => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const gold = [255, 215, 0];
    const darkBlue = [15, 28, 46];
    const lightText = [240, 240, 240];

    // Background and border
    doc.setFillColor(...darkBlue);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(...gold);
    doc.setLineWidth(5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Logo
    const logo = new Image();
    logo.src = process.env.PUBLIC_URL + '/logo.png';
    const loadImage = () =>
        new Promise((resolve, reject) => {
          logo.onload = () => resolve(logo);
          logo.onerror = () => reject();
        });

    try {
      await loadImage();
      doc.addImage(logo, 'PNG', 25, 20, 50, 50); // slightly larger for clarity
    } catch {
      console.warn('Logo not found, skipping.');
    }

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...gold);
    doc.text('TestBuddy Certification of Excellence', pageWidth / 2, 50, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(...lightText);
    doc.text('Issued by TestBuddy Diving & Insurance Services', pageWidth / 2, 65, { align: 'center' });

    // Watermark
    doc.setFontSize(80);
    doc.setTextColor(255, 255, 255, 0.05);
    doc.text('TESTBUDDY', pageWidth / 2, pageHeight / 2 + 20, { align: 'center', angle: 45 });

    // Certificate Body
    doc.setFontSize(16);
    doc.setTextColor(...lightText);
    doc.text('This is to certify that', pageWidth / 2, 85, { align: 'center' });

    doc.setFont('times', 'bolditalic');
    doc.setFontSize(34);
    doc.setTextColor(...gold);
    doc.text(profile.name, pageWidth / 2, 105, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...lightText);
    doc.text(`Age: ${profile.age}`, pageWidth / 2, 118, { align: 'center' });

    doc.setFontSize(16);
    doc.text('has successfully completed the official TestBuddy Diving Program', pageWidth / 2, 138, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`Experience Level: ${profile.experience}`, pageWidth / 2, 155, { align: 'center' });
    doc.text(`Grade Achieved: ${getGrade(profile.experience)}`, pageWidth / 2, 165, { align: 'center' });

    // Insurance Details Box (moved higher)
    const boxY = 175;
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.rect(60, boxY, pageWidth - 120, 45); // taller box
    doc.setFontSize(15);
    doc.setTextColor(...gold);
    doc.text('Insurance Details', pageWidth / 2, boxY + 12, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(...lightText);
    doc.text(`Company: ${company}`, pageWidth / 2, boxY + 25, { align: 'center' });
    doc.text(`Quote: EUR ${quote}`, pageWidth / 2, boxY + 35, { align: 'center' });

    // Footer and Signature (higher to avoid overlap)
    const footerY = pageHeight - 30;
    doc.setFontSize(12);
    doc.setTextColor(...lightText);
    doc.text(`Issued on: ${new Date().toLocaleDateString()}`, 25, footerY - 10);

    doc.setDrawColor(...gold);
    doc.line(pageWidth - 90, footerY - 20, pageWidth - 40, footerY - 20);
    doc.setFontSize(11);
    doc.text('Authorized Signature', pageWidth - 65, footerY - 12, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(180);
    doc.text('© 2025 TestBuddy Insurance Co. | All Rights Reserved', pageWidth / 2, footerY, {
      align: 'center',
    });

    doc.save(`TestBuddy_Certificate_${profile.name}.pdf`);
  };

  return (
      <div className="insurance-container">
        <h1>🧜‍♂️ TestBuddy Diving Insurance</h1>

        {!profile.name ? (
            <p className="loading">Fetching profile data...</p>
        ) : (
            <>
              <p className="intro">
                Welcome back, <strong>{profile.name}</strong>! Here are your insurance options:
              </p>

              <div className="profile-summary">
                <p><strong>Age:</strong> {profile.age}</p>
                <p><strong>Experience:</strong> {profile.experience}</p>
                <p><strong>Grade:</strong> {getGrade(profile.experience)}</p>
              </div>

              <div className="quote-cards">
                {quotes.map(({ company, quote }) => (
                    <div key={company} className="quote-card">
                      <h3>{company}</h3>
                      <p><strong>Quote:</strong> EUR {quote}</p>
                      <button onClick={() => downloadCertificate(company, quote)}>
                        🏅 Generate Certificate
                      </button>
                    </div>
                ))}
              </div>
            </>
        )}
      </div>
  );
};

export default InsurancePage;

