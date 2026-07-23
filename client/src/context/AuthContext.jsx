import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // Tracks whether login/register/google-auth is actively running so we
  // can skip the redundant onAuthStateChanged profile fetch that would
  // otherwise race and reset the profile that was just set.
  const authInProgress = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Skip if a login/register call is already handling the profile update.
      if (authInProgress.current) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setProfile(data.user);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const register = async ({ name, email, password, role }) => {
    authInProgress.current = true;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      await credential.user.reload();

      const token = await credential.user.getIdToken(true);
      const { data } = await api.post(
        '/auth/register',
        { name, email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(data.user);
      return data.user;
    } finally {
      authInProgress.current = false;
    }
  };

  const login = async ({ email, password }) => {
    authInProgress.current = true;
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      const { data } = await api.post(
        '/auth/login',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(data.user);
      return data.user;
    } finally {
      authInProgress.current = false;
    }
  };

  const continueWithGoogle = async ({ role }) => {
    authInProgress.current = true;
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });

      const credential = await signInWithPopup(auth, googleProvider);
      const token = await credential.user.getIdToken();
      const { data } = await api.post(
        '/auth/provider',
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(data.user);
      return data.user;
    } finally {
      authInProgress.current = false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const updateAuthUserProfile = (updatedFields) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      loading,
      isAuthenticated: Boolean(firebaseUser && profile),
      register,
      login,
      continueWithGoogle,
      logout,
      updateAuthUserProfile
    }),
    [firebaseUser, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
