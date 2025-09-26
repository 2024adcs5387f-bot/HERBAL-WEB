import { createContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // If Supabase isn't configured, don't attempt to call it
    if (!supabase) {
      setSession(null);
      setUser(null);
      return;
    }

    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.warn("Auth: failed to get session from Supabase", err);
        setSession(null);
        setUser(null);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    return () => {
      try {
        listener?.subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, setSession, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
