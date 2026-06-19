"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { Menu, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "Article", href: "/articles" },
  { label: "Categories", href: "/#categories" },
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050816]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 relative">
        <a href="/" className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/10 bg-white/80 p-1">
            <Image src="/logo1.png" alt="InfoSetu logo" fill className="object-contain p-1" priority />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Info Setu</div>
            <div className="text-[11px] text-slate-400">Knowledge • Tech • AI</div>
          </div>
        </a>

        {/* Desktop Nav */}
        {!searchOpen ? (
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
        ) : (
          <div className="hidden md:flex flex-1 mx-8 relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full h-10 rounded-full border border-white/20 bg-white/5 pl-4 pr-10 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
            
            {/* Search Suggestions Modal */}
            <AnimatePresence>
              {searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-12 left-0 w-full rounded-2xl border border-white/10 bg-[#11172b] p-4 shadow-2xl"
                >
                  <p className="text-xs font-semibold text-slate-400 mb-2">Suggestions</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        router.push(`/articles?search=${encodeURIComponent(searchQuery)}`);
                        setSearchOpen(false);
                      }}
                      className="w-full text-left rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
                    >
                      <Search className="h-3.5 w-3.5 text-slate-400" />
                      Search for "{searchQuery}"
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="hidden items-center gap-3 md:flex">
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
          <a
            href="/#newsletter"
            className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
          >
            Subscribe
          </a>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2.5 text-white md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-[#050816]/95 px-4 pb-5 md:hidden overflow-hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3 pt-4">
              <form onSubmit={handleSearch} className="relative mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 pl-4 pr-10 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-4 w-4" />
                </button>
              </form>
              
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/#newsletter"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Subscribe
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
