
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Atom,
  BookOpenText,
  Code2,
  Cpu,
  Globe,
  Menu,
  Microscope,
  MoonStar,
  Rocket,
  Search,
  Sparkles,
  Youtube,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Animated floating element component
function FloatingElement({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.6, y: [20, -10, 20] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      style={{ x, y }}
      className="absolute pointer-events-none"
    >
      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm shadow-lg shadow-cyan-400/50" />
    </motion.div>
  );
}

// Animated background orbits
function AnimatedOrbit() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 pointer-events-none"
    >
      <div className="absolute inset-0 rounded-full border border-cyan-500/10" style={{ inset: "10%" }} />
    </motion.div>
  );
}

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Article", href: "#featured" },
  { label: "Categories", href: "#categories" },
  { label: "About us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const featuredArticles = [
  {
    tag: "Artificial Intelligence",
    title: "How ChatGPT is changing daily learning",
    excerpt:
      "Understand how modern AI tools can help students learn faster, research smarter, and build better projects.",
    meta: "8 min read",
    accent: "from-cyan-500/40 via-sky-500/25 to-indigo-500/20",
  },
  {
    tag: "Science",
    title: "Quantum computers: new horizons of future technology",
    excerpt:
      "A simple Bengali-first explanation of quantum bits, superposition, and why the future looks weird in a good way.",
    meta: "10 min read",
    accent: "from-violet-500/40 via-fuchsia-500/25 to-purple-500/20",
  },
  {
    tag: "Programming",
    title: "Learn to build modern web apps with Next.js 15",
    excerpt:
      "From page structure to smooth animations — a beginner-friendly roadmap for creating a professional web presence.",
    meta: "12 min read",
    accent: "from-emerald-500/30 via-teal-500/20 to-blue-500/20",
  },
];

const defaultIcons = [Cpu, Code2, Microscope, Globe, Rocket, BookOpenText];

const reasons = [
  { title: "Simple Bengali explanations", text: "Complex ideas are broken down in a clean way so the content feels easy, not intimidating.", icon: BookOpenText },
  { title: "Science-backed content", text: "Articles are structured around clarity, accuracy, and useful references, not fluff.", icon: Microscope },
  { title: "Latest tech updates", text: "Stay on top of AI, coding, and product trends that actually matter to creators and students.", icon: Sparkles },
  { title: "AI and coding tutorials", text: "Step-by-step guides, project ideas, and practical learning paths for real-world building.", icon: Code2 },
];

const stats = [
  { value: "350+", label: "Articles" },
  { value: "120K+", label: "Readers" },
  { value: "50K+", label: "Subscribers" },
];

function useCountUp(endValue: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let current = 0;
    const steps = 28;
    const increment = endValue / steps;
    const timer = window.setInterval(() => {
      current += increment;
      if (current >= endValue) {
        setValue(endValue);
        window.clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, 28);

    return () => window.clearInterval(timer);
  }, [active, endValue]);

  return value;
}

function Stat({ value, label, active }: { value: string; label: string; active: boolean }) {
  const numeric = Number.parseInt(value.replace(/[^\d]/g, ""), 10) || 0;
  const hasPlus = value.includes("+");
  const count = useCountUp(numeric, active);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 shadow-[0_15px_40px_rgba(0,0,0,0.25)] hover:border-white/20 hover:bg-white/8 transition cursor-pointer group"
    >
      <motion.div
        animate={{ scale: active ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 2, repeat: active ? Infinity : 0 }}
        className="text-2xl font-black tracking-tight text-white"
      >
        {count > 0 ? `${count}${hasPlus ? "+" : ""}` : value}
      </motion.div>
      <motion.div
        initial={{ opacity: 0.6 }}
        whileHover={{ opacity: 1 }}
        className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-300 transition"
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [statsActive, setStatsActive] = useState(false);
  const [featuredBlogs, setFeaturedBlogs] = useState<any[]>(featuredArticles);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(collection(db, "articles"), limit(3));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const fetched = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            tag: doc.data().category || "Featured",
            accent: doc.data().accent || "from-cyan-500/40 via-sky-500/25 to-indigo-500/20"
          }));
          setFeaturedBlogs(fetched);
        }
      } catch (err) {
        console.error("Failed to fetch featured articles:", err);
      } finally {
        setLoadingBlogs(false);
      }
    }
    
    async function fetchCategories() {
      try {
        const q = query(collection(db, "categories"));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(fetched);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }

    fetchFeatured();
    fetchCategories();
  }, []);
  useEffect(() => {
    const handler = () => {
      const section = document.getElementById("stats");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      setStatsActive(rect.top < window.innerHeight * 0.8 && rect.bottom > 0);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const topTopics = useMemo(() => ["AI", "Science", "Programming", "Tech Trends", "Coding", "Space"], []);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 grid-noise opacity-60 pointer-events-none" />
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-700/15 blur-3xl pointer-events-none" />
      <div className="absolute right-[-80px] top-[240px] h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Header is now in app/layout.tsx */}
      <section id="home" className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-32 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
              <MoonStar className="h-3.5 w-3.5 text-cyan-400" />
              Premium Tech and Science Blog in Bengali
            </div>

            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Bridging knowledge,
              <br />
              science and
              <span className="block bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                technology
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Science, artificial intelligence, technology, coding, and future innovations
              — all in simple Bangla. Learn, understand, and build your own digital future.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                href="#featured"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/40"
              >
                <motion.span
                  animate={{ x: [0, 2, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Explore the article
                </motion.span>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                href="https://www.youtube.com/channel/UCSyMDJ6PLqClRzTp3KfCi-Q"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-slate-200 transition hover:bg-white/10 hover:border-white/20"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Youtube className="h-4 w-4 text-red-400" />
                </motion.div>
                Subscribe to YouTube
              </motion.a>
            </div>

            <div id="stats" className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Stat value={stat.value} label={stat.label} active={statsActive} />
                </motion.div>
              ))}
            </div>

            <motion.div className="mt-8 flex flex-wrap gap-2">
              {topTopics.map((topic, idx) => (
                <motion.span
                  key={topic}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 cursor-pointer transition hover:border-white/20 hover:bg-white/10"
                >
                  {topic}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto w-full lg:max-w-none hidden md:block"
          >
            <div className="relative w-full flex justify-center">
              <Image src="/hero_image.png" alt="Hero Illustration" width={600} height={450} className="w-full h-auto object-contain" priority />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-300">
              Featured
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Today&apos;s <span className="text-blue-300">Featured Article</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              The most important and popular content selected by the editorial team.
            </p>
          </div>
          <a href="#" className="hidden text-sm text-slate-300 transition hover:text-white sm:inline-flex">
            See all <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {loadingBlogs ? (
            <div className="col-span-3 flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            featuredBlogs.map((item, idx) => (
              <motion.article
                key={item.id || item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f172a]/80 shadow-[0_15px_60px_rgba(0,0,0,0.24)]"
              >
                <div 
                  className={`h-56 p-5 bg-contain bg-center bg-no-repeat ${item.mainImageUrl ? 'bg-[#0a0f1e]' : `bg-gradient-to-br ${item.accent}`}`}
                  style={item.mainImageUrl ? { backgroundImage: `url(${item.mainImageUrl})` } : {}}
                >
                  <div className="flex h-full items-start justify-between">
                    <span className="rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white">
                      {item.tag}
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
                  <p className="text-sm leading-7 text-slate-400">{item.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{item.meta}</span>
                    <a href={`/articles/${item.slug || item.id || "#"}`} className="inline-flex items-center gap-1 text-cyan-300">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
            Categories
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Whatever <span className="text-blue-300">you can learn.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Each category contains carefully crafted, in-depth and detailed content.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((item, idx) => {
            const Icon = defaultIcons[idx % defaultIcons.length];
            return (
              <motion.a
                key={item.label}
                href={`/articles?category=${encodeURIComponent(item.label)}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/7"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-cyan-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-right text-sm text-slate-400">{item.count}</div>
                </div>
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-white">{item.label}</h3>
                  <p className="mt-2 text-sm text-slate-400">{item.label}</p>
                </div>
                <div className="mt-8 inline-flex items-center gap-2 text-sm text-slate-300">
                  Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
            Why InfoSetu?
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Why <span className="text-blue-300">stay</span> with us?
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="rounded-[1.35rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="w-fit rounded-2xl border border-white/10 bg-black/20 p-3 text-violet-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="newsletter" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="glass relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute left-10 bottom-[-80px] h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative text-center">
            <div className="mx-auto w-fit rounded-2xl border border-white/10 bg-white/5 p-3 text-violet-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Be the first to receive new articles.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Once a week — the best curated tech, AI, and science content straight to your inbox.
            </p>

            <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Your email address"
                className="h-12 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 font-semibold text-white transition hover:scale-[1.02]"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-500">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-white/5">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-black/40 p-1">
                <Image src="/logo.png" alt="InfoSetu logo" fill className="object-contain p-1" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Info Setu</div>
                <div className="text-[11px] text-slate-400">Science • Tech • AI</div>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              A premium platform for learning science, technology, AI, and programming in Bengali.
              The goal is to spread knowledge with clarity and style.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Navigation</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              {navLinks.map((item) => (
                <a key={item.label} href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Social</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {[Youtube, Search, Globe, Atom].map((Icon, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300">
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Built with love — by InfoSetu.
            </p>
          </div>
        </div>
        <div className="border-t border-white/5 py-5 text-center text-xs text-slate-500">
          © 2026 InfoSetu. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
