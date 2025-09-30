import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../../config/supabase";
import { createResearchPost } from "../../../api/research";
import Modal from "../../ui/Modal";

const ResearchPostForm = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [relatedHerb, setRelatedHerb] = useState(null);
  const [relatedDisease, setRelatedDisease] = useState(null);
  const [herbs, setHerbs] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch herbs & diseases for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      let { data: herbsData } = await supabase.from("herbs").select("id,name").eq("is_active", true);
      let { data: diseasesData } = await supabase.from("diseases").select("id,name").eq("is_active", true);
      setHerbs(herbsData || []);
      setDiseases(diseasesData || []);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use backend API so hooks can populate research_structured
      const payload = {
        title,
        abstract,
        content,
        relatedHerbId: relatedHerb || null,
        relatedDiseaseId: relatedDisease || null,
        // Optional structured fields; server will enrich from IDs
        schemaVersion: "1.0",
        entities: {},
        keyphrases: [],
        annotations: {},
      };
      const created = await createResearchPost(payload);
      if (created) {
        onAdd(created);
        setTitle("");
        setAbstract("");
        setContent("");
        setRelatedHerb(null);
        setRelatedDisease(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Research" size="lg" height="80vh" closeOnBackdrop={false}>
      {/* Body */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Abstract</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Content</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Related Herb</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                value={relatedHerb || ""}
                onChange={(e) => setRelatedHerb(e.target.value)}
              >
                <option value="">Select Herb</option>
                {herbs.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Related Disease</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                value={relatedDisease || ""}
                onChange={(e) => setRelatedDisease(e.target.value)}
              >
                <option value="">Select Disease</option>
                {diseases.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,150,255,0.4)" }}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Research"}
          </motion.button>
        </form>
      </div>
    </Modal>
  );
};

export default ResearchPostForm;
