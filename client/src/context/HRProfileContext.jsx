import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchHRProfile,
  saveHRProfile,
  uploadCompanyLogo,
  deleteCompanyLogo
} from '../services/hrProfile.service';

const HRProfileContext = createContext(null);

export function HRProfileProvider({ children }) {
  const [hrProfile, setHRProfile]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHRProfile();
      setHRProfile(data.hrProfile);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load HR profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Save profile ────────────────────────────────────────────────────────────
  const saveProfile = useCallback(async (payload) => {
    setSaving(true);
    setError(null);
    try {
      const data = await saveHRProfile(payload);
      setHRProfile(data.hrProfile);
      return data.hrProfile;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to save profile';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Upload logo ─────────────────────────────────────────────────────────────
  const uploadLogo = useCallback(async (file) => {
    setSaving(true);
    setError(null);
    try {
      const data = await uploadCompanyLogo(file);
      setHRProfile(data.hrProfile);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to upload logo';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Delete logo ─────────────────────────────────────────────────────────────
  const deleteLogo = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const data = await deleteCompanyLogo();
      setHRProfile(data.hrProfile);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to delete logo';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }, []);

  const value = useMemo(
    () => ({ hrProfile, loading, saving, error, saveProfile, uploadLogo, deleteLogo, refreshProfile: loadProfile }),
    [hrProfile, loading, saving, error, saveProfile, uploadLogo, deleteLogo, loadProfile]
  );

  return <HRProfileContext.Provider value={value}>{children}</HRProfileContext.Provider>;
}

export function useHRProfile() {
  const ctx = useContext(HRProfileContext);
  if (!ctx) throw new Error('useHRProfile must be used inside HRProfileProvider');
  return ctx;
}
