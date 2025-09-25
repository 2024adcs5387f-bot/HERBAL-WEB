// routes/research.js
import express from "express";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import supabase, { supabaseAdmin } from "../config/supabase.js";
import { normalizeStructured } from "../services/structuring.js";

const router = express.Router();

// ----------------------
// Create a research post
// ----------------------
// Use optionalAuth and service role to avoid client-side RLS recursion issues during create
router.post("/", optionalAuth, async (req, res) => {
  try {
    const {
      title,
      abstract,
      content,
      references, // array of reference strings or objects
      attachments,
      relatedHerbId,
      relatedDiseaseId,
      authorId,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    // Align with Supabase snake_case columns per 02_extended_research.sql
    // Prefer authenticated user id; fallback to provided authorId
    const author_id = req.user?.id || authorId || null;

    const { data, error } = await supabaseAdmin
      .from("research_posts")
      .insert([
        {
          title,
          abstract,
          content,
          references_list: references || [],
          attachments: attachments || [],
          related_herb_id: relatedHerbId || null,
          related_disease_id: relatedDiseaseId || null,
          author_id,
          status: "published",
          is_verified: true,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    // Create initial structured record (best-effort; ignore errors)
    try {
      const normalized = normalizeStructured(req.body, data);
      await supabase.from("research_structured").insert([{ post_id: data.id, ...normalized }]);
    } catch (e) {
      console.warn("research_structured insert warning:", e.message);
    }

    res.status(201).json({ success: true, data: { post: data } });
  } catch (err) {
    console.error("Create research post error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// List/search research posts
// ----------------------
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, q, herbId, diseaseId, verified, sortBy = "newest" } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    // Base select with count
    let query = supabaseAdmin
      .from("research_posts")
      .select("*", { count: "exact" })
      .range(from, to);

    // Public listing should only include published posts by default
    query = query.eq('status', 'published');
    if (verified === "true") query = query.eq("is_verified", true);

    if (q) {
      // Use ilike on title for now; can be upgraded to full-text search via search_tsv
      query = query.ilike("title", `%${q}%`);
    }
    if (herbId) query = query.eq("related_herb_id", herbId);
    if (diseaseId) query = query.eq("related_disease_id", diseaseId);

    // Sorting
    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "most_upvoted") {
      // Will sort client-side after computing vote counts due to Supabase query limitations without a view
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "most_commented") {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Aggregate votes and comments counts for the fetched posts
    const ids = (data || []).map((p) => p.id);
    let postsWithAgg = data || [];
    if (ids.length) {
      const { data: votesAgg } = await supabaseAdmin
        .from("research_votes")
        .select("post_id, value")
        .in("post_id", ids);

      const { data: commentsAgg } = await supabaseAdmin
        .from("comments")
        .select("post_id")
        .in("post_id", ids);

      const voteCountMap = new Map();
      (votesAgg || []).forEach((v) => {
        voteCountMap.set(v.post_id, (voteCountMap.get(v.post_id) || 0) + (v.value || 0));
      });

      const commentCountMap = new Map();
      (commentsAgg || []).forEach((c) => {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
      });

      postsWithAgg = (data || []).map((p) => ({
        ...p,
        votes_count: voteCountMap.get(p.id) || 0,
        comments_count: commentCountMap.get(p.id) || 0,
      }));

      if (sortBy === "most_upvoted") {
        postsWithAgg.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
      } else if (sortBy === "most_commented") {
        postsWithAgg.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
      }
    }

    res.json({
      success: true,
      data: {
        posts: postsWithAgg,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((count || postsWithAgg.length) / limit),
          totalItems: count || postsWithAgg.length,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (err) {
    console.error("List research posts error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Get single post with comments
// ----------------------
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { data: post, error } = await supabase
      .from("research_posts")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    // Fetch comments and build a tree (threaded)
    const { data: comments, error: commentError } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", req.params.id);

    if (commentError) console.warn("Comments fetch warning:", commentError.message);

    const byId = new Map();
    (comments || []).forEach((c) => byId.set(c.id, { ...c, replies: [] }));
    const roots = [];
    (comments || []).forEach((c) => {
      const node = byId.get(c.id);
      if (c.parent_id) {
        const parent = byId.get(c.parent_id);
        if (parent) parent.replies.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    });

    // Fetch vote summary and current user vote
    const [{ data: votes }, { data: myVote }] = await Promise.all([
      supabase.from("research_votes").select("value").eq("post_id", req.params.id),
      req.user
        ? supabase
            .from("research_votes")
            .select("value")
            .eq("post_id", req.params.id)
            .eq("user_id", req.user.id)
            .single()
        : Promise.resolve({ data: null }),
    ]);
    const votes_count = (votes || []).reduce((acc, v) => acc + (v.value || 0), 0);

    res.json({ success: true, data: { post: { ...post, votes_count }, comments: roots, myVote: myVote?.value || 0 } });
  } catch (err) {
    console.error("Get research post error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Update post (author/admin)
// ----------------------
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { data: post, error } = await supabase
      .from("research_posts")
      .select("author_id")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    const isOwner = post.author_id === req.user.id;
    const isAdmin = req.user.userType === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updatable = [
      "title",
      "abstract",
      "content",
      "references_list",
      "attachments",
      "related_herb_id",
      "related_disease_id",
      "status",
      "is_verified",
    ];

    const dataToUpdate = {};
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) dataToUpdate[k] = req.body[k];
    });

    const { data: updatedPost, error: updateError } = await supabase
      .from("research_posts")
      .update(dataToUpdate)
      .eq("id", req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Optionally upsert structured data when provided
    try {
      const normalized = normalizeStructured(req.body.structured || req.body, updatedPost);
      if (Object.keys(normalized || {}).length > 0) {
        const { data: existing } = await supabase
          .from("research_structured")
          .select("id")
          .eq("post_id", req.params.id)
          .single();

        if (existing) {
          await supabase
            .from("research_structured")
            .update(normalized)
            .eq("post_id", req.params.id);
        } else {
          await supabase
            .from("research_structured")
            .insert([{ post_id: req.params.id, ...normalized }]);
        }
      }
    } catch (e) {
      console.warn("research_structured upsert warning:", e.message);
    }

    res.json({ success: true, message: "Post updated", data: { post: updatedPost } });
  } catch (err) {
    console.error("Update research post error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Add comment or reply
// ----------------------
router.post("/:id/comments", authenticate, async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content)
      return res.status(400).json({ success: false, message: "Content is required" });

    const { data: comment, error } = await supabase
      .from("comments")
      .insert([
        {
          content,
          parent_id: parentId || null,
          post_id: req.params.id,
          author_id: req.user.id,
          entity_type: "research_post",
          entity_id: req.params.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: { comment } });
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Upvote/Downvote a post
// ----------------------
router.post("/:id/votes", authenticate, async (req, res) => {
  try {
    const { value } = req.body; // expected -1, 0, or 1 (0 to clear)
    if (![ -1, 0, 1 ].includes(value)) {
      return res.status(400).json({ success: false, message: "Invalid vote value" });
    }

    if (value === 0) {
      await supabase
        .from("research_votes")
        .delete()
        .eq("post_id", req.params.id)
        .eq("user_id", req.user.id);
      return res.json({ success: true, message: "Vote removed" });
    }

    // Upsert user vote
    const { error } = await supabase
      .from("research_votes")
      .upsert({ post_id: req.params.id, user_id: req.user.id, value }, { onConflict: "post_id,user_id" });
    if (error) throw error;

    res.json({ success: true, message: "Vote recorded" });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Save/Unsave a post
// ----------------------
router.post("/:id/save", authenticate, async (req, res) => {
  try {
    const { action } = req.body; // "save" | "unsave"
    if (["save", "unsave"].includes(action) === false) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }
    if (action === "unsave") {
      await supabase
        .from("research_saves")
        .delete()
        .eq("post_id", req.params.id)
        .eq("user_id", req.user.id);
      return res.json({ success: true, message: "Post unsaved" });
    }
    const { error } = await supabase
      .from("research_saves")
      .upsert({ post_id: req.params.id, user_id: req.user.id }, { onConflict: "post_id,user_id" });
    if (error) throw error;
    res.json({ success: true, message: "Post saved" });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Delete a post (author must be a researcher)
// ----------------------
router.delete("/:id", authenticate, async (req, res) => {
  try {
    // Fetch post author using admin client (bypass RLS after our app-level auth)
    const { data: post, error } = await supabaseAdmin
      .from("research_posts")
      .select("author_id")
      .eq("id", req.params.id)
      .single();
    if (error) throw error;
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const isOwner = post.author_id === req.user.id;
    const isAdmin = req.user.userType === "admin";
    // Allow the post author OR an admin to delete. This avoids role mismatches blocking authors.
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Only the author or an admin can delete this post" });
    }

    // Clean up dependents first to avoid FK/RLS surprises (votes, saves, comments), then the post
    const postId = req.params.id;
    const tasks = [];
    tasks.push(
      supabaseAdmin.from("research_votes").delete().eq("post_id", postId)
    );
    tasks.push(
      supabaseAdmin.from("research_saves").delete().eq("post_id", postId)
    );
    tasks.push(
      supabaseAdmin.from("comments").delete().eq("post_id", postId)
    );
    await Promise.allSettled(tasks);

    const { error: delErr } = await supabaseAdmin
      .from("research_posts")
      .delete()
      .eq("id", postId);
    if (delErr) throw delErr;

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("Delete research post error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// MAINTENANCE: One-time force delete (no user session)
// PROTECT with MAINTENANCE_KEY header. Only use locally, then remove.
// ----------------------
router.delete("/force/:id", async (req, res) => {
  try {
    const configuredKey = process.env.MAINTENANCE_KEY;
    const providedKey = req.header('x-maintenance-key');
    if (!configuredKey || configuredKey !== providedKey) {
      return res.status(401).json({ success: false, message: "Unauthorized maintenance access" });
    }

    const { data: post, error } = await supabase
      .from("research_posts")
      .select("id")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const { error: delErr } = await supabase
      .from("research_posts")
      .delete()
      .eq("id", req.params.id);
    if (delErr) throw delErr;

    return res.json({ success: true, message: "Post force-deleted" });
  } catch (err) {
    console.error("Force delete research post error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
