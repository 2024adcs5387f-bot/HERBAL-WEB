import express from "express";
import supabase, { supabaseAdmin } from "../config/supabase.js";
import { resolveUserAnyToken } from "../middleware/auth.js";

const router = express.Router();

// ----------------------
// Get logged-in user profile
// ----------------------
router.get("/profile", resolveUserAnyToken, async (req, res) => {
  try {
    // Try fetch existing user row
    let { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.authUser.id)
      .single();

    // If no row (PGRST116) or user null, auto-provision minimal record
    if ((error && error.code === "PGRST116") || !user) {
      const minimal = {
        id: req.authUser.id,
        user_type: req.authUser.userType || process.env.DEFAULT_NEW_USER_ROLE || "buyer",
        is_active: true,
      };
      const { error: insErr } = await supabaseAdmin
        .from("users")
        .insert([minimal]);
      if (insErr) {
        console.error("Auto-provision user failed:", insErr);
        return res.status(500).json({ success: false, message: "Failed to provision user" });
      }
      // Re-fetch the newly created row
      const re = await supabase
        .from("users")
        .select("*")
        .eq("id", req.authUser.id)
        .single();
      user = re.data;
    } else if (error) {
      // Other errors
      throw error;
    }

    return res.json({ success: true, data: { user } });
  } catch (err) {
    console.error("Get profile error:", err?.message || err, {
      userId: req?.authUser?.id,
    });
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
      code: err?.code || undefined,
    });
  }
});

// ----------------------
// Update user profile
// ----------------------
router.put("/profile", resolveUserAnyToken, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "address",
      "bio",
      "business_name",
      "credentials",
      "specializations",
      "experience",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    // Ensure row exists, then update via admin upsert (bypasses RLS)
    const base = { id: req.authUser.id };
    const upsertPayload = { ...base, ...updateData };
    const { error: upsertErr } = await supabaseAdmin
      .from("users")
      .upsert(upsertPayload, { onConflict: "id" });
    if (upsertErr) {
      console.error("Upsert profile failed:", upsertErr, {
        userId: req?.authUser?.id,
        payload: upsertPayload,
      });
      return res.status(500).json({
        success: false,
        message: upsertErr?.message || "Failed to update profile",
        code: upsertErr?.code || undefined,
      });
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.authUser.id)
      .single();
    if (error) throw error;

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (err) {
    console.error("Update profile error:", err?.message || err, {
      userId: req?.authUser?.id,
      body: req?.body,
    });
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
      code: err?.code || undefined,
    });
  }
});

// ----------------------
// Get verified sellers
// ----------------------
router.get("/sellers", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    const { data: sellers, count, error } = await supabase
      .from("users")
      .select("*", { count: "exact" })
      .eq("user_type", "seller")
      .eq("seller_verification_status", "approved")
      .eq("is_active", true)
      .range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        sellers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (err) {
    console.error("Get sellers error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
