// File: src/components/research/ResearchFilters.jsx

import { useState } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../../ui/Modal";

const ResearchFilters = ({ herbs, diseases, isOpen, onClose, onApply }) => {
  const [selectedHerbs, setSelectedHerbs] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [status, setStatus] = useState([]);

  const herbOptions = herbs.map(h => ({ value: h.id, label: h.name }));
  const diseaseOptions = diseases.map(d => ({ value: d.id, label: d.name }));

  const toggleStatus = s => {
    setStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const clearAll = () => {
    setSelectedHerbs([]);
    setSelectedDiseases([]);
    setStatus([]);
  };

  const handleApply = () => {
    onApply({
      herbs: selectedHerbs.map(h => h.value),
      diseases: selectedDiseases.map(d => d.value),
      status,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Research" size="md" height="80vh" closeOnBackdrop={false}>
      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Multi-select herbs */}
        <Select
          options={herbOptions}
          isMulti
          placeholder="Select herbs..."
          value={selectedHerbs}
          onChange={setSelectedHerbs}
          classNamePrefix="react-select"
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 70 }) }}
        />

        {/* Multi-select diseases */}
        <Select
          options={diseaseOptions}
          isMulti
          placeholder="Select diseases..."
          value={selectedDiseases}
          onChange={setSelectedDiseases}
          classNamePrefix="react-select"
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 70 }) }}
        />

        {/* Status toggles */}
        <div className="flex gap-2">
          {["Published", "Draft", "Under Review"].map(s => (
            <motion.button
              key={s}
              onClick={() => toggleStatus(s)}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-1 rounded-full font-medium transition-all ${
                status.includes(s)
                  ? "bg-blue-500 text-white shadow-md animate-pulse"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>

        {/* Selected chips */}
        <div className="flex flex-wrap gap-2">
          {selectedHerbs.map(h => (
            <motion.div
              key={h.value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm"
            >
              {h.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedHerbs(prev => prev.filter(x => x.value !== h.value))} />
            </motion.div>
          ))}

          {selectedDiseases.map(d => (
            <motion.div
              key={d.value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full text-sm"
            >
              {d.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDiseases(prev => prev.filter(x => x.value !== d.value))} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-4 pt-2 flex justify-between items-center">
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-600 font-medium"
        >
          Clear All
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 font-medium"
          >
            Close
          </button>
          <motion.button
            onClick={handleApply}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,255,150,0.5)" }}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold"
          >
            Apply Filters
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default ResearchFilters;
