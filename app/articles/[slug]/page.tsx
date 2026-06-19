"use client";

import { useEffect, useState } from "react";
import { doc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  meta: string;
  slug: string;
  mainImageUrl?: string;
  thumbImageUrl?: string;
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      try {
        // Query by slug, if slug doesn't exist try fetching by document ID
        const q = query(collection(db, "articles"), where("slug", "==", params.slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          setArticle({ id: docData.id, ...docData.data() } as Article);
        } else {
          // Fallback to querying by ID directly if we treat the param as an ID
          // We don't have the full getDoc setup here, so we do another query
          const idQuery = query(collection(db, "articles"));
          const idSnapshot = await getDocs(idQuery);
          const foundDoc = idSnapshot.docs.find(d => d.id === params.slug);
          if (foundDoc) {
             setArticle({ id: foundDoc.id, ...foundDoc.data() } as Article);
          } else {
            setArticle(null);
          }
        }
      } catch (err: any) {
        console.error("Error fetching article:", err);
        setError("Firebase config might be missing or there was an error fetching data.");
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [params.slug]);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-32 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-32 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">Error Loading Article</h3>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!article) {
    return notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden pt-12 pb-32">
      <div className="absolute inset-0 grid-noise opacity-60 pointer-events-none" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-10">
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
              {article.category || "Uncategorized"}
            </span>
            <span className="text-sm text-slate-400">{article.meta || "8 min read"}</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl leading-tight mb-6">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="text-lg leading-relaxed text-slate-300 border-l-4 border-cyan-500/50 pl-4 py-1">
              {article.excerpt}
            </p>
          )}
        </div>

        {article.mainImageUrl ? (
          <div className="w-full rounded-[2rem] overflow-hidden border border-white/10 mb-12 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
            <img
              src={article.mainImageUrl}
              alt={article.title}
              className="w-full h-auto max-h-[520px] object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-[300px] bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-indigo-500/20 rounded-[2rem] border border-white/10 mb-12 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <Sparkles className="h-16 w-16 text-white/20" />
          </div>
        )}

        <article className="prose prose-invert prose-lg max-w-none prose-p:text-slate-300 prose-headings:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p className="text-slate-400 italic">This article has no content yet. Wait for the author to add more details via the CMS.</p>
          )}
        </article>
      </div>
    </main>
  );
}
