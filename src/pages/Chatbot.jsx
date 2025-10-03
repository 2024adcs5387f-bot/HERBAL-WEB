import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chat as chatApi } from "../api/chatbot";
import { Send, Loader2, Sprout, ShieldCheck, Stethoscope, User, ChevronDown, Menu } from "lucide-react";

// console.log('[chatbot api] CHATBOT_BASE =', CHATBOT_BASE);
const CHATBOT_BASE = 'http://localhost:8000';

export default function Chatbot() {
  const [navOpen, setNavOpen] = useState(false);
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
              </button>
            </div>
          </div>

          {/* Insights column */}
          <div className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-20 self-start max-h-[calc(100vh-8rem)] overflow-auto">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-5 text-black">
              <div className="flex items-center gap-2 text-sm font-medium text-black mb-3"><Stethoscope className="w-4 h-4" /> Normalized symptoms</div>
              {normalizedSymptoms.length ? (
                <div className="flex flex-wrap gap-2">
                  {normalizedSymptoms.map((s, i) => (
                    <span key={i} className="px-2.5 py-1.5 rounded-full text-xs bg-neutral-100 text-black">{s}</span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-black">No symptoms matched yet.</div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-5 text-black">
              <div className="flex items-center gap-2 text-sm font-medium text-black mb-3"><Sprout className="w-4 h-4" /> Possible diseases</div>
              {diseasesScored.length ? (
                <ul className="text-sm space-y-1.5 text-black">
                  {diseasesScored.map((d, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="text-black">{d.name}</span>
                      <span className="ml-3 inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-black">{(d.score*100).toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              ) : diseases.length ? (
                <ul className="list-disc list-inside text-sm space-y-1.5 text-black">
                  {diseases.map((d, i) => (<li key={i}>{d}</li>))}
                </ul>
              ) : (
                <div className="text-sm text-black">No diseases predicted yet.</div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-5 text-black">
              <div className="flex items-center gap-2 text-sm font-medium text-black mb-3"><Sprout className="w-4 h-4" /> Recommended herbs</div>
              {herbsScored.length ? (
                <ul className="text-sm space-y-1.5 text-black">
                  {herbsScored.map((h, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="font-medium text-black">{h.name}</span>
                        {h.matched_symptoms?.length ? (
                          <span className="ml-2 text-xs text-black truncate">matched: {h.matched_symptoms.join(', ')}</span>
                        ) : null}
                      </div>
                      <span className="ml-3 inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-black">{(h.score*100).toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              ) : herbs.length ? (
                <div className="flex flex-wrap gap-2">
                  {herbs.map((h, i) => (
                    <span key={i} className="px-2.5 py-1.5 rounded-full text-xs bg-blue-50 text-blue-700">{h}</span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-black">No herb recommendations yet.</div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-5 text-black">
              <div className="flex items-center gap-2 text-sm font-medium text-black mb-3"><ShieldCheck className="w-4 h-4" /> Precautions</div>
              {precautionsByDisease.length ? (
                <div className="space-y-3">
                  {precautionsByDisease.map((g, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-black">{g.disease}</span>
                        <span className="ml-3 inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-black">{(g.score*100).toFixed(0)}%</span>
                      </div>
                      {g.precautions?.length ? (
                        <ul className="list-disc list-inside text-sm space-y-1 text-black">
                          {g.precautions.map((p, j) => (<li key={j}>{p}</li>))}
                        </ul>
                      ) : (
                        <div className="text-sm text-black">No precautions listed.</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : precautions.length ? (
                <ul className="list-disc list-inside text-sm space-y-1.5 text-black">
                  {precautions.map((p, i) => (<li key={i}>{p}</li>))}
                </ul>
              ) : (
                <div className="text-sm text-black">No precautions yet.</div>
              )}
            </div>

            {/* Relevant posts */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-5 text-black">
              <div className="flex items-center gap-2 text-sm font-medium text-black mb-3"><Sprout className="w-4 h-4" /> Relevant posts</div>
              {postsScored.length ? (
                <ul className="text-sm space-y-1.5 text-black">
                  {postsScored.map((p, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="truncate text-black">{p.title}</span>
                      <span className="ml-3 inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-black">{(p.score*100).toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-black">No related posts found.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
