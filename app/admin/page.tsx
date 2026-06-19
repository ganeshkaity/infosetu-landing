"use client";

import { useState, useEffect, FormEvent } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FileText, MessageSquare, Send, RefreshCw, FolderPlus, Trash2, ImageIcon, CheckCircle2, XCircle, Loader2, BookOpen, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const IMG_BB_API_KEY = "f836d90a7d863714c3ebfd67412a5cbf";

type UploadStep = "idle" | "uploading_image" | "saving_article" | "done" | "error";

interface UploadProgress {
  step: UploadStep;
  message: string;
  percent: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"articles" | "messages" | "categories" | "manage">("articles");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [messages, setMessages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Upload progress modal
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    step: "idle",
    message: "",
    percent: 0,
  });
  const [showProgressModal, setShowProgressModal] = useState(false);

  const handleArticleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const target = e.target as typeof e.target & {
      title: { value: string };
      excerpt: { value: string };
      content: { value: string };
      category: { value: string };
      meta: { value: string };
      slug: { value: string };
    };

    setShowProgressModal(true);
    setUploadProgress({ step: "idle", message: "Starting...", percent: 0 });

    let mainImageUrl = "";
    let thumbImageUrl = "";

    try {
      if (imageFile) {
        setUploadProgress({ step: "uploading_image", message: "Uploading image to ImgBB...", percent: 20 });

        const formData = new FormData();
        formData.append("image", imageFile);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
          method: "POST",
          body: formData,
        });

        setUploadProgress({ step: "uploading_image", message: "Processing image response...", percent: 55 });
        const json = await response.json();

        if (response.ok && json.success) {
          mainImageUrl = json.data.image?.url || json.data.url || "";
          thumbImageUrl = json.data.thumb?.url || json.data.display_url || "";
          setUploadProgress({ step: "uploading_image", message: "Image uploaded successfully!", percent: 70 });
        } else {
          throw new Error(json?.error?.message || "ImgBB upload failed");
        }
      } else {
        setUploadProgress({ step: "uploading_image", message: "No image selected, skipping upload.", percent: 70 });
      }

      setUploadProgress({ step: "saving_article", message: "Saving article to Firestore...", percent: 85 });

      await addDoc(collection(db, "articles"), {
        title: target.title.value,
        excerpt: target.excerpt.value,
        content: target.content.value,
        category: target.category.value,
        meta: target.meta.value,
        slug: target.slug.value,
        mainImageUrl,
        thumbImageUrl,
        createdAt: new Date(),
      });

      setUploadProgress({ step: "done", message: "Article published successfully!", percent: 100 });

      setTimeout(() => {
        setShowProgressModal(false);
        setUploadProgress({ step: "idle", message: "", percent: 0 });
        (e.target as HTMLFormElement).reset();
        setImageFile(null);
        setImagePreview(null);
      }, 2500);
    } catch (error: any) {
      console.error("Error:", error);
      setUploadProgress({
        step: "error",
        message: error.message || "Something went wrong. Please try again.",
        percent: 100,
      });
    }
  };

  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const target = e.target as typeof e.target & { label: { value: string } };
      await addDoc(collection(db, "categories"), { label: target.label.value, count: 0 });
      setStatus("success");
      fetchCategories();
      setTimeout(() => { setStatus("idle"); (e.target as HTMLFormElement).reset(); }, 2000);
    } catch (error) {
      console.error("Error adding category:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteDoc(doc(db, "articles", id));
      setAllArticles((prev) => prev.filter((a) => a.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  const handleEditSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setEditSaving(true);

    const target = e.target as typeof e.target & {
      title: { value: string };
      excerpt: { value: string };
      content: { value: string };
      category: { value: string };
      meta: { value: string };
      slug: { value: string };
    };

    let mainImageUrl = editingArticle.mainImageUrl || "";
    let thumbImageUrl = editingArticle.thumbImageUrl || "";

    try {
      if (editImageFile) {
        const formData = new FormData();
        formData.append("image", editImageFile);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
          method: "POST",
          body: formData,
        });
        const json = await response.json();
        if (response.ok && json.success) {
          mainImageUrl = json.data.image?.url || json.data.url || "";
          thumbImageUrl = json.data.thumb?.url || json.data.display_url || "";
        }
      }

      await updateDoc(doc(db, "articles", editingArticle.id), {
        title: target.title.value,
        excerpt: target.excerpt.value,
        content: target.content.value,
        category: target.category.value,
        meta: target.meta.value,
        slug: target.slug.value,
        mainImageUrl,
        thumbImageUrl,
        updatedAt: new Date(),
      });

      // Refresh the list and close modal
      setAllArticles((prev) =>
        prev.map((a) =>
          a.id === editingArticle.id
            ? { ...a, title: target.title.value, excerpt: target.excerpt.value, content: target.content.value, category: target.category.value, meta: target.meta.value, slug: target.slug.value, mainImageUrl, thumbImageUrl }
            : a
        )
      );
      setEditingArticle(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    } catch (error) {
      console.error("Error updating article:", error);
      alert("Failed to update article. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "categories"));
      const querySnapshot = await getDocs(q);
      setCategories(querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAllArticles = async () => {
    setLoadingArticles(true);
    try {
      const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setAllArticles(querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoadingArticles(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      setMessages(querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === "messages") fetchMessages();
    else if (activeTab === "articles" || activeTab === "categories") fetchCategories();
    else if (activeTab === "manage") fetchAllArticles();
  }, [activeTab]);

  const tabs = [
    { id: "articles", label: "Create Article", icon: FileText },
    { id: "manage", label: "Manage Articles", icon: BookOpen },
    { id: "categories", label: "Categories", icon: FolderPlus },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ] as const;

  return (
    <main className="relative min-h-screen overflow-hidden pt-24 pb-32">
      <div className="absolute inset-0 grid-noise opacity-60 pointer-events-none" />

      {/* Upload Progress Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md mx-4 rounded-[2rem] border border-white/10 bg-[#0f172a] p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-6">
                {/* Icon */}
                <div className="relative">
                  {uploadProgress.step === "done" ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                      <CheckCircle2 className="h-16 w-16 text-emerald-400" />
                    </motion.div>
                  ) : uploadProgress.step === "error" ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                      <XCircle className="h-16 w-16 text-red-400" />
                    </motion.div>
                  ) : (
                    <div className="relative h-16 w-16">
                      <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                      <div
                        className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"
                        style={{ animationDuration: "0.8s" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {uploadProgress.step === "uploading_image" ? (
                          <ImageIcon className="h-6 w-6 text-cyan-400" />
                        ) : (
                          <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" style={{ animationDuration: "1.5s" }} />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {uploadProgress.step === "done"
                      ? "Published!"
                      : uploadProgress.step === "error"
                      ? "Upload Failed"
                      : "Publishing Article"}
                  </h3>
                  <p className="text-sm text-slate-400">{uploadProgress.message}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>
                      {uploadProgress.step === "uploading_image"
                        ? "Uploading image..."
                        : uploadProgress.step === "saving_article"
                        ? "Saving to database..."
                        : uploadProgress.step === "done"
                        ? "Complete"
                        : uploadProgress.step === "error"
                        ? "Error"
                        : "Preparing..."}
                    </span>
                    <span>{uploadProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        uploadProgress.step === "error"
                          ? "bg-red-500"
                          : uploadProgress.step === "done"
                          ? "bg-emerald-400"
                          : "bg-gradient-to-r from-cyan-400 to-blue-500"
                      }`}
                      initial={{ width: "0%" }}
                      animate={{ width: `${uploadProgress.percent}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="flex justify-between mt-4">
                    {[
                      { label: "Image Upload", done: uploadProgress.percent >= 70 },
                      { label: "Saving Article", done: uploadProgress.percent >= 95 },
                      { label: "Done", done: uploadProgress.step === "done" },
                    ].map((s, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className={`h-2 w-2 rounded-full transition-colors ${
                            s.done ? "bg-emerald-400" : "bg-white/20"
                          }`}
                        />
                        <span className={`text-[10px] ${s.done ? "text-emerald-400" : "text-slate-500"}`}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error dismiss */}
                {uploadProgress.step === "error" && (
                  <button
                    onClick={() => { setShowProgressModal(false); setUploadProgress({ step: "idle", message: "", percent: 0 }); }}
                    className="rounded-xl bg-white/5 border border-white/10 px-6 py-2.5 text-sm text-slate-300 hover:text-white transition"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm mx-4 rounded-[2rem] border border-red-500/20 bg-[#0f172a] p-8 shadow-2xl text-center"
            >
              <Trash2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Delete Article?</h3>
              <p className="text-sm text-slate-400 mb-6">This action cannot be undone. The article will be permanently removed from Firestore.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteArticle(deleteConfirm)}
                  className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <h1 className="text-3xl font-black tracking-tight text-white">Admin Dashboard</h1>
          <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CREATE ARTICLE TAB */}
        {activeTab === "articles" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-[#0f172a] p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Publish New Article</h2>
            <form onSubmit={handleArticleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  <input type="text" id="title" required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500" placeholder="Article Title" />
                </div>
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-slate-300 mb-2">Slug (URL friendly)</label>
                  <input type="text" id="slug" required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500" placeholder="e.g., how-chatgpt-works" />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select id="category" required className="w-full rounded-xl border border-white/10 bg-[#0a0f1e] px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition">
                    <option value="">Select a category</option>
                    {categories.map((c) => (<option key={c.id} value={c.label}>{c.label}</option>))}
                  </select>
                </div>
                <div>
                  <label htmlFor="meta" className="block text-sm font-medium text-slate-300 mb-2">Meta (Read Time)</label>
                  <input type="text" id="meta" required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500" placeholder="e.g., 8 min read" />
                </div>
              </div>

              {/* Image upload with preview */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-slate-300 mb-2">Featured Image</label>
                <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                        <span className="text-xs text-white/70 bg-black/50 rounded-lg px-2 py-1">{imageFile?.name}</span>
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="ml-auto text-red-400 hover:text-red-300 bg-black/50 rounded-lg px-2 py-1 text-xs transition">
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="image" className="flex flex-col items-center justify-center h-32 cursor-pointer gap-2 text-slate-500 hover:text-slate-400 transition">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm">Click to upload image</span>
                      <span className="text-xs text-slate-600">PNG, JPG, GIF up to 20MB</span>
                    </label>
                  )}
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-slate-300 mb-2">Excerpt</label>
                <textarea id="excerpt" required rows={2} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500 resize-none" placeholder="A short summary of the article..."></textarea>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">Content (HTML allowed)</label>
                <textarea id="content" required rows={10} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500 resize-none font-mono text-sm" placeholder="<p>Write your article content here...</p>"></textarea>
              </div>

              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-8 py-4 font-semibold text-white shadow-lg transition hover:opacity-90">
                Publish Article <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* MANAGE ARTICLES TAB */}
        {activeTab === "manage" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Manage Articles</h2>
              <button onClick={fetchAllArticles} disabled={loadingArticles} className="flex items-center gap-2 px-3 py-2 text-sm text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 rounded-lg transition-colors disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loadingArticles ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>

            {loadingArticles ? (
              <div className="flex justify-center items-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400"></div>
              </div>
            ) : allArticles.length > 0 ? (
              <div className="grid gap-4">
                {allArticles.map((article) => (
                  <div key={article.id} className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-lg">
                    {article.thumbImageUrl && (
                      <img src={article.thumbImageUrl} alt={article.title} className="h-16 w-16 rounded-xl object-cover flex-shrink-0 border border-white/10" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-white truncate">{article.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-cyan-400 bg-cyan-400/10 rounded-full px-2 py-0.5">{article.category || "—"}</span>
                            <span className="text-xs text-slate-500">{article.meta || "—"}</span>
                            {article.slug && <span className="text-xs text-slate-600 font-mono truncate">/{article.slug}</span>}
                          </div>
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{article.excerpt}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a href={`/articles/${article.slug || article.id}`} target="_blank" rel="noreferrer" className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition">
                            View
                          </a>
                          <button
                            onClick={() => {
                              setEditingArticle(article);
                              setEditImagePreview(article.thumbImageUrl || null);
                              setEditImageFile(null);
                            }}
                            className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(article.id)} className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition flex items-center gap-1">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-[2rem] border border-white/10 bg-white/5">
                <p className="text-slate-400">No articles found. Create one first!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-[#0f172a] p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Manage Categories</h2>
            <form onSubmit={handleCategorySubmit} className="space-y-6 mb-8 border-b border-white/10 pb-8">
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-slate-300 mb-2">Category Name</label>
                <div className="flex gap-4">
                  <input type="text" id="label" required className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500" placeholder="e.g., Web Development" />
                  <button type="submit" disabled={status === "saving"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500/20 px-6 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-500/30 disabled:opacity-50">
                    {status === "saving" ? "Saving..." : "Add Category"}
                  </button>
                </div>
              </div>
            </form>
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Existing Categories ({categories.length})</h3>
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {categories.map((c) => (
                    <span key={c.id} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{c.label}</span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No categories yet.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Contact Form Messages</h2>
              <button onClick={fetchMessages} disabled={loadingMessages} className="flex items-center gap-2 px-3 py-2 text-sm text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 rounded-lg transition-colors disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${loadingMessages ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>
            {loadingMessages ? (
              <div className="flex justify-center items-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400"></div>
              </div>
            ) : messages.length > 0 ? (
              <div className="grid gap-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{msg.subject}</h3>
                        <p className="text-sm text-cyan-400">{msg.name} &lt;{msg.email}&gt;</p>
                      </div>
                      {msg.timestamp && (
                        <span className="text-xs text-slate-500">{new Date(msg.timestamp.seconds * 1000).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-slate-300 whitespace-pre-wrap text-sm">{msg.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-[2rem] border border-white/10 bg-white/5">
                <p className="text-slate-400">No messages found.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* EDIT ARTICLE MODAL */}
      <AnimatePresence>
        {editingArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 bg-[#0b1120] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#0b1120]/90 backdrop-blur-md rounded-t-[2rem]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-400/10 flex items-center justify-center">
                    <Pencil className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Edit Article</h2>
                    <p className="text-xs text-slate-500 truncate max-w-[260px]">{editingArticle.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditingArticle(null); setEditImageFile(null); setEditImagePreview(null); }}
                  className="rounded-full h-9 w-9 flex items-center justify-center border border-white/10 bg-white/5 text-slate-400 hover:text-white transition"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleEditSave} className="p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input
                      name="title"
                      required
                      defaultValue={editingArticle.title}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-amber-400/50 transition placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Slug</label>
                    <input
                      name="slug"
                      required
                      defaultValue={editingArticle.slug}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-amber-400/50 transition placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      name="category"
                      required
                      defaultValue={editingArticle.category}
                      className="w-full rounded-xl border border-white/10 bg-[#0a0f1e] px-4 py-3 text-white outline-none focus:border-amber-400/50 transition"
                    >
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.label}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Meta (Read Time)</label>
                    <input
                      name="meta"
                      required
                      defaultValue={editingArticle.meta}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-amber-400/50 transition placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Image section */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Featured Image</label>
                  <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                    {editImagePreview ? (
                      <div className="relative">
                        <img src={editImagePreview} alt="Preview" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-end p-4">
                          <span className="text-xs text-white/70 bg-black/50 rounded-lg px-2 py-1">
                            {editImageFile ? editImageFile.name : "Current image"}
                          </span>
                          <label htmlFor="editImage" className="ml-auto text-amber-400 hover:text-amber-300 bg-black/50 rounded-lg px-3 py-1 text-xs transition cursor-pointer">
                            Replace
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="editImage" className="flex flex-col items-center justify-center h-28 cursor-pointer gap-2 text-slate-500 hover:text-slate-400 transition">
                        <ImageIcon className="h-7 w-7" />
                        <span className="text-sm">Click to upload a new image</span>
                      </label>
                    )}
                    <input
                      type="file"
                      id="editImage"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEditImageFile(file);
                        if (file) setEditImagePreview(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                  {editingArticle.thumbImageUrl && !editImageFile && (
                    <p className="mt-1.5 text-xs text-slate-500">Current thumbnail will be kept unless you upload a new image.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Excerpt</label>
                  <textarea
                    name="excerpt"
                    required
                    rows={2}
                    defaultValue={editingArticle.excerpt}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-amber-400/50 transition placeholder:text-slate-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content (HTML allowed)</label>
                  <textarea
                    name="content"
                    required
                    rows={12}
                    defaultValue={editingArticle.content}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-amber-400/50 transition placeholder:text-slate-500 resize-none font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEditingArticle(null); setEditImageFile(null); setEditImagePreview(null); }}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-slate-300 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
                  >
                    {editSaving ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Save Changes</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>

  );
}
