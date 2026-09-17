import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getSocket } from "../../services/socket";
import { cardMovedLocal } from "../../features/boards/boardSlice";
import CardItem from "./Card";

const LIST_ACCENTS = ["#4F46E5", "#FF6B57", "#14B8A6", "#F5A623", "#8B5CF6"];

export default function BoardView({ boardId }) {
  const dispatch = useDispatch();
  const { lists, cards } = useSelector((s) => s.board);
  const [newListTitle, setNewListTitle] = useState("");
  const [addingList, setAddingList] = useState(false);
  const [dragCardId, setDragCardId] = useState(null);

  const sortedLists = [...lists].sort((a, b) => a.position - b.position);

  const cardsForList = (listId) =>
    cards.filter((c) => c.list === listId).sort((a, b) => a.position - b.position);

  const submitList = (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    getSocket()?.emit("list:create", { boardId, title: newListTitle.trim() });
    setNewListTitle("");
    setAddingList(false);
  };

  const addCard = (listId, title) => {
    getSocket()?.emit("card:create", { boardId, listId, title });
  };

  const onDrop = (toListId, toPosition) => {
    if (!dragCardId) return;
    // Optimistic local update, then tell the server + everyone else
    dispatch(cardMovedLocal({ cardId: dragCardId, toListId, toPosition }));
    getSocket()?.emit("card:move", { boardId, cardId: dragCardId, toListId, toPosition });
    setDragCardId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start">
      {sortedLists.map((list, li) => {
        const listCards = cardsForList(list._id);
        const accent = LIST_ACCENTS[li % LIST_ACCENTS.length];
        return (
          <div
            key={list._id}
            className="w-72 flex-shrink-0 bg-white border border-paper-300 rounded-xl overflow-hidden card-shadow"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(list._id, listCards.length)}
          >
            <div className="flex items-center justify-between px-3 py-2.5 bg-ink-900">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
                <h3 className="font-semibold text-sm text-white">{list.title}</h3>
              </div>
              <span className="text-xs text-white/50 bg-white/10 px-1.5 py-0.5 rounded-full">{listCards.length}</span>
            </div>

            <div className="p-3 flex flex-col gap-2 min-h-[20px]">
              {listCards.map((card, idx) => (
                <div
                  key={card._id}
                  draggable
                  onDragStart={() => setDragCardId(card._id)}
                  onDragOver={(e) => e.stopPropagation()}
                  onDrop={(e) => {
                    e.stopPropagation();
                    onDrop(list._id, idx);
                  }}
                >
                  <CardItem card={card} boardId={boardId} accent={accent} />
                </div>
              ))}

              <AddCardInline onAdd={(title) => addCard(list._id, title)} />
            </div>
          </div>
        );
      })}

      <div className="w-72 flex-shrink-0">
        {addingList ? (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submitList} className="bg-white border border-paper-300 rounded-xl p-3 card-shadow">
            <input
              autoFocus
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="List title..."
              className="w-full px-2 py-1.5 rounded-md bg-paper-100 border border-paper-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            />
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-1 rounded-md bg-ink-900 text-white hover:bg-indigo-500 text-xs font-medium transition-colors">
                Add
              </button>
              <button type="button" onClick={() => setAddingList(false)} className="px-3 py-1 rounded-md text-xs text-ink-600">
                Cancel
              </button>
            </div>
          </motion.form>
        ) : (
          <button
            onClick={() => setAddingList(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-paper-300 bg-white/60 text-ink-600 hover:text-ink-900 hover:border-indigo-500 text-sm transition-colors"
          >
            + Add another list
          </button>
        )}
      </div>
    </div>
  );
}

function AddCardInline({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
    setOpen(false);
  };

  return open ? (
    <form onSubmit={submit} className="mt-1">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title..."
        className="w-full px-2 py-1.5 rounded-md bg-paper-100 border border-paper-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
      />
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-1 rounded-md bg-ink-900 text-white hover:bg-indigo-500 text-xs font-medium transition-colors">
          Add card
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 py-1 rounded-md text-xs text-ink-600">
          Cancel
        </button>
      </div>
    </form>
  ) : (
    <button onClick={() => setOpen(true)} className="mt-1 text-xs text-ink-600 hover:text-indigo-500 transition-colors">
      + Add a card
    </button>
  );
}
