import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "../../services/socket";

export default function ChatPanel({ boardId }) {
  const { chatMessages, typingUsers } = useSelector((s) => s.board);
  const user = useSelector((s) => s.auth.user);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    getSocket()?.emit("chat:message", { boardId, text: text.trim(), mentions: [] });
    setText("");
  };

  const onType = (val) => {
    setText(val);
    getSocket()?.emit("chat:typing", { boardId, name: user?.name });
  };

  const typingNames = Object.values(typingUsers);

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[60vh] bg-base-900 border border-base-700 rounded-xl">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {chatMessages.map((m) => {
            const mine = m.author?.id === user?.id;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                  {!mine && <span className="text-[11px] text-slate-400 mb-0.5 ml-1">{m.author?.name}</span>}
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm ${
                      mine ? "bg-accent-500 text-white rounded-br-sm" : "bg-base-800 text-slate-100 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {chatMessages.length === 0 && (
          <p className="text-center text-slate-500 text-sm mt-10">No messages yet — say hello 👋</p>
        )}
        <div ref={bottomRef} />
      </div>

      {typingNames.length > 0 && (
        <div className="px-4 pb-1 text-xs text-slate-500 italic">{typingNames.join(", ")} typing...</div>
      )}

      <form onSubmit={send} className="p-3 border-t border-base-700 flex gap-2">
        <input
          value={text}
          onChange={(e) => onType(e.target.value)}
          placeholder="Message this board..."
          className="flex-1 px-3 py-2 rounded-lg bg-base-800 border border-base-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button type="submit" className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-400 text-sm font-medium">
          Send
        </button>
      </form>
    </div>
  );
}
