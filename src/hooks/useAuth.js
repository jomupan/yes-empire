import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const REMEMBER_KEY = "ye_auth";
const REMEMBER_DAYS = 30;

export default function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Check if user is already logged in
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

  const login = async (name, pin, remember) => {
    setError("");
    try {
      const snap = await getDocs(collection(db, "staff"));
      const staff = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const match = staff.find(s =>
        s.name.toLowerCase() === name.toLowerCase() && s.pin === pin
      );

      if (!match) {
        setError("Incorrect name or PIN. Please try again.");
        return false;
      }

      const userData = { id: match.id, name: match.name, role: match.role };
      setUser(userData);

      if (remember) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({
          user: userData,
          expiry: Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000
        }));
      }
      return true;

    } catch (err) {
      setError("Something went wrong. Try again.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(REMEMBER_KEY);
  };

  return { user, loading, error, login, logout };
}