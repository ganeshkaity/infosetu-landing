"use client";

import { Mail, MapPin, Send, MessageSquare } from "lucide-react";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    try {
      const target = e.target as typeof e.target & {
        name: { value: string };
        email: { value: string };
        subject: { value: string };
        message: { value: string };
      };

      await addDoc(collection(db, "messages"), {
        name: target.name.value,
        email: target.email.value,
        subject: target.subject.value,
        message: target.message.value,
        timestamp: new Date()
      });

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        (e.target as HTMLFormElement).reset();
      }, 3000);
    } catch (error) {
      console.error("Error adding document: ", error);
      setStatus("idle");
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden pt-24 pb-32">
      <div className="absolute inset-0 grid-noise opacity-60 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300 mb-4">
            Contact Us
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl mb-4">
            Let's Start a Conversation
          </h1>
          <p className="mx-auto max-w-2xl text-slate-400">
            Have a question, feedback, or want to contribute an article? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Email Us</h3>
              <p className="text-sm text-slate-400 mb-3">We'll respond within 24 hours.</p>
              <a href="mailto:hello@infosetu.example" className="text-cyan-400 hover:text-cyan-300 transition font-medium">
                hello@infosetu.example
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Location</h3>
              <p className="text-sm text-slate-400">
                Dhaka, Bangladesh <br/>
                Remote First Team
              </p>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Socials</h3>
              <p className="text-sm text-slate-400 mb-3">Follow us for updates.</p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition">Twitter</a>
                <a href="#" className="text-slate-400 hover:text-white transition">LinkedIn</a>
                <a href="#" className="text-slate-400 hover:text-white transition">YouTube</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-[2rem] border border-white/10 bg-[#0f172a] p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      id="name"
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500" 
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500" 
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500" 
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                  <textarea 
                    id="message"
                    required
                    rows={5}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition placeholder:text-slate-500 resize-none" 
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-4 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-70"
                >
                  {status === "sending" ? (
                    "Sending..."
                  ) : status === "success" ? (
                    "Message Sent!"
                  ) : (
                    <>
                      Send Message <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
