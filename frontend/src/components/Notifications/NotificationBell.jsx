import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAllRead } from "../../features/notifications/notificationSlice";

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) dispatch(markAllRead());
  };

  return (
    <div className="relative">
      <button onClick={toggle} className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-coral-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white border border-paper-300 rounded-xl panel-shadow overflow-hidden z-50"
          >
            <div className="px-4 py-3 bg-ink-900 text-white font-medium text-sm">Notifications</div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 && (
                <div className="px-4 py-6 text-sm text-ink-400 text-center">You're all caught up.</div>
              )}
              {items.map((n) => (
                <div key={n._id} className="px-4 py-3 border-b border-paper-200 hover:bg-paper-100 text-sm">
                  <p className="text-ink-900">{n.message}</p>
                  <p className="text-xs text-ink-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
