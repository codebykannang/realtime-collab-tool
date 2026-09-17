import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const FEATURES = [
  {
    color: "#4F46E5",
    title: "Boards that move with you",
    desc: "Drag cards across lists and watch teammates' changes land instantly — no refresh, no conflicts.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="7" height="16" rx="1.5" />
        <rect x="14" y="4" width="7" height="10" rx="1.5" />
      </svg>
    ),
  },
  {
    color: "#FF6B57",
    title: "Chat in context",
    desc: "Every board has its own thread, so conversation stays next to the work it's about.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
  {
    color: "#14B8A6",
    title: "Shared whiteboard",
    desc: "Sketch flows and ideas together on a live canvas that every viewer sees update stroke by stroke.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
      </svg>
    ),
  },
  {
    color: "#F5A623",
    title: "Presence & notifications",
    desc: "See who's online, who's editing a card right now, and get notified the moment something changes.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
];

const STEPS = [
  { n: "01", title: "Create a board", desc: "Spin up a board for your project in seconds — no setup required." },
  { n: "02", title: "Invite your team", desc: "Share the link and everyone joins the same live workspace." },
  { n: "03", title: "Work in real time", desc: "Move cards, sketch ideas, and chat — all synced the instant it happens." },
];

export default function Landing() {
  return (
    <div className="bg-white">
      {/* ---- Header ---- */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white font-display">
            F
          </div>
          <span className="font-semibold text-lg tracking-tight text-white font-display">FlowBoard</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-ink-900 hover:bg-paper-200 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section
        className="relative overflow-hidden bg-ink-900 text-white"
        style={{
          backgroundImage: "url('/hero-graphic.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-36 pb-28 sm:pt-44 sm:pb-36">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 border border-white/15 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Live for every teammate, every board
            </span>

            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] font-display">
              Work together, live — not eventually.
            </h1>

            <p className="text-white/70 text-base sm:text-lg mt-5 leading-relaxed max-w-md">
              FlowBoard brings boards, chat, and a shared whiteboard into one workspace where every
              change reaches your team the moment it happens.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                to="/register"
                className="px-5 py-3 rounded-lg bg-white text-ink-900 font-medium text-sm hover:bg-paper-200 transition-colors"
              >
                Start for free
              </Link>
              <Link
                to="/login"
                className="px-5 py-3 rounded-lg border border-white/25 text-white font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-20 sm:py-24">
        <div className="max-w-lg mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display">One workspace, built for the moment work happens</h2>
          <p className="text-ink-600 mt-3">Everything below updates live — across every tab, for every person on the board.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-6 rounded-xl border border-paper-300 bg-white card-shadow"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4"
                style={{ background: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold font-display">{f.title}</h3>
              <p className="text-ink-600 text-sm mt-1.5 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="bg-paper-100 border-y border-paper-300">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 sm:py-24">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-12 max-w-lg">
            From empty board to working together in three steps
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <span className="text-sm font-semibold font-display text-indigo-500">{s.n}</span>
                <h3 className="font-semibold mt-2 font-display">{s.title}</h3>
                <p className="text-ink-600 text-sm mt-1.5 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="bg-ink-900 text-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display">Ready to build together?</h2>
            <p className="text-white/60 mt-2">Create your first board in under a minute.</p>
          </div>
          <Link
            to="/register"
            className="px-5 py-3 rounded-lg bg-white text-ink-900 font-medium text-sm hover:bg-paper-200 transition-colors whitespace-nowrap"
          >
            Start for free
          </Link>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="px-6 sm:px-10 py-6 flex items-center justify-between text-xs text-ink-400">
        <span>© {new Date().getFullYear()} FlowBoard</span>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-ink-900 flex items-center justify-center font-bold text-white text-[10px] font-display">
            F
          </div>
        </div>
      </footer>
    </div>
  );
}
