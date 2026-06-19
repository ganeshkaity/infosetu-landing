import { Sparkles, Users, Award, BookOpenText } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden pt-24 pb-32">
      <div className="absolute inset-0 grid-noise opacity-60 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-20">
          <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300 mb-4">
            Our Mission
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6">
            Empowering minds through <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">accessible knowledge</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400 leading-relaxed">
            We believe that cutting-edge technology, artificial intelligence, and scientific discoveries should be available to everyone in their native language.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative aspect-square md:aspect-auto md:h-[500px] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] bg-white/5 flex items-center justify-center p-8">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
             <div className="relative h-full w-full">
               <Image src="/hero_image.png" alt="Team" fill className="object-cover rounded-2xl opacity-80" />
             </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Why we started InfoSetu</h2>
            <p className="text-slate-300 leading-relaxed">
              The digital divide isn't just about access to the internet; it's about access to information in a language you deeply understand. We noticed a massive gap in high-quality Bengali content regarding modern tech trends, programming, and AI.
            </p>
            <p className="text-slate-300 leading-relaxed">
              InfoSetu was born out of a desire to bridge this gap. We curate, research, and write comprehensive guides, breaking down complex topics into simple, digestible pieces.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <Users className="h-8 w-8 text-cyan-400 mb-3" />
                <h3 className="font-bold text-white mb-1">Community First</h3>
                <p className="text-sm text-slate-400">Built for our readers, shaped by their feedback.</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <BookOpenText className="h-8 w-8 text-violet-400 mb-3" />
                <h3 className="font-bold text-white mb-1">Quality Content</h3>
                <p className="text-sm text-slate-400">Deeply researched and fact-checked articles.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <Award className="h-32 w-32 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Join our journey</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter or reach out to us if you'd like to contribute. Let's build a stronger knowledge base together.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02]"
          >
            Get in touch
            <Sparkles className="h-4 w-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
