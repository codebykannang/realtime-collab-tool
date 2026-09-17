import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchBoards, createBoard } from "../features/boards/boardSlice";

const CARD_COLORS = ["#4F46E5", "#FF6B57", "#14B8A6", "#F5A623", "#8B5CF6", "#111111"];

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards } = useSelector((s) => s.board);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const result = await dispatch(createBoard(title.trim()));
    setTitle("");
    setCreating(false);
    if (createBoard.fulfilled.match(result)) {
      navigate(`/boards/${result.payload._id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">Your Boards</h1>
          <p className="text-ink-600 text-sm mt-1">Live collaborative project boards, chat & whiteboards</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-lg bg-ink-900 text-white hover:bg-indigo-500 font-medium text-sm transition-colors"
        >
          + New Board
        </button>
      </div>

      {creating && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={submit}
          className="mb-8 flex gap-2"
        >
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Board title..."
            className="flex-1 px-3 py-2 rounded-lg bg-white border border-paper-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-ink-900 text-white hover:bg-indigo-500 text-sm font-medium transition-colors">
            Create
          </button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((b, i) => (
          <motion.div
            key={b._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/boards/${b._id}`)}
            className="cursor-pointer rounded-xl h-32 p-4 flex flex-col justify-between border border-ink-900/10 hover:-translate-y-0.5 transition-transform card-shadow"
            style={{ background: b.background || CARD_COLORS[i % CARD_COLORS.length] }}
          >
            <h3 className="font-semibold text-white font-display">{b.title}</h3>
            <p className="text-xs text-white/75">{b.members?.length || 1} member(s)</p>
          </motion.div>
        ))}
        {boards.length === 0 && !creating && (
          <div className="col-span-full text-center py-16 text-ink-400 text-sm bg-white/60 rounded-xl border border-dashed border-paper-300">
            No boards yet — create your first one to start collaborating live.
          </div>
        )}
      </div>
    </div>
  );
}
