import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chat as chatApi } from "../api/chatbot";
import { Send, Loader2, Sprout, ShieldCheck, Stethoscope, ChevronDown, Bell, Calendar, History, MessageSquare, ArrowUpRight } from "lucide-react";

// console.log('[chatbot api] CHATBOT_BASE =', CHATBOT_BASE);
const CHATBOT_BASE = 'http://localhost:8000';

export default function Chatbot() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [messages, setMessages] = useState([]); // {role:'bot'|'user', text}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [normalizedSymptoms, setNormalizedSymptoms] = useState([]);
  const [diseases, setDiseases] = useState([]); // legacy names
  const [diseasesScored, setDiseasesScored] = useState([]);
  const [herbs, setHerbs] = useState([]); // legacy names
  const [herbsScored, setHerbsScored] = useState([]);
  const [precautions, setPrecautions] = useState([]); // legacy flat
  const [precautionsByDisease, setPrecautionsByDisease] = useState([]);
  const [postsScored, setPostsScored] = useState([]);
  const inputRef = useRef(null);

  // Lightweight bar chart to visualize disease probabilities without extra deps
  const BarChart = ({ data }) => {
    const ds = Array.isArray(data) ? data.slice(0, 8) : [];
    if (ds.length === 0) return null; // no placeholders when empty
    const max = Math.max(0.01, ...ds.map(d => d.score || 0.01));
    const topIndex = ds.reduce((idx, d, i, arr) => (d.score > arr[idx].score ? i : idx), 0);
    return (
      <div className="w-full h-48 sm:h-56 md:h-64 flex items-end gap-3 px-2">
        {ds.map((d, i) => {
          const h = Math.max(8, Math.round((d.score / max) * 100));
          const isTop = i === topIndex;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <div className="relative w-full rounded-md overflow-hidden" style={{ height: `${h}%` }}>
                <div className={`absolute inset-0 rounded-md bg-gradient-to-t ${isTop ? 'from-blue-600/90 to-purple-500/70' : 'from-blue-500/70 to-blue-400/40'}`}></div>
                {isTop && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%),repeating-linear-gradient(135deg,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_6px,transparent_6px,transparent_12px)] opacity-60" />
                )}
              </div>
              <div className="mt-2 text-[10px] sm:text-xs text-slate-300 truncate w-full text-center">{d.name}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // Utility: trim and drop empty precaution strings
  const cleanTextArray = (arr) => (Array.isArray(arr) ? arr.map((p) => (typeof p === 'string' ? p.trim() : p)).filter((p) => !!p && String(p).trim().length > 0) : []);

  // Heuristic: detect if the input looks like symptom-related text (permissive)
  const looksSymptomatic = (t) => {
    const s = String(t || "").toLowerCase();
    if (!s) return false;

    // Regex patterns for common symptoms (word boundaries, basic stemming)
    const symptomPatterns = [
      /\bfever(s)?\b/,
      /\bcough(ing|s)?\b/,
      /\bcold(s)?\b/,
      /\bflu\b/,
      /\bpain(s)?\b/,
      /\bache(s)?\b/,
      /\bheadache(s)?\b/,
      /\bmigraine(s)?\b/,
      /\bnausea(ted)?\b/,
      /\bvomit(ing|s)?\b/,
      /\bdiarrhea\b/,
      /\brash(es)?\b/,
      /\bsore\b/,
      /\bthroat\b/,
      /\bfatigue(d)?\b/,
      /\btired(ness)?\b/,
      /\bdizzi(ness|ly|y)?\b/,
      /\bchill(s)?\b/,
      /\bsweat(ing|s)?\b/,
      /\b(shortness\sof\s)?breath\b/,
      /\bwheeze(ing|s)?\b/,
      /\bswell(ing|en)?\b/,
      /\bbleed(ing|s)?\b/,
      /\bcramp(s|ing)?\b/,
      /\bstomach\b/,
      /\babdominal\b/,
      /\bchest\b/,
      /\bback\b/,
      /\bjoint(s)?\b/,
      /\brunny\b/,
      /\bcongestion\b/,
      /\bsneeze(ing|s)?\b/,
      /\bitch(y|ing)?\b/,
      /\bburning\b/,
      /\bhurt(s|ing)?\b/
    ];

    const hasSymptoms = symptomPatterns.some((re) => re.test(s));
    if (hasSymptoms) return true;

    // Only block if there are NO symptoms and there ARE clear non-medical hints
    // Include common job/introduction words and tolerant patterns for typos
    const nonMedicalHints = [
      /\bhello\b/, /\bhi\b/, /\bhey\b/, /\bgood\s+(morning|evening|afternoon)\b/,
      /\bdeveloper(s)?\b/, /\bdev\b/, /\bprogrammer(s)?\b/, /\bcoder(s)?\b/, /\bcoding\b/,
      /\bengi?neer(s)?\b/, // matches 'engineer' and 'engneer'
      /\bsoft\s*ware\b/, /\bite\b/, /\bit\b/, /\bcomputer\b/,
      /\bdesigner(s)?\b/, /\bfull\s+stack\b/, /\bfrontend\b/, /\bbackend\b/,
      /\bjob\b/, /\bcv\b/, /\bresume\b/, /\bportfolio\b/, /\bgithub\b/
    ];
    return !nonMedicalHints.some((re) => re.test(s));
  };

  useMemo(() => {
    if (messages.length === 0) {
      setMessages([{ role: "bot", text: "Hello! Describe your symptoms and I’ll suggest likely diseases, herbs, and precautions." }]);
    }
    return true;
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    // Guard: only proceed if input looks symptom-like
    if (!looksSymptomatic(text)) {
      setMessages((m) => [
        ...m,
        { role: "user", text },
        { role: "bot", text: "Please describe your symptoms (e.g., fever, cough, headache, nausea). I can then suggest possible conditions, herbs, and precautions." }
      ]);
      setInput("");
      return;
    }
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const data = await chatApi({ message: text });
      setNormalizedSymptoms(data.normalized_symptoms || []);
      setDiseases(data.possible_diseases || []);
      setDiseasesScored(data.possible_diseases_scored || []);
      setHerbs(data.recommended_herbs || []);
      setHerbsScored(data.recommended_herbs_scored || []);
      setPrecautions(data.precautions || []);
      setPrecautionsByDisease(data.precautions_by_disease || []);
      setPostsScored(data.posts_scored || []);
      // Post-filter: if backend returned diseases but no normalized symptoms, treat as unrecognized input
      const nsCount = data.normalized_symptoms?.length || 0;
      const disCount = data.possible_diseases?.length || 0;
      if (nsCount === 0) {
        setDiseases([]);
        setDiseasesScored([]);
        setHerbs([]);
        setHerbsScored([]);
        setPrecautions([]);
        setPrecautionsByDisease([]);
        setPostsScored([]);
        setMessages((m) => [
          ...m,
          { role: "bot", text: "I couldn't detect any symptoms in your message. Please list what you're experiencing (e.g., high fever for 2 days, dry cough, sore throat)." },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "bot", text: `I matched ${nsCount} symptom(s) and found ${disCount} condition(s).` },
        ]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, I couldn’t process that right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-white" style={{ backgroundImage: 'url("https://i.pinimg.com/1200x/16/ee/63/16ee633b73ea3e5c643d484095318337.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      {/* Top Navbar */}
      {/* <header className="sticky top-0 z-30 w-full border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-neutral-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Toggle navigation" onClick={() => setNavOpen((v) => !v)}>
              <Menu className="w-5 h-5 text-neutral-800" />
            </button>
            <a href="/" className="flex items-center gap-2 group">
              <div className="h-7 w-7 rounded-md bg-blue-600 group-hover:opacity-90 transition" />
              <span className="text-lg font-semibold tracking-tight text-neutral-900">Herbal</span>
            </a>
          </div>
          <nav className="hidden lg:flex items-center gap-1 text-sm">
            <a className="px-3 py-2 rounded-md text-neutral-900 hover:bg-neutral-100 transition" href="/">Home</a>
            <a className="px-3 py-2 rounded-md text-neutral-900 hover:bg-neutral-100 transition" href="/chatbot">Chatbot</a>
            <a className="px-3 py-2 rounded-md text-neutral-900 hover:bg-neutral-100 transition" href="/research-hub">Research Hub</a>
            <a className="px-3 py-2 rounded-md text-neutral-900 hover:bg-neutral-100 transition" href="/products">Products</a>
          </nav>
          <div className="relative">
            <button aria-haspopup="menu" aria-expanded={profileOpen} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-2.5 py-1.5 shadow-sm hover:shadow transition focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={() => setProfileOpen((v) => !v)}>
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-neutral-200 text-neutral-800 text-xs font-medium">JD</span>
              <span className="text-sm text-neutral-900">Account</span>
              <ChevronDown className={`w-4 h-4 text-neutral-600 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden" role="menu">
                <a className="block px-4 py-2.5 text-sm text-neutral-900 hover:bg-neutral-100" href="#" role="menuitem">Profile</a>
                <a className="block px-4 py-2.5 text-sm text-neutral-900 hover:bg-neutral-100" href="#" role="menuitem">Settings</a>
                <div className="h-px bg-neutral-200" />
                <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50" role="menuitem">Logout</button>
              </div>
            )}
          </div>
        </div>
        {navOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1 text-sm">
              <a className="px-3 py-2 rounded-md text-neutral-900 hover:bg-neutral-100" href="/">Home</a>
              <a className="px-3 py-2 rounded-md text-neutral-900 hover:bg-neutral-100" href="/chatbot">Chatbot</a>
              <a className="px-3 py-2 rounded-md text-neutral-900 hover:bg-neutral-100" href="/research-hub">Research Hub</a>
              <a className="px-3 py-2 rounded-md text-neutral-900 hover:bg-neutral-100" href="/products">Products</a>
            </div>
          </div>
        )}
      </header> */}

      {/* Page Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-black" style={{paddingTop: '5px'}}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black">Herbal Chat Assistant</h1>
          <p className="text-base text-black mt-1">Informational only · Not a medical diagnosis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat column */}
          <div className="col-span-12 lg:col-span-8 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="h-[60vh] md:h-[65vh] lg:h-[68vh] xl:h-[70vh] overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((m, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={m.role === 'user' ? 'text-right' : 'text-left'}>
                    <span className={`inline-block max-w-[80%] md:max-w-[75%] lg:max-w-[70%] px-4 py-2.5 rounded-2xl text-base leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-black border border-neutral-200'}`}>
                      {m.text}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t border-neutral-200 p-3 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={'Describe your symptoms…'}
                className="flex-1 rounded-xl bg-white border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 placeholder-neutral-400"
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              />
              <button
                onClick={send}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm min-w-[96px] shadow-sm"
                disabled={loading}
              >
                {loading ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending</>) : (<><Send className="w-4 h-4 mr-2" /> Send</>)}
=======
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-6">
        <div
          className="rounded-3xl bg-slate-950 text-white shadow-xl border border-slate-800/40 overflow-hidden min-h-[80vh] not-prose antialiased isolate"
          style={{
            backgroundColor: '#0b1220',
            color: '#e5e7eb',
            backgroundImage:
              "radial-gradient(60rem 30rem at -10% -10%, rgba(37,99,235,0.25), transparent), radial-gradient(40rem 20rem at 110% 10%, rgba(147,51,234,0.25), transparent), linear-gradient(135deg, #0b1220 0%, #0f1a2d 60%, #0b1220 100%)"
          }}
        >
          {/* Shell */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 text-white">
        {/* Main */}
        <div className="min-w-0">
          {/* Header */}
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Herbal Health Assistant</h1>
              <p className="text-white text-sm">Informational only · Not a medical diagnosis</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 rounded-full bg-slate-800/60 border border-slate-700/50 grid place-items-center hover:bg-slate-700/60">
                <Calendar className="w-4 h-4 text-slate-300" />
              </button>
              <button className="h-9 w-9 rounded-full bg-slate-800/60 border border-slate-700/50 grid place-items-center hover:bg-slate-700/60">
                <Bell className="w-4 h-4 text-slate-300" />
              </button>
              <button onClick={() => setProfileOpen(v=>!v)} className="pl-2 pr-2.5 h-9 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-600 text-white text-xs">JD</span>
                <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
>>>>>>> Hackthon
              </button>
            </div>
          </header>

          {/* Top Navigation - horizontal navbar */}
          <nav className="mb-5 rounded-2xl bg-slate-800/70 backdrop-blur-xl border border-slate-700/60 p-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              <a href="/chatbot" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/90 text-white shadow-inner whitespace-nowrap">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Chat</span>
              </a>
              <a href="#" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700/60 text-slate-200 whitespace-nowrap">
                <History className="w-4 h-4" />
                <span className="text-sm">History</span>
              </a>
              <a href="/products" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700/60 text-slate-200 whitespace-nowrap">
                <Sprout className="w-4 h-4" />
                <span className="text-sm">Products</span>
              </a>
              <a href="/" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700/60 text-slate-200 whitespace-nowrap">
                <span className="text-base leading-none">🏠</span>
                <span className="text-sm">Home</span>
              </a>
            </div>
          </nav>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Symptom Analysis */}
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-indigo-900/20 backdrop-blur-xl border border-slate-700/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_30px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-inner" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-200">
                    <Stethoscope className="w-4 h-4" /> Symptom Analysis
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe your symptoms here..."
                      className="flex-1 rounded-xl bg-slate-900/60 border border-slate-700/60 px-3 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                    />
                    <button
                      onClick={send}
                      disabled={loading}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-600 px-4 py-2.5 text-sm min-w-[150px] shadow disabled:opacity-70"
                    >
                      {loading ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing</>) : (<><Send className="w-4 h-4 mr-2" /> Analyze Symptoms</>)}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/40 to-indigo-900/10 p-3 h-[42vh] overflow-y-auto">
                <AnimatePresence>
                  {messages.map((m, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                      <span className={`inline-block max-w-[85%] md:max-w-[80%] lg:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-100 border border-slate-700/60'}`}>
                        {m.text}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* Possible Diseases - with chart */}
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-gradient-to-br from-slate-900/50 to-indigo-900/10 backdrop-blur-xl border border-slate-700/50 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_30px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Sprout className="w-4 h-4" /> Possible Diseases
                </div>
                <button className="h-8 w-8 grid place-items-center rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60">
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
              {diseasesScored.length ? (
                <BarChart data={diseasesScored} />
              ) : (
                <div className="text-sm text-slate-300">No diseases predicted yet.</div>
              )}
            </section>

            {/* Normalized symptoms */}
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-gradient-to-br from-slate-900/50 to-indigo-900/10 backdrop-blur-xl border border-slate-700/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_30px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Stethoscope className="w-4 h-4" /> Normalized symptoms
                </div>
                <button className="h-8 w-8 grid place-items-center rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60">
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
              {normalizedSymptoms.length ? (
                <div className="flex flex-wrap gap-2">
                  {normalizedSymptoms.map((s, i) => (
                    <span key={i} className="px-2.5 py-1.5 rounded-full text-xs bg-slate-900/60 border border-slate-700/60 text-slate-200">{s}</span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-300">No symptoms matched yet.</div>
              )}
            </section>

            {/* Recommended Herbs */}
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-gradient-to-br from-slate-900/50 to-indigo-900/10 backdrop-blur-xl border border-slate-700/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_30px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Sprout className="w-4 h-4" /> Recommended Herbs
                </div>
                <button className="h-8 w-8 grid place-items-center rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60">
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
              {herbsScored.length ? (
                <ul className="text-sm space-y-1.5 text-slate-200">
                  {herbsScored.map((h, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="font-medium">{h.name}</span>
                        {h.matched_symptoms?.length ? (
                          <span className="ml-2 text-xs text-slate-400 truncate">matched: {h.matched_symptoms.join(', ')}</span>
                        ) : null}
                      </div>
                      <span className="ml-3 inline-flex items-center rounded-full border border-slate-700/60 px-2 py-0.5 text-xs text-slate-300">{(h.score*100).toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              ) : herbs.length ? (
                <div className="flex flex-wrap gap-2">
                  {herbs.map((h, i) => (
                    <span key={i} className="px-2.5 py-1.5 rounded-full text-xs bg-gradient-to-r from-blue-500/30 to-purple-600/30 border border-slate-700/60 text-slate-200">{h}</span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-300">No herb recommendations yet.</div>
              )}
            </section>

            {/* Precautions */}
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-gradient-to-br from-slate-900/50 to-indigo-900/10 backdrop-blur-xl border border-slate-700/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_30px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <ShieldCheck className="w-4 h-4" /> Precautions
                </div>
                <button className="h-8 w-8 grid place-items-center rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60">
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
              {precautionsByDisease.length ? (
                <div className="space-y-3">
                  {precautionsByDisease.map((g, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-200">{g.disease}</span>
                        <span className="ml-3 inline-flex items-center rounded-full border border-slate-700/60 px-2 py-0.5 text-xs text-slate-300">{(g.score*100).toFixed(0)}%</span>
                      </div>
                      {g.precautions?.length ? (
                        <ul className="list-disc list-inside text-sm space-y-1 !text-white marker:!text-white opacity-100">
                          {cleanTextArray(g.precautions).map((p, j) => (
                            <li key={j} className="!text-white">
                              <span className="!text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] selection:bg-blue-600 selection:text-white">{p}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-slate-300">No precautions listed.</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : precautions.length ? (
                <ul className="list-disc list-inside text-sm space-y-1.5 !text-white marker:!text-white opacity-100">
                  {cleanTextArray(precautions).map((p, i) => (
                    <li key={i} className="!text-white">
                      <span className="!text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] selection:bg-blue-600 selection:text-white">{p}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-300">No precautions yet.</div>
              )}
            </section>

            {/* Relevant Posts */}
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-gradient-to-br from-slate-900/50 to-indigo-900/10 backdrop-blur-xl border border-slate-700/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_30px_-10px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Sprout className="w-4 h-4" /> Relevant Posts
                </div>
                <button className="h-8 w-8 grid place-items-center rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60">
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
              {postsScored.length ? (
                <ul className="text-sm space-y-1.5 text-slate-300">
                  {postsScored.map((p, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="truncate">{p.title}</span>
                      <span className="ml-3 inline-flex items-center rounded-full border border-slate-700/60 px-2 py-0.5 text-xs text-slate-300">{(p.score*100).toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-300">No related posts found.</div>
              )}
            </section>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
