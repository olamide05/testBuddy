import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "./insurance.css";
import { db, auth  , app} from "../firebase";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";


// CONSTANTS FOR CONFIGURATION
const BASE_QUOTE_AMOUNT = 500;
const BASE_CAR_VALUE = 30000;
const MAX_DEPRECIATION_RATE = 0.8;
const ANNUAL_DEPRECIATION_PERCENTAGE = 0.05;

// Experience factors based on years
const EXPERIENCE_YEARS_FACTORS = [
  { years: 1, factor: 1.5 },
  { years: 4, factor: 1.3 },
  { years: 9, factor: 1.0 },
  { years: 99, factor: 0.8 },
];

// Experience grades based on years
const EXPERIENCE_YEARS_GRADES = [
  { years: 1, grade: "C" },
  { years: 4, grade: "B" },
  { years: 9, grade: "A" },
  { years: 99, grade: "A+" },
];

const CAR_TYPE_FACTORS = {
  Sports: 1.6,
  SUV: 1.3,
  Electric: 0.9,
  Standard: 1,
};

const companies = [
  "AquaSure Insurance",
  "DiveSafe Co.",
  "OceanGuard Ltd.",
  "BlueBubble Assurance",
  "Neptune Risk Solutions",
];

const InsurancePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    age: 0,
    yearsOfExperience: 5,
    annualMileage: 10000,
    ncdYears: 3,
    car: { 
      make: "", 
      model: "", 
      year: "", 
      type: "", 
      value: 0, 
      engineSize: "", 
      doors: "", 
      transmission: "", 
      fuel: "" 
    },
  });

  const [quotes, setQuotes] = useState([]);
  const [regNumber, setRegNumber] = useState("");
  const [loadingReg, setLoadingReg] = useState(false);
  const [carImageUrl, setCarImageUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState({ message: "", isError: false });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        console.log("User authenticated:", user.uid);
      } else {
        setCurrentUser(null);
        setStatusMessage({ 
          message: " Please sign in to view your profile.",
          isError: true 
        });
        setIsLoadingProfile(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch profile data from Firebase when user is authenticated
  useEffect(() => {
    const fetchProfileFromFirebase = async () => {
      if (!currentUser) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        // FIXED: Now using the authenticated user's UID as the document ID
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const fetchedFirstName = userData.firstName || "";
          const fetchedLastName = userData.lastName || "";
          const fullName = `${fetchedFirstName} ${fetchedLastName}`.trim();

          setProfile((prev) => ({
            ...prev,
            name: fullName,
            age: userData.age || prev.age,
            yearsOfExperience: userData.yearsOfExperience || prev.yearsOfExperience,
            annualMileage: userData.annualMileage || prev.annualMileage,
            ncdYears: userData.ncdYears || prev.ncdYears,
          }));
          setStatusMessage({ 
            message: `Welcome back, ${fullName}!`,
            isError: false 
          });
        } else {
          console.warn("No user profile found in Firestore for UID:", currentUser.uid);
          setStatusMessage({ 
            message: "No profile found. Please complete your profile setup.",
            isError: false 
          });
          // Use display name from auth if available
          const displayName = currentUser.displayName || "User";
          setProfile((prev) => ({
            ...prev,
            name: displayName,
            age: 32,
            yearsOfExperience: 5,
            annualMileage: 10000,
            ncdYears: 3,
          }));
        }
      } catch (error) {
        console.error("Error fetching profile from Firebase:", error);
        setStatusMessage({ 
          message: `Error fetching profile: ${error.message}`,
          isError: true 
        });
        // Fallback to default values
        setProfile((prev) => ({
          ...prev,
          name: currentUser.displayName || "User",
          age: 32,
          yearsOfExperience: 5,
          annualMileage: 10000,
          ncdYears: 3,
        }));
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileFromFirebase();
  }, [currentUser]); // Depend on currentUser

  // Helper to safely get text from XML
  // WARNING: This external API call exposes credentials in client-side code.
  // For production, move this to a Cloud Function or backend API.
  const getFirstTextContent = (doc, tagNames) => {
    for (const tagName of tagNames) {
      const element = doc.getElementsByTagName(tagName)[0];
      if (element) {
        const nestedText = element.getElementsByTagName("CurrentTextValue")[0]?.textContent?.trim();
        if (nestedText) return nestedText;
        const directText = element.textContent?.trim();
        if (directText) return directText;
      }
    }
    return "";
  };

  const handleLookupRegistration = async () => {
    const trimmedRegNumber = regNumber.trim().toUpperCase();
    if (!trimmedRegNumber) {
      setStatusMessage({ message: "Please enter a registration number.", isError: true });
      return;
    }

    // Check if user is authenticated
    if (!currentUser) {
      setStatusMessage({ 
        message: " Please sign in to lookup vehicle information.",
        isError: true 
      });
      return;
    }

    setLoadingReg(true);
    setStatusMessage({ message: "🔍 Looking up vehicle...", isError: false });
    setCarImageUrl("");

    try {
      // 1. Check Firebase cache
      const carDocRef = doc(db, "cachedCars", trimmedRegNumber);
      const carDocSnap = await getDoc(carDocRef);

      if (carDocSnap.exists()) {
        const cachedCarData = carDocSnap.data();
        setProfile((prev) => ({ ...prev, car: cachedCarData }));
        setCarImageUrl(cachedCarData.imageUrl || "");
        setStatusMessage({ 
          message: `✅ Found ${cachedCarData.make} ${cachedCarData.model} (${cachedCarData.year}) (from cache)`, 
          isError: false 
        });
        setLoadingReg(false);
        return;
      }

      // 2. Call external API
      const response = await fetch(
        `https://www.carregistrationapi.ie/api/reg.asmx/CheckIreland?RegistrationNumber=${trimmedRegNumber}&username=GoogleBGn`
      );

      // Improved error handling
      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        let errorText = "";

        try {
          errorText = await response.text();
          const errorParser = new DOMParser();
          const errorXmlDoc = errorParser.parseFromString(errorText, "text/xml");
          const errorDescription = 
            errorXmlDoc.getElementsByTagName("string")[0]?.textContent || 
            errorXmlDoc.getElementsByTagName("Error")[0]?.textContent;
          
          if (errorDescription) {
            errorMessage = `API Error: ${errorDescription}`;
          } else {
            errorMessage = `API returned error: ${errorText.substring(0, Math.min(errorText.length, 200))}`;
          }
        } catch (parseError) {
          errorMessage = `API returned non-OK response: ${response.status}`;
          if (errorText) {
            errorMessage += ` - ${errorText.substring(0, Math.min(errorText.length, 200))}`;
          }
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");

      const make = getFirstTextContent(xmlDoc, ["MakeDescription", "CarMake", "VehicleMake"]);
      const model = getFirstTextContent(xmlDoc, ["ModelDescription", "CarModel", "VehicleModel"]);
      const year = getFirstTextContent(xmlDoc, ["RegistrationYear", "YearOfManufacture", "VehicleYear"]);
      const bodyType = getFirstTextContent(xmlDoc, ["BodyStyle", "BodyType", "VehicleBodyType"]);
      const fuel = getFirstTextContent(xmlDoc, ["FuelType", "VehicleFuelType"]);
      const engineSize = getFirstTextContent(xmlDoc, ["EngineSize"]);
      const doors = getFirstTextContent(xmlDoc, ["NumberOfDoors"]);
      const transmission = getFirstTextContent(xmlDoc, ["Transmission"]);

      let imageUrl = "";
      const vehicleJsonElement = xmlDoc.getElementsByTagName("vehicleJson")[0];
      if (vehicleJsonElement) {
        try {
          const vehicleJson = JSON.parse(vehicleJsonElement.textContent);
          imageUrl = vehicleJson.ImageUrl || "";
        } catch (jsonErr) {
          console.warn("Could not parse vehicleJson for ImageUrl:", jsonErr);
        }
      }
      setCarImageUrl(imageUrl);

      if (make && model && year) {
        const estimatedValue = estimateCarValue(parseInt(year));
        const carDetailsToCache = {
          make,
          model,
          year: parseInt(year),
          type: bodyType || "Standard",
          value: estimatedValue,
          engineSize: engineSize || "N/A",
          doors: doors || "N/A",
          transmission: transmission || "N/A",
          fuel: fuel || "N/A",
          imageUrl: imageUrl || "",
          cachedAt: new Date().toISOString(),
        };

        try {
          await setDoc(carDocRef, carDetailsToCache);
          console.log("Car data cached in Firebase:", trimmedRegNumber);
        } catch (firebaseErr) {
          console.error("Error writing document to Firebase:", firebaseErr);
          // Continue even if caching fails
        }

        setProfile((prev) => ({ ...prev, car: carDetailsToCache }));
        setStatusMessage({ 
          message: ` Found ${make} ${model} (${year})`,
          isError: false 
        });
      } else {
        console.warn("Incomplete vehicle data. Raw XML Response:", text);
        setStatusMessage({ 
          message: "Vehicle not found for that registration. Please check the format and try again.",
          isError: true 
        });
      }
    } catch (err) {
      console.error("Error fetching vehicle data:", err);
      
      // User-friendly error messages
      let userMessage = " Error looking up registration: ";
      if (err.message.includes("quota") || err.message.includes("limit")) {
        userMessage += "Service temporarily unavailable. Please try again later.";
      } else if (err.message.includes("not found") || err.message.includes("404")) {
        userMessage += "Vehicle not found for that registration.";
      } else if (err.message.includes("network") || err.message.includes("fetch")) {
        userMessage += "Network error. Please check your connection.";
      } else {
        userMessage += err.message;
      }
      
      setStatusMessage({ message: userMessage, isError: true });
    } finally {
      setLoadingReg(false);
    }
  };

  const estimateCarValue = (year) => {
    const currentYear = new Date().getFullYear();
    const depreciation = Math.min(
      (currentYear - year) * ANNUAL_DEPRECIATION_PERCENTAGE, 
      MAX_DEPRECIATION_RATE
    );
    return Math.round(BASE_CAR_VALUE * (1 - depreciation));
  };

  const generateQuotes = (profileData) => {
    const carValue = profileData.car.value || BASE_CAR_VALUE;
    const valueFactor = (carValue / BASE_CAR_VALUE) * 2.5;
    const ageFactor = profileData.age > 40 ? 1.1 : profileData.age < 25 ? 1.3 : 1;

    let experienceFactor = 1;
    for (const range of EXPERIENCE_YEARS_FACTORS) {
      if (profileData.yearsOfExperience <= range.years) {
        experienceFactor = range.factor;
        break;
      }
    }

    const typeFactor = CAR_TYPE_FACTORS[profileData.car.type] || CAR_TYPE_FACTORS.Standard;
    const mileageFactor = 
      profileData.annualMileage > 15000 ? 1.15 : 
      profileData.annualMileage < 5000 ? 0.9 : 1;
    const ncdFactor = Math.max(1 - profileData.ncdYears * 0.05, 0.7);

    return companies.map((company, index) => {
      const companyModifier = 1 + index * 0.03;
      const quote =
        Math.round(
          BASE_QUOTE_AMOUNT *
            ageFactor *
            experienceFactor *
            typeFactor *
            valueFactor *
            mileageFactor *
            ncdFactor *
            companyModifier *
            100
        ) / 100;
      return { company, quote };
    });
  };

  // Generate quotes when profile changes
  useEffect(() => {
    if (profile.name && profile.age && !isLoadingProfile) {
      setQuotes(generateQuotes(profile));
    } else {
      setQuotes([]);
    }
  }, [profile, isLoadingProfile]);

  const getGrade = (yearsOfExperience) => {
    for (const range of EXPERIENCE_YEARS_GRADES) {
      if (yearsOfExperience <= range.years) return range.grade;
    }
    return "C";
  };

  const handleProfileChange = (e) => {
    const { name, value, type } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const downloadCertificate = async (company, quote) => {
    const pdfDoc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    const pageHeight = pdfDoc.internal.pageSize.getHeight();
    const gold = [255, 215, 0];
    const darkBlue = [15, 28, 46];
    const lightText = [240, 240, 240];
    const certificateId = `TBQC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    pdfDoc.setFillColor(...darkBlue);
    pdfDoc.rect(0, 0, pageWidth, pageHeight, "F");
    pdfDoc.setDrawColor(...gold);
    pdfDoc.setLineWidth(5);
    pdfDoc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setFontSize(28);
    pdfDoc.setTextColor(...gold);
    pdfDoc.text("TestBuddy Insurance Quote Certificate", pageWidth / 2, 50, { align: "center" });

    pdfDoc.setFontSize(14);
    pdfDoc.setTextColor(...lightText);
    pdfDoc.text("Issued by TestBuddy Diving & Insurance Services", pageWidth / 2, 65, { align: "center" });

    pdfDoc.setFontSize(16);
    pdfDoc.text("This is to certify a quote for", pageWidth / 2, 85, { align: "center" });

    pdfDoc.setFont("times", "bolditalic");
    pdfDoc.setFontSize(34);
    pdfDoc.setTextColor(...gold);
    pdfDoc.text(profile.name, pageWidth / 2, 105, { align: "center" });

    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.setFontSize(14);
    pdfDoc.setTextColor(...lightText);
    pdfDoc.text(`Age: ${profile.age}`, pageWidth / 2, 118, { align: "center" });

    pdfDoc.setFontSize(16);
    pdfDoc.text("based on the following details:", pageWidth / 2, 138, { align: "center" });

    pdfDoc.setFontSize(14);
    pdfDoc.text(`Years of Experience: ${profile.yearsOfExperience}`, pageWidth / 2, 155, { align: "center" });
    pdfDoc.text(`Grade Achieved: ${getGrade(profile.yearsOfExperience)}`, pageWidth / 2, 165, { align: "center" });

    const boxY = 175;
    pdfDoc.setDrawColor(...gold);
    pdfDoc.setLineWidth(0.8);
    pdfDoc.rect(60, boxY, pageWidth - 120, 85);
    pdfDoc.setFontSize(15);
    pdfDoc.setTextColor(...gold);
    pdfDoc.text("Insurance Details", pageWidth / 2, boxY + 12, { align: "center" });

    pdfDoc.setFontSize(13);
    pdfDoc.setTextColor(...lightText);
    pdfDoc.text(`Certificate ID: ${certificateId}`, pageWidth / 2, boxY + 25, { align: "center" });
    pdfDoc.text(`Company: ${company}`, pageWidth / 2, boxY + 35, { align: "center" });
    pdfDoc.text(`Quote: EUR ${quote}`, pageWidth / 2, boxY + 45, { align: "center" });
    
    if (profile.car.make) {
      pdfDoc.text(
        `Car: ${profile.car.make} ${profile.car.model} (${profile.car.year})`,
        pageWidth / 2,
        boxY + 55,
        { align: "center" }
      );
      pdfDoc.text(
        `Type: ${profile.car.type}, Engine: ${profile.car.engineSize}, Doors: ${profile.car.doors}`,
        pageWidth / 2,
        boxY + 65,
        { align: "center" }
      );
      pdfDoc.text(
        `Transmission: ${profile.car.transmission}, Fuel: ${profile.car.fuel}`,
        pageWidth / 2,
        boxY + 75,
        { align: "center" }
      );
    }

    const footerY = pageHeight - 30;
    pdfDoc.setFontSize(12);
    pdfDoc.setTextColor(...lightText);
    pdfDoc.text(`Issued on: ${new Date().toLocaleDateString()}`, 25, footerY - 10);

    pdfDoc.save(`TestBuddy_Quote_Certificate_${profile.name.replace(/\s+/g, "_")}.pdf`);
  };

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="insurance-container">
        <h1>TestBuddy Diving & Car Insurance</h1>
        <p className="loading">Loading your profile...</p>
      </div>
    );
  }

  // Not authenticated state
  if (!currentUser) {
    return (
      <div className="insurance-container">
        <h1>TestBuddy Diving & Car Insurance</h1>
        <div className="status-message error">
          ⚠️ Please sign in to access insurance quotes.
        </div>
      </div>
    );
  }

  return (
    <div className="insurance-container">
      <h1>TestBuddy Diving & Car Insurance</h1>
      <p className="intro">
        Welcome back, <strong>{profile.name}</strong>! Compare insurance quotes below 👇
      </p>

      {statusMessage.message && (
        <div className={`status-message ${statusMessage.isError ? "error" : "success"}`}>
          {statusMessage.message}
        </div>
      )}

      <div className="profile-summary card">
        <h3>Your Profile</h3>
        <div className="profile-details-grid">
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <div>
            <label htmlFor="age">
              <strong>Age:</strong>
            </label>
            <input
              id="age"
              type="number"
              name="age"
              value={profile.age}
              onChange={handleProfileChange}
              min="18"
              max="99"
              className="small-input"
            />
          </div>
          <div>
            <label htmlFor="yearsOfExperience">
              <strong>Years of Experience:</strong>
            </label>
            <input
              id="yearsOfExperience"
              type="number"
              name="yearsOfExperience"
              value={profile.yearsOfExperience}
              onChange={handleProfileChange}
              min="0"
              max="50"
              className="small-input"
            />
            <span className="grade-badge">Grade: {getGrade(profile.yearsOfExperience)}</span>
          </div>
          <div>
            <label htmlFor="annualMileage">
              <strong>Annual Mileage:</strong>
            </label>
            <input
              id="annualMileage"
              type="number"
              name="annualMileage"
              value={profile.annualMileage}
              onChange={handleProfileChange}
              min="0"
              step="1000"
              className="small-input"
            />
          </div>
          <div>
            <label htmlFor="ncdYears">
              <strong>No Claims Years:</strong>
            </label>
            <input
              id="ncdYears"
              type="number"
              name="ncdYears"
              value={profile.ncdYears}
              onChange={handleProfileChange}
              min="0"
              max="15"
              className="small-input"
            />
          </div>
        </div>

        {profile.car.make && (
          <>
            <hr />
            <h3>Your Car Details</h3>
            {carImageUrl && (
              <div className="car-image-container">
                <img
                  src={carImageUrl}
                  alt={`${profile.car.make} ${profile.car.model}`}
                  className="car-image"
                />
              </div>
            )}
            <p>
              <strong>Make:</strong> {profile.car.make}
            </p>
            <p>
              <strong>Model:</strong> {profile.car.model}
            </p>
            <p>
              <strong>Year:</strong> {profile.car.year}
            </p>
            <p>
              <strong>Type:</strong> {profile.car.type}
            </p>
            <p>
              <strong>Value:</strong> €{profile.car.value.toLocaleString()}
            </p>
            <p>
              <strong>Engine Size:</strong> {profile.car.engineSize}
            </p>
            <p>
              <strong>Doors:</strong> {profile.car.doors}
            </p>
            <p>
              <strong>Transmission:</strong> {profile.car.transmission}
            </p>
            <p>
              <strong>Fuel Type:</strong> {profile.car.fuel}
            </p>
          </>
        )}
      </div>

      <div className="reg-section card">
        <h3>🚗 Enter Registration Number</h3>
        <div className="reg-input-group">
          <input
            type="text"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
            placeholder="e.g., 23D12345"
            className="reg-input"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleLookupRegistration();
              }
            }}
          />
          <button
            onClick={handleLookupRegistration}
            disabled={loadingReg}
            className="lookup-button"
          >
            {loadingReg ? "Looking up..." : "Lookup Car"}
          </button>
        </div>
      </div>

      <div className="quote-cards-container">
        <h2>💰 Your Insurance Quotes</h2>
        <div className="quote-cards">
          {quotes.length > 0 ? (
            quotes.map(({ company, quote }) => (
              <div key={company} className="quote-card card">
                <h3>{company}</h3>
                <p className="quote-price">
                  <strong>EUR {quote.toLocaleString()}</strong>
                </p>
                <button
                  onClick={() => downloadCertificate(company, quote)}
                  className="certificate-button"
                >
                  Download Certificate
                </button>
              </div>
            ))
          ) : (
            <p>Add your vehicle details to see quotes.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsurancePage;
