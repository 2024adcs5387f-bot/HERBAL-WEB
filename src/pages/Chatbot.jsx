import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chat as chatApi } from "../api/chatbot";
import { Send, Loader2, Sprout, ShieldCheck, Stethoscope, ChevronDown, Bell, Calendar, History, MessageSquare } from "lucide-react";

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

  useMemo(() => {
    if (messages.length === 0) {
      setMessages([{ role: "bot", text: "Hello! Describe your symptoms and I’ll suggest likely diseases, herbs, and precautions." }]);
    }
    return true;
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
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
      setMessages((m) => [
        ...m,
        { role: "bot", text: `I matched ${data.normalized_symptoms?.length || 0} symptom(s) and found ${data.possible_diseases?.length || 0} condition(s).` },
      ]);
    } catch (e) {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, I couldn’t process that right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <div className="px-4 sm:px-6 lg:px-8 py-6 flex gap-4 text-white">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col w-16 shrink-0 rounded-2xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 p-3 gap-2">
          <div className="h-10 w-10 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center shadow-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <nav className="mt-2 flex flex-col gap-2">
            <a href="/chatbot" className="group px-0">
              <div className="w-full rounded-xl bg-blue-600/90 text-white grid place-items-center py-2 shadow-inner">
                Chat
              </div>
            </a>
            <a href="#" className="rounded-xl hover:bg-slate-700/60 grid place-items-center py-2 text-slate-300">
              <History className="w-5 h-5" />
            </a>
            <a href="/products" className="rounded-xl hover:bg-slate-700/60 grid place-items-center py-2 text-slate-300">
              <Sprout className="w-5 h-5" />
            </a>
          </nav>
          <div className="mt-auto">
            <a href="/" className="rounded-xl hover:bg-slate-700/60 grid place-items-center py-2 text-slate-300">🏠</a>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
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
              </button>
            </div>
          </header>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Symptom Analysis */}
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 p-5">
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

              <div className="mt-4 rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/40 to-slate-800/40 p-3 h-[42vh] overflow-y-auto">
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
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Sprout className="w-4 h-4" /> Possible Diseases
                </div>
                <a className="text-xs text-slate-400 hover:text-slate-200" href="#">Expand</a>
              </div>
              {diseasesScored.length ? (
                <BarChart data={diseasesScored} />
              ) : (
                <div className="text-sm text-slate-300">No diseases predicted yet.</div>
              )}
            </section>

            {/* Normalized symptoms */}
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
                <Stethoscope className="w-4 h-4" /> Normalized symptoms
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
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
                <Sprout className="w-4 h-4" /> Recommended Herbs
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
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
                <ShieldCheck className="w-4 h-4" /> Precautions
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
                        <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                          {g.precautions.map((p, j) => (<li key={j}>{p}</li>))}
                        </ul>
                      ) : (
                        <div className="text-sm text-slate-300">No precautions listed.</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : precautions.length ? (
                <ul className="list-disc list-inside text-sm space-y-1.5 text-slate-300">
                  {precautions.map((p, i) => (<li key={i}>{p}</li>))}
                </ul>
              ) : (
                <div className="text-sm text-slate-300">No precautions yet.</div>
              )}
            </section>

            {/* Relevant Posts */}
            <section className="col-span-12 lg:col-span-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-2">
                <Sprout className="w-4 h-4" /> Relevant Posts
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
