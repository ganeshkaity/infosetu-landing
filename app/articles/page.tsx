"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  meta: string;
  slug: string;
  thumbImageUrl?: string;
  mainImageUrl?: string;
}

function ArticlesList() {
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      setError("");
      try {
        let q = collection(db, "articles"); // Default to 'articles' collection
        
        // Note: Firestore does not support native full-text search.
        // For a real production app, you would use Algolia or Typesense.
        // For this demo, we'll fetch all and filter in client if searching,
        // or just use query for category if only category is provided.
        
        let querySnapshot;
        if (categoryQuery && !searchQuery) {
          const qCategory = query(q, where("category", "==", categoryQuery));
          querySnapshot = await getDocs(qCategory);
        } else {
          querySnapshot = await getDocs(q);
        }

        let fetchedArticles: Article[] = [];
        querySnapshot.forEach((doc) => {
          fetchedArticles.push({ id: doc.id, ...doc.data() } as Article);
        });

        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          fetchedArticles = fetchedArticles.filter(
            (article) =>
              article.title?.toLowerCase().includes(lowerQuery) ||
              article.excerpt?.toLowerCase().includes(lowerQuery) ||
              article.category?.toLowerCase().includes(lowerQuery)
          );
        }

        setArticles(fetchedArticles);
      } catch (err: any) {
        console.error("Error fetching articles:", err);
        setError("Firebase config might be missing or there was an error fetching data.");
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [categoryQuery, searchQuery]);

  return (
    <main className="relative min-h-screen overflow-hidden pt-24 pb-32">
      <div className="absolute inset-0 grid-noise opacity-60 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : categoryQuery
              ? `${categoryQuery} Articles`
              : "All Articles"}
          </h1>
          <p className="mt-4 text-slate-400">
            {searchQuery
              ? `Found ${articles.length} articles matching your search.`
              : categoryQuery
              ? `Explore all our detailed articles on ${categoryQuery}.`
              : "Discover our full collection of articles across all topics."}
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 flex items-start gap-4 mb-8">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-semibold mb-1">Configuration Needed</h3>
              <p className="text-sm text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400"></div>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {articles.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
              >
                <Link href={`/articles/${item.slug || item.id}`} className="block group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f172a]/80 shadow-[0_15px_60px_rgba(0,0,0,0.24)] h-full">
                  <div 
                    className={`h-56 p-5 bg-contain bg-center bg-no-repeat ${item.mainImageUrl ? 'bg-[#0a0f1e]' : 'bg-gradient-to-br from-cyan-500/40 via-sky-500/25 to-indigo-500/20'}`}
                    style={item.mainImageUrl ? { backgroundImage: `url(${item.mainImageUrl})` } : {}}
                  >
                    <div className="flex h-full items-start justify-between">
                      <span className="rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white">
                        {item.category || "Uncategorized"}
                      </span>
                      <div className="rounded-2xl border border-white/20 bg-black/50 backdrop-blur-md px-3 py-2 text-white/90">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <h3 className="text-xl font-bold leading-8 text-white group-hover:text-cyan-300">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-7 text-slate-400 line-clamp-3">{item.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{item.meta || "Read article"}</span>
                      <span className="inline-flex items-center gap-1 text-cyan-300">
                        Read <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          !error && (
            <div className="text-center py-24 rounded-[2rem] border border-white/5 bg-white/5">
              <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
              <p className="text-slate-400">Try adjusting your search or category filter.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center text-slate-400">Loading...</div>}>
      <ArticlesList />
    </Suspense>
  );
}
