import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Twitter } from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from 'firebase/firestore';

// --- Animation Variants ---
const formVariants = {
  hidden: { opacity: 0, x: -40, transition: { duration: 0.4, ease: "easeInOut" } },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeInOut" } },
};

const panelVariants = {
  login: { backgroundColor: '#2563EB' },
  signup: { backgroundColor: '#16A34A' },
};

// --- Reusable InputField Component ---
const InputField = ({ icon: Icon, placeholder, type, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
    <Icon style={{ color: '#9ca3af', marginRight: '15px' }} size={22} />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', color: '#1f2937' }}
    />
  </div>
);

// --- Main Login/Signup Component ---
export default function LoginSignupPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => setIsLogin(!isLogin);

  // Function to create initial user document in Firestore
  const createUserDocument = async (user, displayName) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Check if document already exists
      const existingDoc = await getDoc(userRef);
      if (existingDoc.exists()) {
        console.log('User document already exists');
        return existingDoc.data();
      }

      // Split name into first and last name
      const nameParts = displayName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        // Personal Information
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: null,
        age: null,
        ppsn: '',
        email: user.email,
        phone: '',

        // Address
        address: {
          street: '',
          city: '',
          county: '',
          eircode: ''
        },

        // Driving Preferences
        transmissionPreference: 'manual',
        vehicleCategory: 'B',

        // Theory Test
        theoryTest: {
          passed: false,
          passDate: null,
          certificateNumber: '',
          expiryDate: null
        },

        // Learner Permit
        learnerPermit: {
          hasPermit: false,
          permitNumber: '',
          issueDate: null,
          expiryDate: null,
          category: 'B'
        },

        // EDT Progress
        edtProgress: {
          lessonsCompleted: 0,
          lessonsRemaining: 12,
          instructorName: '',
          completionDate: null,
        },

        // Driving Test
        drivingTest: {
          eligible: false,
          booked: false,
          testDate: null,
          testCentre: '',
          attempts: 0,
          passed: false
        },

        // Medical Information
        medicalInfo: {
          eyesightReport: false,
          eyesightDate: null,
          medicalReportRequired: false,
          medicalReportDate: null,
          notes: ''
        },

        // Preferences
        preferences: {
          preferredInstructor: '',
          preferredLessonDays: [],
          preferredTime: '',
          testCentrePreference: []
        },

        // Account Info
        account: {
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          subscriptionType: 'free',
          paymentStatus: 'unpaid'
        },

        // Emergency Contact
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },

        notes: ''
      };

      // Create document with merge option to avoid overwriting
      await setDoc(userRef, userData, { merge: true });
      
      // Verify document was created
      const verifyDoc = await getDoc(userRef);
      if (!verifyDoc.exists()) {
        throw new Error('Failed to create user document');
      }

      console.log('✅ User document created successfully in Firestore');
      return userData;
    } catch (error) {
      console.error('❌ Error creating user document:', error);
      throw error;
    }
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Logged in:", userCredential.user.uid);
        
        // Verify user document exists
        const userRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.warn('⚠️ User document not found, creating one...');
          await createUserDocument(
            userCredential.user, 
            userCredential.user.displayName || email.split('@')[0]
          );
        }

        if (onLogin) {
          onLogin({
            name: userCredential.user.displayName || name || email.split('@')[0],
            email: userCredential.user.email,
            uid: userCredential.user.uid
          });
        }
      } else {
        // SIGNUP
        console.log('📝 Creating new user account...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("✅ User created in Auth:", userCredential.user.uid);

        // Update display name in Firebase Auth
        await updateProfile(userCredential.user, {
          displayName: name || email.split('@')[0]
        });
        console.log('✅ Display name updated');

        // Create user document in Firestore with all fields
        await createUserDocument(userCredential.user, name || email.split('@')[0]);

        setSuccess('✅ Registration successful! Redirecting to login...');
        
        // Show success message and switch to login
        setTimeout(() => {
          setIsLogin(true);
          setPassword('');
          setName('');
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      
      // Better error messages
      const errorMessages = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'permission-denied': 'Permission denied. Please check Firestore security rules.',
      };
      setError(errorMessages[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: `'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif` }}>
      
      {/* Left Form Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={formVariants}
            >
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#111827' }}>
                {isLogin ? 'Welcome Back!' : 'Create Your Account'}
              </h1>
              <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                {isLogin ? 'Sign in to access your dashboard.' : 'Get started with a free account.'}
              </p>
              
              <form onSubmit={handleAuthAction}>
                {!isLogin && (
                  <InputField 
                    icon={User} 
                    placeholder="Full Name" 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                )}
                <InputField 
                  icon={Mail} 
                  placeholder="Email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
                <InputField 
                  icon={Lock} 
                  placeholder="Password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
                
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      color: '#ef4444', 
                      marginBottom: '15px', 
                      backgroundColor: '#fee2e2', 
                      padding: '10px', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {error}
                  </motion.p>
                )}

                {success && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      color: '#16a34a', 
                      marginBottom: '15px', 
                      backgroundColor: '#dcfce7', 
                      padding: '10px', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {success}
                  </motion.p>
                )}
                
                <div style={{ marginTop: '32px' }}>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                    style={{
                      backgroundColor: isLogin ? '#2563eb' : '#16a34a',
                      color: 'white',
                      padding: '16px 25px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      border: 'none',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      gap: '10px',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')} 
                    {!loading && <ArrowRight size={20} />}
                  </motion.button>
                </div>
              </form>

              {isLogin && (
                <div style={{ marginTop: '24px' }}>
                  <p style={{ textAlign: 'center', color: '#6b7280' }}>or sign in with</p>
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      style={{ 
                        padding: '12px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '50%', 
                        border: 'none', 
                        cursor: 'pointer' 
                      }}
                    >
                      <Github size={24} color="#374151" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      style={{ 
                        padding: '12px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '50%', 
                        border: 'none', 
                        cursor: 'pointer' 
                      }}
                    >
                      <Twitter size={24} color="#374151" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side Panel */}
      <motion.div
        animate={isLogin ? "login" : "signup"}
        variants={panelVariants}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        style={{
          flex: 1,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
          {isLogin ? 'New Here?' : 'One of Us?'}
        </h2>
        <p style={{ fontSize: '1.125rem', maxWidth: '320px', marginBottom: '32px' }}>
          {isLogin ? 'Sign up and discover a great amount of new opportunities!' : 'If you already have an account, just sign in. We\'ve missed you!'}
        </p>
        <motion.button
          onClick={toggleMode}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.1 }}
          whileTap={{ scale: loading ? 1 : 0.9 }}
          style={{
            backgroundColor: 'white',
            color: isLogin ? '#2563eb' : '#16a34a',
            padding: '14px 30px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '1rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </motion.button>
      </motion.div>
    </div>
  );
}
