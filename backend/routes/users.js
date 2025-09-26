import express from "express";
import supabase from "../config/supabase.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// ----------------------
// Get logged-in user profile
// ----------------------
router.get("/profile", authenticate, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ----------------------
// Update user profile
// ----------------------
router.put("/profile", authenticate, async (req, res) => {
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

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", req.user.id)
      .select("*")
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ----------------------
// Get verified herbalists
// ----------------------
router.get("/herbalists", async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .eq("user_type", "herbalist")
      .eq("herbalist_verification_status", "approved")
      .eq("is_active", true);

    if (specialization) {
      query = query.contains("specializations", [specialization]);
    }

    const { data: herbalists, count, error } = await query.range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        herbalists,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (err) {
    console.error("Get herbalists error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
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
