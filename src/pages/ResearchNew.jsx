import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createResearchPost } from "../api/research";
import { supabase } from "../config/supabase";

// TipTap editor
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

export default function ResearchNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [referencesList, setReferencesList] = useState([""]);
  const [relatedHerb, setRelatedHerb] = useState("");
  const [relatedDisease, setRelatedDisease] = useState("");
  const [herbs, setHerbs] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attachments, setAttachments] = useState([]); // {url,key,filename,mimetype,size}

  useEffect(() => {
    (async () => {
      const { data: herbsData } = await supabase.from("herbs").select("id,name").eq("is_active", true);
      const { data: diseasesData } = await supabase.from("diseases").select("id,name").eq("is_active", true);
      setHerbs(herbsData || []);
      setDiseases(diseasesData || []);
    })();
  }, []);

  // TipTap setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Write your research content here…" }),
    ],
    content,
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none min-h-[240px] rounded-lg border px-3 py-2 focus:outline-none",
      },
    },
  });

  const addLink = useCallback(() => {
    const url = prompt("Enter URL");
    if (!url) return;
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  const handleUpload = async (files) => {
    try {
      if (!files || files.length === 0) return;
      const form = new FormData();
      [...files].forEach(f => form.append("files", f));
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/uploads/multiple`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Upload failed");
      const filesInfo = data.data.files || [];
      setAttachments(prev => [...prev, ...filesInfo]);
      // If a single image was uploaded and cursor is in editor, insert image at caret
      const firstImg = filesInfo.find(f => String(f.mimetype).startsWith("image/"));
      if (firstImg && editor) {
        const imgUrl = firstImg.url || null;
        if (imgUrl) editor.chain().focus().setImage({ src: imgUrl, alt: firstImg.filename }).run();
      }
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    }
  };

  const removeAttachment = async (key) => {
    try {
      if (!key) return;
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/uploads?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      setAttachments(prev => prev.filter(a => a.key !== key));
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    }
  };

  const addReference = () => setReferencesList((prev) => [...prev, ""]);
  const updateReference = (idx, val) => setReferencesList((prev) => prev.map((r, i) => (i === idx ? val : r)));
  const removeReference = (idx) => setReferencesList((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        title,
        abstract,
        content: editor ? editor.getHTML() : content,
        references: referencesList.filter(Boolean),
        relatedHerbId: relatedHerb || null,
        relatedDiseaseId: relatedDisease || null,
        attachments,
        schemaVersion: "1.0",
        entities: {},
        keyphrases: [],
        annotations: {},
      };
      const post = await createResearchPost(payload);
      if (post) {
        setNotice("Research post published successfully.");
        // Redirect to Research Hub so the new post appears in the feed
        navigate(`/research-hub`);
      }
      else {
        // Fallback: insert directly via Supabase client (RLS must allow researcher inserts)
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          setError("Please log in to publish a research post.");
          return;
        }
        const insertBody = {
          title,
          abstract,
          content,
          references_list: referencesList.filter(Boolean),
          attachments,
          related_herb_id: relatedHerb || null,
          related_disease_id: relatedDisease || null,
          author_id: auth.user.id,
          status: 'published',
        };
        const { data: directPost, error: directErr } = await supabase
          .from('research_posts')
          .insert([insertBody])
          .select('*')
          .single();
        if (directErr) {
          console.error('Supabase direct insert error:', directErr);
          setError("Failed to publish. Ensure your account has researcher access and try again.");
          return;
        }
        // Best-effort: do not block on structured creation; the backend can enrich later
        setNotice("Research post published successfully.");
        navigate('/research-hub');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container pt-28 pb-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-6">New Research Post</h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200">{error}</div>
        )}
        {notice && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-200">{notice}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-200">Title</label>
            <input className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" value={title} onChange={(e)=>setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-200">Abstract</label>
            <textarea className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" rows={3} value={abstract} onChange={(e)=>setAbstract(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-200">Content</label>
            {/* Editor toolbar */}
            <div className="flex flex-wrap gap-2 mb-2">
              <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-sm" onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
              <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-sm" onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
              <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-sm" onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
              <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-sm" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
              <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-sm" onClick={addLink}>Link</button>
              <button type="button" className="px-2 py-1 rounded-md bg-neutral-700 text-white text-sm" onClick={removeLink}>Unlink</button>
              <label className="px-2 py-1 rounded-md bg-blue-600 text-white text-sm cursor-pointer">
                Upload
                <input type="file" className="hidden" accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv" onChange={(e)=>handleUpload(e.target.files)} multiple />
              </label>
            </div>
            {editor && <EditorContent editor={editor} />}
            {!editor && (
              <textarea className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" rows={10} value={content} onChange={(e)=>setContent(e.target.value)} required />
            )}
            <p className="mt-2 text-xs text-neutral-500">Images are auto-resized to fit. Click where you want an image, then use Upload to insert at caret.</p>
          </div>

          {/* Attachments Manager */}
          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-200">Attachments</label>
            <div className="flex flex-wrap gap-3">
              {attachments.map((a, idx) => (
                <div key={idx} className="p-2 border rounded-lg dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60">
                  {a.mimetype?.startsWith('image/') ? (
                    <img src={a.url} alt={a.filename} className="h-20 w-28 object-cover rounded" />
                  ) : (
                    <div className="text-sm max-w-[12rem] break-words">
                      <span className="block font-medium">{a.filename}</span>
                      <span className="text-neutral-500 text-xs">{a.mimetype}</span>
                    </div>
                  )}
                  <div className="mt-2 flex gap-2 text-sm">
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600">Open</a>
                    )}
                    {a.key && (
                      <button type="button" className="text-red-600" onClick={() => removeAttachment(a.key)}>Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-200">References</label>
            <div className="space-y-2">
              {referencesList.map((ref, idx) => (
                <div key={idx} className="flex gap-2">
                  <input className="flex-1 px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" value={ref} onChange={(e)=>updateReference(idx, e.target.value)} placeholder="e.g., PMID:123456 or full citation" />
                  <button type="button" className="px-3 py-2 rounded-lg bg-neutral-800 text-white" onClick={() => removeReference(idx)}>Remove</button>
                </div>
              ))}
              <button type="button" className="px-3 py-2 rounded-lg bg-neutral-800 text-white" onClick={addReference}>Add Reference</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-200">Related Herb</label>
              <select className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" value={relatedHerb} onChange={(e)=>setRelatedHerb(e.target.value)}>
                <option value="">Select Herb</option>
                {herbs.map((h)=> <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-neutral-700 dark:text-neutral-200">Related Disease</label>
              <select className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" value={relatedDisease} onChange={(e)=>setRelatedDisease(e.target.value)}>
                <option value="">Select Disease</option>
                {diseases.map((d)=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <motion.button whileHover={{ scale: 1.03 }} type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-blue-600 text-white">
              {submitting ? 'Publishing...' : 'Publish Post'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
