// src/services/researchService.js
import { supabase } from "../config/supabase";

const TABLE = "research_posts";

const researchService = {
  // Fetch all research posts
  async getAllPosts() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // Fetch a single post by ID
  async getPostById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  // Add a new research post
  async addPost(post) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([post])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update an existing post
  async updatePost(id, updates) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete a post
  async deletePost(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", id);
    if (error) throw error;
    return data;
  },

  // Filter posts by herbs, diseases, and status
  async filterPosts({ herbs = [], diseases = [], status = [] }) {
    let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });

    if (herbs.length) query = query.in("related_herb_id", herbs);
    if (diseases.length) query = query.in("related_disease_id", diseases);
    if (status.length) query = query.in("status", status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

export default researchService;
