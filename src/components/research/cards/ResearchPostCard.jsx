// File: src/components/research/cards/ResearchPostCard.jsx
import { motion } from "framer-motion";
import { proxiedImage } from "../../../utils/proxy";
import { MessageSquare, ArrowBigUp, ChevronRight } from "lucide-react";

const ResearchPostCard = ({ post, onClick }) => {
  const abstract = post.abstract || "";
  const content = post.content || "";
  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || "").trim();
  };
  const contentText = stripHtml(content);
  // Build a preview that prefers abstract, but tops up with body text so short abstracts still fill nicely
  let previewText = (abstract || "").trim() || contentText;
  if (abstract && contentText) {
    const targetLen = 280; // aim for a fuller preview when abstract is short
    const deficit = targetLen - previewText.length;
    if (deficit > 0) {
      previewText = `${previewText} ${contentText.slice(0, Math.min(deficit, 500))}`.trim();
    }
  }
  // Pick the first image from attachments as thumbnail, fallback to first <img> in content
  const attachments = Array.isArray(post.attachments) ? post.attachments : [];
  const attachImg = attachments.find(a => a && a.url && String(a.mimetype || "").startsWith("image/"));
  let contentImg = null;
  if (!attachImg && typeof content === 'string') {
    const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    contentImg = m ? m[1] : null;
  }
  const thumbUrl = attachImg?.url || contentImg || null;
  const isLong = (abstract?.length || 0) > 220 || (content?.length || 0) > 400;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm cursor-pointer flex flex-col min-h-[500px] max-h-[500px] overflow-hidden"
      onClick={onClick}
    >
      {/* Thumbnail */}
      {thumbUrl ? (
        <div className="mb-2 -mt-1">
          <img src={thumbUrl} alt="thumbnail" className="w-full h-24 object-cover rounded-lg" />
        </div>
      ) : (
        // Reserve space to keep all cards the same height even when no thumbnail
        <div className="mb-2 -mt-1 h-24 rounded-lg opacity-0">.</div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{post.title}</h2>
        <span
          className={`px-2 py-1 text-xs rounded-full font-semibold ${
            (post.status || '').toLowerCase() === "published"
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              : (post.status || '').toLowerCase() === "draft"
              ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
          }`}
        >
          {(post.status || '').charAt(0).toUpperCase() + (post.status || '').slice(1)}
        </span>
      </div>

      {/* Author & Date */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {new Date(post.created_at || post.createdAt || Date.now()).toLocaleDateString()}
      </p>

      {/* Body container fills remaining space so short content still looks intentional */}
      <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 mb-2 overflow-hidden flex flex-col relative z-0">
        {/* Abstract + top-up from body (clamped) to keep consistent visual height */}
        <div className="text-gray-700 dark:text-gray-300 text-sm line-clamp-6 break-words">
          {previewText}
        </div>

        {/* Spacer to push tags to the bottom on short content */}
        <div className="flex-1" />

        {/* Herbs and Diseases (cap height to avoid pushing card height) */}
        <div className="flex flex-wrap gap-2 mt-auto overflow-hidden max-h-10">
          {post.herbs?.slice(0, 3).map((h) => (
            <span
              key={h.id || h}
              className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full text-xs font-medium"
            >
              {h.name || h}
            </span>
          ))}
          {post.diseases?.slice(0, 3).map((d) => (
            <span
              key={d.id || d}
              className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded-full text-xs font-medium"
            >
              {d.name || d}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-2 relative z-20">
        <div className="w-full rounded-md bg-white dark:bg-neutral-900 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-black dark:text-white text-sm">
            <div className="flex items-center gap-1">
              <ArrowBigUp className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span className="text-black dark:text-white font-semibold">{post.votes_count ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-black dark:text-white" />
              <span className="text-black dark:text-white font-semibold">{post.comments_count ?? 0}</span>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            aria-label="View more"
          >
            <span>View more</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default ResearchPostCard;
