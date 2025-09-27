// File: src/components/research/cards/ResearchPostCard.jsx
import { motion } from "framer-motion";
import { proxiedImage } from "../../../utils/proxy";
import { MessageSquare, ArrowBigUp } from "lucide-react";

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
      <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/40 p-3 mb-2 overflow-hidden flex flex-col">
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
      <div className="mt-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <ArrowBigUp className="w-4 h-4 text-blue-500" />
            <span>{post.votes_count ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span>{post.comments_count ?? 0}</span>
          </div>
        </div>

        <button
          className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          aria-label="View more"
        >
          View more
        </button>
      </div>
    </motion.div>
  );
};

export default ResearchPostCard;
