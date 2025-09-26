import { useEffect, useState, useMemo, useRef } from "react";
import DOMPurify from "dompurify";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowBigUp, ArrowBigDown, Bookmark, Share2 } from "lucide-react";
import { proxiedImage } from "../utils/proxy";
import { fetchResearchPost, postComment, voteOnPost, savePost, deleteResearchPost, updateComment, deleteComment } from "../api/research";
import { getCurrentUser } from "../services/userService";
import { CommentSection } from "react-comments-section";

const CommentNode = ({ node, onReply, currentUser, postId, onChanged }) => {
  const [openReply, setOpenReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.content || "");
  const [collapsed, setCollapsed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onReply(node.id, replyText);
    setReplyText("");
    setOpenReply(false);
  };

  const role = currentUser?.profile?.user_type || currentUser?.user_type;
  const canManage = !!currentUser && ((node.author_id && currentUser.id === node.author_id) || role === 'admin');

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    const ok = await updateComment(postId, node.id, editText.trim());
    if (ok) {
      setEditing(false);
      onChanged?.();
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Delete this comment?");
    if (!ok) return;
    const success = await deleteComment(postId, node.id);
    if (success) onChanged?.();
  };

  return (
    <div className="mt-4">
      <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800">
        {!editing ? (
          <div className="text-sm text-neutral-300 whitespace-pre-wrap">{node.content}</div>
        ) : (
          <form onSubmit={handleSaveEdit} className="space-y-2">
            <textarea
              className="w-full p-2 rounded-md bg-neutral-900 border border-neutral-800 text-white"
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-1 rounded-md bg-blue-600 text-white">Save</button>
              <button type="button" className="px-3 py-1 rounded-md bg-neutral-800 text-neutral-200" onClick={() => { setEditing(false); setEditText(node.content || ""); }}>Cancel</button>
            </div>
          </form>
        )}
        <div className="flex gap-3 mt-2 text-xs text-neutral-500 items-center">
          <button className="hover:text-white" onClick={() => setOpenReply((v) => !v)}>Reply</button>
          {Array.isArray(node.replies) && node.replies.length > 0 && (
            <button className="hover:text-white" onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? `Expand (${node.replies.length})` : "Collapse"}
            </button>
          )}
          {canManage && !editing && (
            <>
              <button className="hover:text-white" onClick={() => setEditing(true)}>Edit</button>
              <button className="hover:text-red-400 text-red-300" onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
        <AnimatePresence>
          {openReply && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="mt-2"
            >
              <textarea
                className="w-full p-2 rounded-md bg-neutral-900 border border-neutral-800 text-white"
                rows={3}
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button type="submit" className="px-3 py-1 rounded-md bg-blue-600 text-white">Post</button>
                <button type="button" className="px-3 py-1 rounded-md bg-neutral-800 text-neutral-200" onClick={() => setOpenReply(false)}>Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      {node.replies?.length > 0 && !collapsed && (
        <div className="ml-6 border-l border-neutral-800 pl-4">
          {node.replies.map((child) => (
            <CommentNode key={child.id} node={child} onReply={onReply} currentUser={currentUser} postId={postId} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ResearchPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myVote, setMyVote] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [lightbox, setLightbox] = useState({ open: false, src: "", alt: "" });
  const contentRef = useRef(null);
  const [hasJwt, setHasJwt] = useState(false);

  // Default avatar for all users when none is provided
  const DEFAULT_AVATAR = "/images/comment-avatar-default.png"; // put your image at public/images/comment-avatar-default.png

  // Map backend threaded comments to react-comments-section format
  const commentsData = useMemo(() => {
    const mapNode = (c) => ({
      userId: c.author_id || c.user_id || "anon",
      comId: c.id,
      fullName: c.author_name || c.author_full_name || c.user_name || "User",
      text: c.content || "",
      avatarUrl: c.author_avatar || c.author_avatar_url || DEFAULT_AVATAR,
      createdTime: c.created_at,
      replies: Array.isArray(c.replies) ? c.replies.map(mapNode) : [],
    });
    return Array.isArray(comments) ? comments.map(mapNode) : [];
  }, [comments]);

  const load = async () => {
    setLoading(true);
    const { post: p, comments: c, myVote: v } = await fetchResearchPost(id);
    setPost(p);
    setComments(c || []);
    setMyVote(v || 0);
    setLoading(false);
  };

  useEffect(() => {
    // Load post/comments and current user; also sync JWT token presence
    load();
    (async () => {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
      } catch {
        setCurrentUser(null);
      }
    })();
    try {
      setHasJwt(!!localStorage.getItem('token'));
    } catch { setHasJwt(false); }
    const onStorage = () => {
      try { setHasJwt(!!localStorage.getItem('token')); } catch {}
    };
    const onFocus = () => {
      try { setHasJwt(!!localStorage.getItem('token')); } catch {}
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Make images inside content clickable for lightbox
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const handler = (e) => {
      const t = e.target;
      if (t && t.tagName === 'IMG' && t.src) {
        setLightbox({ open: true, src: t.src, alt: t.alt || 'image' });
      }
    };
    container.addEventListener('click', handler);
    return () => container.removeEventListener('click', handler);
  }, [post]);

  const votesCount = useMemo(() => post?.votes_count ?? 0, [post]);

  const handleVote = async (value) => {
    if (voting) return;
    // Require login/JWT to vote
    if (!currentUser || !hasJwt) {
      toast.error("Please log in to vote on posts");
      navigate("/login");
      return;
    }
    const prevVote = myVote;
    const next = prevVote === value ? 0 : value; // toggle same vote clears it
    try {
      setVoting(true);
      // Optimistic UI update: reflect immediately
      setMyVote(next);
      setPost((prev) => (prev ? { ...prev, votes_count: (prev.votes_count ?? 0) + (next - prevVote) } : prev));

      const ok = await voteOnPost(id, next);
      if (!ok) {
        // Revert on failure
        setMyVote(prevVote);
        setPost((prev) => (prev ? { ...prev, votes_count: (prev.votes_count ?? 0) + (prevVote - next) } : prev));
        toast.error("Could not record your vote");
      }
    } catch (e) {
      // Revert on exception
      setMyVote(prevVote);
      setPost((prev) => (prev ? { ...prev, votes_count: (prev.votes_count ?? 0) + (prevVote - next) } : prev));
      toast.error(e?.message || "Vote failed");
    } finally {
      setVoting(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    if (!currentUser || !hasJwt) {
      toast.error("Please log in to save posts");
      navigate("/login");
      return;
    }
    setSaving(true);
    try {
      const ok = await savePost(id, "save");
      if (ok) toast.success("Saved to your library");
      else toast.error("Could not save the post");
    } catch (e) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title || 'Research Post', url });
        toast.success("Share dialog opened");
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch (e) {
        toast.error("Share failed");
      }
    }
  };

  const handleAddComment = async (parentId, text) => {
    if (!currentUser || !hasJwt) {
      toast.error("Please log in to comment");
      navigate("/login");
      return;
    }
    const c = await postComment(id, text, parentId || null);
    if (!c) return;
    // rebuild tree: simplest is to reload; for UX, we do minimal insert
    await load();
  };

  const canDelete = useMemo(() => {
    if (!currentUser || !post) return false;
    const role = currentUser.profile?.user_type || currentUser.user_type;
    const isOwner = post.author_id === currentUser.id;
    const isAdmin = role === 'admin';
    return isOwner || isAdmin;
  }, [currentUser, post]);

  const handleDelete = async () => {
    if (!currentUser || !hasJwt) {
      toast.error("Please log in to delete posts");
      navigate("/login");
      return;
    }
    if (!canDelete) return;
    const ok = window.confirm("Delete this research post? This action cannot be undone.");
    if (!ok) return;
    try {
      const success = await deleteResearchPost(id);
      if (success) {
        toast.success("Post deleted");
        navigate("/research-hub");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (e) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const submitRootComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await handleAddComment(null, newComment.trim());
    setNewComment("");
  };

  if (loading) {
    return <div className="pt-32 text-neutral-300 w-full lg:w-[70%] mx-auto px-4">Loading...</div>;
  }
  if (!post) {
    return <div className="pt-32 text-neutral-300 w-full lg:w-[70%] mx-auto px-4">Post not found.</div>;
  }

  return (
    <div className="research-post-page pt-28 pb-16">
      {/* Responsive image rules for research content and attachments */}
      <style>{`
        /* Rich content images */
        .content-body img {
          display: block;
          height: auto;
          width: min(100%, 500px);
          max-width: 100%;
          margin: 0 auto; /* center images */
          border-radius: 0.25rem;
        }
        /* Desktop: enforce 500px width for consistency */
        @media (min-width: 768px) {
          .content-body img {
            width: 500px;
            max-width: 500px;
          }
        }

        /* Attachment images */
        .attachment-image {
          display: block;
          height: auto;
          width: min(100%, 500px);
          max-width: 100%;
        }
        @media (min-width: 768px) {
          .attachment-image {
            width: 500px;
            max-width: 500px;
          }
        }
      `}</style>
      <div className="w-full lg:w-[70%] mx-auto px-4 lg:px-0">
        {/* Main Post Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            {/* Title and vote controls: stack on mobile, inline on sm+ */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white leading-snug">{post.title}</h1>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleVote(1)}
                  className={`p-1.5 sm:p-2 rounded-md border ${myVote === 1 ? 'bg-blue-600 text-white border-blue-500' : 'border-neutral-800 text-neutral-300 hover:bg-neutral-800'}`}
                  disabled={voting}
                  aria-label="Upvote"
                >
                  <ArrowBigUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="min-w-[1.5rem] sm:min-w-[2rem] text-center text-neutral-200 text-sm sm:text-base">{votesCount}</div>
                <button
                  onClick={() => handleVote(-1)}
                  className={`p-1.5 sm:p-2 rounded-md border ${myVote === -1 ? 'bg-blue-600 text-white border-blue-500' : 'border-neutral-800 text-neutral-300 hover:bg-neutral-800'}`}
                  disabled={voting}
                  aria-label="Downvote"
                >
                  <ArrowBigDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            {post.abstract && (
              <p className="mt-2 text-neutral-600 dark:text-neutral-300">{post.abstract}</p>
            )}
            {/* Actions */}
            <div className="mt-4 flex gap-2 flex-wrap">
              <button onClick={handleSave} disabled={saving} className="px-3 py-2 rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center gap-2 disabled:opacity-60">
                <Bookmark className="w-4 h-4" /> Save
              </button>
              <button className="px-3 py-2 rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" /> Share
              </button>
              {canDelete && (
                <button onClick={handleDelete} className="px-3 py-2 rounded-lg bg-red-600 text-white border border-red-700 flex items-center gap-2">
                  Delete Post
                </button>
              )}
              {!hasJwt && (
                <button onClick={() => navigate('/login')} className="px-3 py-2 rounded-lg bg-blue-600 text-white border border-blue-700 flex items-center gap-2">
                  Log in to manage
                </button>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button className="px-2 py-1 text-xs rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800" onClick={() => setShowRaw(v => !v)}>
                {showRaw ? 'Hide HTML' : 'View HTML'}
              </button>
            </div>
            <div
              ref={contentRef}
              className="content-body prose prose-neutral dark:prose-invert max-w-none mt-6"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post?.content || "", { USE_PROFILES: { html: true } }) }}
            />

            {showRaw && (
              <pre className="mt-4 p-3 rounded-lg bg-neutral-900 text-neutral-100 overflow-auto text-xs border border-neutral-800 whitespace-pre-wrap break-words">{post?.content || ''}</pre>
            )}

            {/* Attachments (if any and not already embedded in content) */}
            {Array.isArray(post.attachments) && post.attachments.length > 0 && (
              <div className="attachments mt-6">
                <h3 className="text-sm font-semibold text-neutral-500">Attachments</h3>
                <div className="mt-2 flex flex-wrap gap-1 items-center">
                  {post.attachments.map((a, idx) => (
                    <div key={idx} className="inline-block">
                      {String(a.mimetype || "").startsWith("image/") && a.url ? (
                        <a href={a.url} target="_blank" rel="noreferrer" title={a.filename || "image"}>
                          <img src={proxiedImage(a.url)} alt={a.filename || "attachment"} className="attachment-image rounded-sm" />
                        </a>
                      ) : (
                        <a href={a.url || '#'} target={a.url ? "_blank" : undefined} rel={a.url ? "noreferrer" : undefined} className="text-[10px] text-blue-600 max-w-[6rem] block truncate" title={a.filename || a.key || "Attachment"}>
                          {a.filename || a.key || "Attachment"}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(post.references_list?.length > 0) && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-neutral-500">References</h3>
                <ul className="list-disc list-inside text-sm text-neutral-400 mt-2">
                  {post.references_list.map((r, idx) => (
                    <li key={idx}>{typeof r === 'string' ? r : JSON.stringify(r)}</li>
                  ))}
                </ul>
              </div>
            )}
            {!hasJwt && (
              <div className="mt-6 flex gap-2 flex-wrap">
                <button onClick={() => navigate('/login')} className="px-3 py-2 rounded-lg bg-blue-600 text-white border border-blue-700 flex items-center gap-2">
                  Log in to manage
                </button>
              </div>
            )}
            <div className="mt-4 text-sm text-neutral-400 space-y-1">
              <div>Status: {post.status}</div>
              {post.related_herb_id && <div>Herb: {post.related_herb_id}</div>}
              {post.related_disease_id && <div>Disease: {post.related_disease_id}</div>}
              <div>Verified: {post.is_verified ? 'Yes' : 'No'}</div>
              <div>Created: {new Date(post.created_at || Date.now()).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Comments (react-comments-section) */}
        <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-white mb-4">Comments</h2>
          <CommentSection
            currentUser={{
              currentUserId: currentUser?.id || null,
              currentUserImg: (currentUser?.profile?.avatar || currentUser?.avatar || DEFAULT_AVATAR),
              currentUserFullName: (currentUser?.profile?.name || currentUser?.name || currentUser?.email || "User"),
            }}
            commentData={commentsData}
            onSubmitAction={async (data) => {
              // Root comment
              const ok = await postComment(id, data.text, null);
              if (ok) await load();
              return ok;
            }}
            onReplyAction={async (data) => {
              const ok = await postComment(id, data.text, data.parentOfRepliedCommentId || data.comId);
              if (ok) await load();
              return ok;
            }}
            onEditAction={async (data) => {
              const ok = await updateComment(id, data.comId, data.text);
              if (ok) await load();
              return ok;
            }}
            onDeleteAction={async (data) => {
              const ok = await deleteComment(id, data.comId);
              if (ok) await load();
              return ok;
            }}
            logIn={{ loginLink: "/login", signupLink: "/register" }}
            customNoCommentText="No comments yet. Be the first to comment."
            hrStyle={{ border: "1px solid rgba(255,255,255,0.1)" }}
            advancedInput={true}
          />
        {lightbox.open && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox({ open: false, src: "", alt: "" })}>
            <img src={lightbox.src} alt={lightbox.alt} className="max-h-[90vh] max-w-[90vw] rounded shadow-2xl" />
          </div>
        )}
      </div>
    </div>
  );
};
