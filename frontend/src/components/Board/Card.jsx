import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { getSocket } from "../../services/socket";

export default function CardItem({ card, boardId }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const user = useSelector((s) => s.auth.user);

  const isLockedByOther = card.lockedBy && card.lockedBy !== user?.id;

  const startEdit = () => {
    if (isLockedByOther) return;
    getSocket()?.emit("card:lock", { boardId, cardId: card._id });
    setEditing(true);
  };

  const finishEdit = () => {
    if (title.trim() && title !== card.title) {
      getSocket()?.emit("card:update", { boardId, cardId: card._id, changes: { title: title.trim() } });
    }
    getSocket()?.emit("card:unlock", { boardId, cardId: card._id });
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className={`bg-base-800 border rounded-lg p-2.5 text-sm cursor-grab active:cursor-grabbing card-shadow ${
        isLockedByOther ? "border-amber-500/60" : "border-base-700"
      }`}
      onClick={startEdit}
    >
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={finishEdit}
          onKeyDown={(e) => e.key === "Enter" && finishEdit()}
          className="w-full bg-base-700 rounded px-2 py-1 text-sm focus:outline-none"
        />
      ) : (
        <p className="text-slate-100">{card.title}</p>
      )}

      {isLockedByOther && (
        <p className="text-[10px] text-amber-400 mt-1.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Someone is editing...
        </p>
      )}

      {card.labels?.length > 0 && (
        <div className="flex gap-1 mt-2">
          {card.labels.map((l, i) => (
            <span key={i} className="w-6 h-1.5 rounded-full bg-accent-500" />
          ))}
        </div>
      )}

      {card.comments?.length > 0 && (
        <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
          {card.comments.length}
        </div>
      )}
    </motion.div>
  );
}
