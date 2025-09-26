// src/pages/ResearchHub.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchResearchPosts } from "../api/research";
import ResearchFilters from "../components/research/filters/ResearchFilters";
import ResearchPostCard from "../components/research/cards/ResearchPostCard";
import { Plus } from "lucide-react";
import { supabase } from "../config/supabase";
import { getCurrentUser } from "../services/userService";

const ResearchHub = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Options for filters
  const [herbOptions, setHerbOptions] = useState([]);
  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [filterValues, setFilterValues] = useState({ herbs: [], diseases: [], status: [] });
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch posts from API with sorting and simple filters
  const loadPosts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sortBy,
      };
      // Map multi-select to first selection for now
      if (filterValues.herbs?.length) params.herbId = filterValues.herbs[0];
      if (filterValues.diseases?.length) params.diseaseId = filterValues.diseases[0];
      // "status" is not used on backend filtering; keeping for future
      const { posts: fetched, pagination: p } = await fetchResearchPosts(params);
      setPosts(fetched);
      setPagination(p);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, [filterValues, sortBy]);

  // Load current user (if any) for role-based UI controls
  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
      } catch {
        setCurrentUser(null);
      }
    })();
  }, []);

  // Load herbs/diseases for Filters
  useEffect(() => {
    (async () => {
      try {
        const { data: herbs } = await supabase
          .from("herbs")
          .select("id,name")
          .eq("is_active", true)
          .order("name");
        const { data: diseases } = await supabase
          .from("diseases")
          .select("id,name")
          .eq("is_active", true)
          .order("name");
        setHerbOptions(herbs || []);
        setDiseaseOptions(diseases || []);
      } catch (e) {
        console.warn("Failed loading filter options", e);
        setHerbOptions([]);
        setDiseaseOptions([]);
      }
    })();
  }, []);

  const handleApplyFilters = (filters) => {
    setFilterValues(filters);
  };

  const handleAddPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="relative min-h-screen p-4 md:p-8 pt-28">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Research Hub</h1>
        <div className="flex gap-3 mt-4 md:mt-0 items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700"
          >
            <option value="newest">Newest</option>
            <option value="most_upvoted">Most Upvoted</option>
            <option value="most_commented">Most Commented</option>
          </select>
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md"
          >
            Filters
          </button>
          {(() => {
            const role = currentUser?.profile?.user_type || currentUser?.user_type;
            const canPost = role === 'researcher' || role === 'herbalist';
            return canPost ? (
              <button
                onClick={() => navigate('/research/new')}
                className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Add New Research
              </button>
            ) : null;
          })()}
        </div>
      </div>

      {/* Research Filters */}
      <ResearchFilters
        herbs={herbOptions}
        diseases={diseaseOptions}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={handleApplyFilters}
      />

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {loading ? (
          <p className="text-primary-200 col-span-full text-center">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-primary-200 col-span-full text-center">No research posts found.</p>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.12)" }}
              className="w-full"
            >
              <ResearchPostCard post={post} onClick={() => navigate(`/research/${post.id}`)} />
            </motion.div>
          ))
        )}
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-8">
        <button
          disabled={pagination.currentPage <= 1}
          onClick={() => loadPosts(pagination.currentPage - 1)}
          className="px-4 py-2 rounded-lg bg-neutral-800 text-white disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-white text-sm">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={pagination.currentPage >= pagination.totalPages}
          onClick={() => loadPosts(pagination.currentPage + 1)}
          className="px-4 py-2 rounded-lg bg-neutral-800 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ResearchHub;
