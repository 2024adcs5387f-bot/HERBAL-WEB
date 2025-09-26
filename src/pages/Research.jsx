import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, Leaf, Search } from 'lucide-react';

const Research = () => {
  return (
    <div style={{ paddingTop: 120 }}>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white mb-4"style={{paddingTop: 20}}>
                Herbal Research & Knowledge
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl">
                Explore evidence-based insights on medicinal plants, traditional uses,
                clinical findings, and safety information to support informed wellness decisions.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="p-6 rounded-2xl shadow bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
                <Leaf className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-sm font-semibold">Botany</div>
              </div>
              <div className="p-6 rounded-2xl shadow bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
                <FlaskConical className="h-8 w-8 text-emerald-600 mb-2" />
                <div className="text-sm font-semibold">Phytochemistry</div>
              </div>
              <div className="p-6 rounded-2xl shadow bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
                <BookOpen className="h-8 w-8 text-lime-700 mb-2" />
                <div className="text-sm font-semibold">Clinical</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Search + Filters (placeholder UI) */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 dark:border-neutral-700">
                  <Search className="h-5 w-5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search plants, compounds, conditions..."
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                <div className="text-sm font-semibold mb-3">Browse Topics</div>
                <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <li>• Anti-inflammatory</li>
                  <li>• Antimicrobial</li>
                  <li>• Digestive Health</li>
                  <li>• Sleep & Relaxation</li>
                  <li>• Immune Support</li>
                </ul>
              </div>
            </div>

            {/* Right: Articles (placeholder) */}
            <div className="lg:col-span-2 space-y-5">
              {[1,2,3].map((i) => (
                <div key={i} className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                  <div className="text-xs text-neutral-500 mb-1">Peer‑review summary</div>
                  <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">
                    Investigating the efficacy of common medicinal herbs for wellness support
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                    Overview of current literature covering mechanisms, safety profiles, and potential
                    interactions. This is placeholder content you can replace with your own material or API data.
                  </p>
                  <button className="btn btn-sm btn-success">Read more</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Research;
