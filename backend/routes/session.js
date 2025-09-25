import express from "express";
import jwt from "jsonwebtoken";
import supabase, { supabaseAdmin } from "../config/supabase.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Alias for frontend fallback to avoid blockers on "/api/auth/*"
// POST /api/session/exchange
router.post("/exchange", async (req, res) => {
  try {
    const { access_token } = req.body || {};
    if (!access_token) {
      return res.status(400).json({ success: false, message: "Missing access_token" });
    }

    // Verify Supabase access token and get the user
    const { data, error } = await supabaseAdmin.auth.getUser(access_token);
    if (error || !data?.user) {
      return res.status(401).json({ success: false, message: "Invalid Supabase token" });
    }
    const sbUser = data.user;

    // Our users table should have the same id
    const { data: dbUser, error: dbErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", sbUser.id)
      .single();

    if (dbErr || !dbUser) {
      return res.status(404).json({ success: false, message: "User not found in application" });
    }

    // Issue app JWT
    const token = jwt.sign(
      {
        id: dbUser.id,
        email: dbUser.email,
        userType: dbUser.user_type,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({ success: true, data: { token, user: dbUser } });
  } catch (err) {
    console.error("Session exchange error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
