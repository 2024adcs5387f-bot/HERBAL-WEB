import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase, { supabaseAdmin } from "../config/supabase.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ----------------------
// Signup route
// ----------------------
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      userType,        // maps to user_type
      phone,
      address,
      business_name,
      business_license,
      bio,
      experience
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert([{
        name,
        email,
        password: hashedPassword,
        user_type: userType || "buyer",
        phone: phone || null,
        address: address || {},
        business_name: business_name || null,
        business_license: business_license || null,
        bio: bio || null,
        experience: experience || 0
      }])
      .select("*")
      .single();

    if (insertError) throw insertError;

    // Generate JWT
    const token = jwt.sign({
      id: user.id,
      email: user.email,
      userType: user.user_type
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ success: true, data: { user, token } });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Login route
// ----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Fetch user
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({
      id: user.id,
      email: user.email,
      userType: user.user_type
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Update last login
    await supabase.from("users").update({ last_login_at: new Date() }).eq("id", user.id);

    res.json({ success: true, data: { user, token } });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Supabase session -> App JWT exchange
// ----------------------
router.post("/supabase-exchange", async (req, res) => {
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
    let { data: dbUser, error: dbErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", sbUser.id)
      .maybeSingle();

    // If the user is not present in application DB, auto-provision a minimal row
    if (!dbUser) {
      const minimal = {
        id: sbUser.id,
        name: sbUser.user_metadata?.name || (sbUser.email ? sbUser.email.split('@')[0] : 'User'),
        email: sbUser.email,
        user_type: sbUser.user_metadata?.role || 'buyer',
      };
      const { error: insErr } = await supabase.from('users').insert([minimal]);
      if (!insErr) {
        const { data: fetched } = await supabase
          .from('users')
          .select('*')
          .eq('id', sbUser.id)
          .maybeSingle();
        dbUser = fetched || minimal;
      } else {
        // If insert failed (e.g., RLS/race), still proceed without 404 to avoid blocking login
        dbUser = minimal;
      }
    }

    // Issue app JWT
    const token = jwt.sign({
      id: dbUser.id,
      email: dbUser.email,
      userType: dbUser.user_type,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({ success: true, data: { token, user: dbUser } });
  } catch (err) {
    console.error("Supabase exchange error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
