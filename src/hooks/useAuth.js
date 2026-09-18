import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const REMEMBER_KEY = "ye_auth";
const REMEMBER_DAYS = 30;

export default function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const expired = Date.now() > parsed.expiry;
      if (!expired) {
        setUser(parsed.user);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Step 1 — validate PIN, return user but DON'T set state yet
  const validatePin = async (pin) => {
    try {
      const snap = await getDocs(collection(db, "staff"));
      const staff = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      const match = staff.find(s => String(s.pin) === String(pin));
      if (!match) return null;
      return {
        id:    match.id,
        name:  match.name,
        role:  match.role,
        photo: match.photo || null,
      };
    } catch (err) {
      return null;
    }
  };

  // Step 2 — complete login, set user state
  const completeLogin = (userData, remember) => {
    setUser(userData);
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({
        user:   userData,
        expiry: Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000
      }));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(REMEMBER_KEY);
  };

  return { user, setUser, loading, validatePin, completeLogin, logout };
}