// File: src/pages/health/SupabaseHealth.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";

const mask = (str, visible = 6) => {
  if (!str) return "<missing>";
  const len = String(str).length;
  if (len <= visible) return str;
  return `${String(str).slice(0, visible)}...(${len} chars)`;
};

const SupabaseHealth = () => {
  const [envInfo, setEnvInfo] = useState({ url: null, anonLen: 0 });
  const [authStatus, setAuthStatus] = useState({ ok: false, detail: "" });
  const [queryStatus, setQueryStatus] = useState({ ok: false, detail: "" });

  useEffect(() => {
    // Read env
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    setEnvInfo({ url, anonLen: anon ? String(anon).length : 0 });

    // Check auth session
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setAuthStatus({ ok: true, detail: data?.session ? "Active session found" : "No active session (this is okay)" });
      } catch (e) {
        setAuthStatus({ ok: false, detail: e?.message || String(e) });
      }
    })();

    // Optional: probe a lightweight table if it exists
    (async () => {
      try {
        const { data, error } = await supabase.from("users").select("id").limit(1);
        if (error) throw error;
        setQueryStatus({ ok: true, detail: `Query OK. Rows: ${data?.length ?? 0}` });
      } catch (e) {
        setQueryStatus({ ok: false, detail: e?.message || String(e) });
      }
    })();
  }, []);

  return (
    <div style={{ paddingTop: 100 }} className="container">
      <h1>Supabase Health Check</h1>
      <div className="card p-3 mt-3">
        <h3>Environment</h3>
        <ul>
          <li>VITE_SUPABASE_URL: {mask(envInfo.url)}</li>
          <li>VITE_SUPABASE_ANON_KEY length: {envInfo.anonLen}</li>
        </ul>
      </div>

      <div className="card p-3 mt-3">
        <h3>Auth Session</h3>
        <p style={{ color: authStatus.ok ? "green" : "red" }}>
          {authStatus.ok ? "OK" : "ERROR"}: {authStatus.detail}
        </p>
      </div>

      <div className="card p-3 mt-3">
        <h3>Simple Query (users table)</h3>
        <p style={{ color: queryStatus.ok ? "green" : "orange" }}>
          {queryStatus.ok ? "OK" : "WARN"}: {queryStatus.detail}
        </p>
        <small>
          Note: If this warns with "relation 'users' does not exist" or similar, it only means the table
          isn't created yet or RLS prevents access. Connectivity can still be fine.
        </small>
      </div>
    </div>
  );
};

export default SupabaseHealth;
