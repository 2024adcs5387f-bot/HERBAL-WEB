import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchResearchPost, updateResearchPost } from "../api/research";
import { supabase } from "../config/supabase";

// TipTap editor
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

export default function ResearchEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [referencesList, setReferencesList] = useState([""]);
  const [relatedHerb, setRelatedHerb] = useState("");
  const [relatedDisease, setRelatedDisease] = useState("");
  const [herbs, setHerbs] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const uploadInputRef = useRef(null);

  // Load vocabularies and the post
  useEffect(() => {
    (async () => {
      try {
        const [{ data: herbsData }, { data: diseasesData }] = await Promise.all([
          supabase.from("herbs").select("id,name").eq("is_active", true),
          supabase.from("diseases").select("id,name").eq("is_active", true),
        ]);
        setHerbs(herbsData || []);
        setDiseases(diseasesData || []);
      } catch {}
      try {
        const data = await fetchResearchPost(id);
        const post = data?.post;
        if (post) {
          setTitle(post.title || "");
          setAbstract(post.abstract || "");
          setContent(post.content || "");
          setReferencesList(post.references_list || post.references || []);
          setRelatedHerb(post.related_herb_id || post.relatedHerbId || "");
          setRelatedDisease(post.related_disease_id || post.relatedDiseaseId || "");
          setAttachments(post.attachments || []);
        } else {
          setError("Unable to load the post for editing.");
        }
      } catch (e) {
        setError(e?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // TipTap setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Edit your research content here…" }),
    ],
    content,
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none min-h-[320px] px-3 py-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    // When initial content arrives, set it into the editor
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const addLink = useCallback(() => {
    const url = prompt("Enter URL");
    if (!url) return;
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  const triggerUpload = () => {
    try { uploadInputRef.current?.click(); } catch {}
  };

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
      // Insert first uploaded image into editor at caret
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
      };
      const updated = await updateResearchPost(id, payload);
      if (!updated) throw new Error("Failed to update post");
      setNotice("Research post updated successfully.");
      navigate(`/research/${id}`);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container pt-28 pb-16">
        <div className="max-w-4xl mx-auto text-center text-neutral-600 dark:text-neutral-300">Loading post…</div>
      </div>
    );
  }

  return (
    <div className="container pt-28 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70">
          <div className="p-6">
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-6">Edit Research Post</h1>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-900/50">{error}</div>
            )}
            {notice && (
              <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-900/50">{notice}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-white">Title</label>
                <input className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" value={title} onChange={(e)=>setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-white">Abstract</label>
                <textarea className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" rows={3} value={abstract} onChange={(e)=>setAbstract(e.target.value)} />
              </div>
              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-white">Content</label>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-xs" onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
                    <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-xs" onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
                    <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-xs" onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
                    <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-xs" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
                    <button type="button" className="px-2 py-1 rounded-md bg-neutral-800 text-white text-xs" onClick={addLink}>Link</button>
                    <button type="button" className="px-2 py-1 rounded-md bg-neutral-700 text-white text-xs" onClick={removeLink}>Unlink</button>
                    <button type="button" className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700" onClick={triggerUpload}>Upload</button>
                    <input
                      ref={uploadInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv"
                      onChange={(e)=>handleUpload(e.target.files)}
                      multiple
                    />
                  </div>
                  <div className="px-2 py-2">
                    {editor && <EditorContent editor={editor} />}
                    {!editor && (
                      <textarea className="w-full px-3 py-2 rounded-md bg-white dark:bg-neutral-900 dark:text-white" rows={12} value={content} onChange={(e)=>setContent(e.target.value)} required />
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">Tip: Click where you want an image, then Upload to insert at the caret.</p>
              </div>

              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-white">Attachments</label>
                <div className="flex flex-wrap gap-3">
                  {attachments.map((a, idx) => (
                    <div key={idx} className="p-2 border rounded-lg dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60">
                      {a.mimetype?.startsWith('image/') ? (
                        <img src={a.url} alt={a.filename} className="h-20 w-28 object-cover rounded" />
                      ) : (
                        <div className="text-sm max-w-[12rem] break-words">
                          <span className="block font-medium">{a.filename}</span>
                          <span className="text-neutral-500 dark:text-neutral-300 text-xs">{a.mimetype}</span>
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
                {/* Secondary attachment control to ensure visibility */}
                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white cursor-pointer">
                    Add Attachment
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv"
                      onChange={(e)=>handleUpload(e.target.files)}
                      multiple
                    />
                  </label>
                  <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">You can also use the Upload button in the editor toolbar above.</p>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-neutral-700 dark:text-white">References</label>
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
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-white">Related Herb</label>
                  <select className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" value={relatedHerb} onChange={(e)=>setRelatedHerb(e.target.value)}>
                    <option value="">Select Herb</option>
                    {herbs.map((h)=> <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-neutral-700 dark:text-white">Related Disease</label>
                  <select className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-900 dark:text-white" value={relatedDisease} onChange={(e)=>setRelatedDisease(e.target.value)}>
                    <option value="">Select Disease</option>
                    {diseases.map((d)=> <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button whileHover={{ scale: 1.03 }} type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-blue-600 text-white">
                  {submitting ? 'Saving Changes…' : 'Save Changes'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
