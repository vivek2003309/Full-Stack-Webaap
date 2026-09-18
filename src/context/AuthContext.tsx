import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  getLoggedInCandidatePassport, 
  setLoggedInCandidatePassport, 
  signInAdminWithFirebaseAuth, 
  signInCandidateWithFirebaseAuth, 
  registerCandidateWithFirebaseAuth,
  getCandidateByPassportOrToken,
  signOutCurrentUser
} from '../services/apiService';

interface CandidateProfile {
  passport: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface AdminProfile {
  email: string;
  role: 'superadmin' | 'officer';
}

interface AuthContextType {
  firebaseUser: User | null;
  candidateUser: CandidateProfile | null;
  adminUser: AdminProfile | null;
  isAdminAuthenticated: boolean;
  isCandidateAuthenticated: boolean;
  isLoading: boolean;
  loginCandidateFast: (passport: string) => Promise<{ success: boolean; error?: string }>;
  loginCandidateEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerCandidateEmail: (email: string, pass: string, passport: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  loginAdminFirebase: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAdminPasscode: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  logoutCandidate: () => Promise<void>;
  logoutAdmin: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [candidateUser, setCandidateUser] = useState<CandidateProfile | null>(null);
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth Listener & Session
  useEffect(() => {
    // 1. Check local candidate session
    const savedPassport = getLoggedInCandidatePassport();
    if (savedPassport) {
      const match = getCandidateByPassportOrToken(savedPassport);
      setCandidateUser({
        passport: savedPassport,
        name: match?.fullName || 'Candidate',
        phone: match?.phone || ''
      });
    }

    // 2. Check local admin session
    if (typeof window !== 'undefined') {
      const adminStored = localStorage.getItem('tice_admin_auth');
      if (adminStored === 'true') {
        setAdminUser({
          email: 'admin@trehaninternational.com',
          role: 'superadmin'
        });
      }
    }

    // 3. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Check if user is an admin or candidate in Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role === 'admin' || user.email?.includes('admin')) {
              setAdminUser({
                email: user.email || 'admin@trehaninternational.com',
                role: 'superadmin'
              });
            }
            if (data.passportNumber) {
              const cleanPass = data.passportNumber.toUpperCase();
              setLoggedInCandidatePassport(cleanPass);
              setCandidateUser({
                passport: cleanPass,
                name: data.name || user.displayName || 'Candidate',
                email: user.email || undefined
              });
            }
          } else if (user.email && (user.email.includes('admin') || user.email === 'admin@trehaninternational.com')) {
            setAdminUser({
              email: user.email,
              role: 'superadmin'
            });
          }
        } catch (e) {
          console.warn('User profile fetch warning:', e);
        }
      }
      setIsLoading(false);
    });

    // Listen to window candidate session updates
    const handleSessionChange = (e: any) => {
      const pass = e.detail?.passport || getLoggedInCandidatePassport();
      if (pass) {
        const match = getCandidateByPassportOrToken(pass);
        setCandidateUser({
          passport: pass,
          name: match?.fullName || 'Candidate',
          phone: match?.phone || ''
        });
      } else {
        setCandidateUser(null);
      }
    };
    window.addEventListener('candidate_session_changed', handleSessionChange);

    return () => {
      unsubscribe();
      window.removeEventListener('candidate_session_changed', handleSessionChange);
    };
  }, []);

  const loginCandidateFast = async (passport: string) => {
    const clean = passport.trim().toUpperCase();
    if (!clean) return { success: false, error: 'Please enter a valid passport number.' };
    
    const candidate = getCandidateByPassportOrToken(clean);
    if (!candidate) {
      return { success: false, error: `No active records found for "${clean}". Try demo passport "P1234567" or "R9876543".` };
    }

    setLoggedInCandidatePassport(clean);
    setCandidateUser({
      passport: clean,
      name: candidate.fullName,
      phone: candidate.phone
    });
    return { success: true };
  };

  const loginCandidateEmail = async (email: string, pass: string) => {
    const res = await signInCandidateWithFirebaseAuth(email, pass);
    if (res.success && res.user) {
      try {
        const uDoc = await getDoc(doc(db, 'users', res.user.uid));
        if (uDoc.exists()) {
          const passNumber = uDoc.data().passportNumber;
          if (passNumber) {
            setLoggedInCandidatePassport(passNumber);
            setCandidateUser({
              passport: passNumber,
              name: uDoc.data().name || 'Candidate',
              email
            });
          }
        }
      } catch {}
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const registerCandidateEmail = async (email: string, pass: string, passport: string, name?: string) => {
    const res = await registerCandidateWithFirebaseAuth(email, pass, passport, name);
    if (res.success && res.user) {
      const cleanPass = passport.trim().toUpperCase();
      setLoggedInCandidatePassport(cleanPass);
      setCandidateUser({
        passport: cleanPass,
        name: name || 'Candidate',
        email
      });
      return { success: true };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const loginAdminFirebase = async (email: string, pass: string) => {
    const res = await signInAdminWithFirebaseAuth(email, pass);
    if (res.success && res.user) {
      setAdminUser({
        email: res.user.email || email,
        role: 'superadmin'
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('tice_admin_auth', 'true');
      }
      return { success: true };
    }
    return { success: false, error: res.error || 'Admin login failed' };
  };

  const loginAdminPasscode = async (passcode: string) => {
    const clean = passcode.trim().toLowerCase();
    if (clean === 'trehan2026' || clean === 'admin123') {
      setAdminUser({
        email: 'admin@trehaninternational.com',
        role: 'superadmin'
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('tice_admin_auth', 'true');
      }
      return { success: true };
    }
    return { success: false, error: 'Invalid admin passcode. Use "trehan2026".' };
  };

  const logoutCandidate = async () => {
    setLoggedInCandidatePassport(null);
    setCandidateUser(null);
    if (!adminUser) {
      await signOut(auth).catch(() => null);
    }
  };

  const logoutAdmin = async () => {
    setAdminUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tice_admin_auth');
    }
    await signOutCurrentUser();
  };

  const logoutAll = async () => {
    setCandidateUser(null);
    setAdminUser(null);
    setLoggedInCandidatePassport(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tice_admin_auth');
    }
    await signOutCurrentUser();
  };

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      candidateUser,
      adminUser,
      isAdminAuthenticated: !!adminUser,
      isCandidateAuthenticated: !!candidateUser,
      isLoading,
      loginCandidateFast,
      loginCandidateEmail,
      registerCandidateEmail,
      loginAdminFirebase,
      loginAdminPasscode,
      logoutCandidate,
      logoutAdmin,
      logoutAll
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
