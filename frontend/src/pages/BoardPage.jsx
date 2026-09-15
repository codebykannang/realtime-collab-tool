import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getSocket } from "../services/socket";
import {
  fetchBoardDetail,
  clearActiveBoard,
  presenceUpdated,
  cursorMoved,
  listCreatedRemote,
  cardCreatedRemote,
  cardMovedRemote,
  cardUpdatedRemote,
  cardLockedRemote,
  cardUnlockedRemote,
  chatMessageReceived,
  typingReceived,
  typingCleared,
} from "../features/boards/boardSlice";
import BoardView from "../components/Board/Board";
import Whiteboard from "../components/Whiteboard/Whiteboard";
import ChatPanel from "../components/Chat/ChatPanel";

export default function BoardPage() {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const { activeBoard, presence, cursors } = useSelector((s) => s.board);
  const user = useSelector((s) => s.auth.user);
  const [tab, setTab] = useState("board"); // board | whiteboard | chat

  useEffect(() => {
    dispatch(fetchBoardDetail(boardId));
    const socket = getSocket();
    if (!socket) return;

    socket.emit("board:join", { boardId });
    socket.emit("chat:join", { boardId });

    socket.on("presence:update", (users) => dispatch(presenceUpdated(users)));
    socket.on("board:cursor", (payload) => dispatch(cursorMoved(payload)));
    socket.on("list:created", (list) => dispatch(listCreatedRemote(list)));
    socket.on("card:created", (card) => dispatch(cardCreatedRemote(card)));
    socket.on("card:moved", (payload) => dispatch(cardMovedRemote(payload)));
    socket.on("card:updated", (payload) => dispatch(cardUpdatedRemote(payload)));
    socket.on("card:locked", (payload) => dispatch(cardLockedRemote(payload)));
    socket.on("card:unlocked", (payload) => dispatch(cardUnlockedRemote(payload)));
    socket.on("chat:message", (msg) => dispatch(chatMessageReceived(msg)));
    socket.on("chat:typing", (payload) => {
      dispatch(typingReceived(payload));
      setTimeout(() => dispatch(typingCleared(payload)), 2500);
    });

    return () => {
      socket.emit("board:leave", { boardId });
      [
        "presence:update",
        "board:cursor",
        "list:created",
        "card:created",
        "card:moved",
        "card:updated",
        "card:locked",
        "card:unlocked",
        "chat:message",
        "chat:typing",
      ].forEach((ev) => socket.off(ev));
      dispatch(clearActiveBoard());
    };
  }, [boardId, dispatch]);

  const handleMouseMove = useCallback(
    (e) => {
      const socket = getSocket();
      if (!socket || !user) return;
      socket.emit("board:cursor", {
        boardId,
        x: e.clientX,
        y: e.clientY,
        name: user.name,
        color: user.avatarColor,
      });
    },
    [boardId, user]
  );

  if (!activeBoard) {
    return <div className="p-10 text-slate-400 text-sm">Loading board...</div>;
  }

  return (
    <div onMouseMove={handleMouseMove} className="relative min-h-[calc(100vh-56px)]">
      {/* Live remote cursors */}
      {Object.entries(cursors).map(([uid, c]) =>
        uid === user?.id ? null : (
          <motion.div
            key={uid}
            className="pointer-events-none fixed z-50 flex items-center gap-1"
            animate={{ left: c.x, top: c.y }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill={c.color}>
              <path d="M0 0l6 14 2-6 6-2z" />
            </svg>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-base-800 border border-base-700">{c.name}</span>
          </motion.div>
        )
      )}

      <div className="px-6 pt-4 flex items-center justify-between border-b border-base-800">
        <div>
          <h1 className="text-xl font-bold">{activeBoard.title}</h1>
          <div className="flex items-center -space-x-2 mt-1">
            {presence.map((p) => (
              <div
                key={p.socketId}
                title={p.name}
                className="w-6 h-6 rounded-full border-2 border-base-950 flex items-center justify-center text-[10px] font-semibold"
                style={{ background: p.color }}
              >
                {p.name?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1 bg-base-900 rounded-lg p-1 border border-base-700">
          {["board", "whiteboard", "chat"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm capitalize transition-colors ${
                tab === t ? "bg-accent-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {tab === "board" && <BoardView boardId={boardId} />}
        {tab === "whiteboard" && <Whiteboard boardId={boardId} />}
        {tab === "chat" && <ChatPanel boardId={boardId} />}
      </div>
    </div>
  );
}
