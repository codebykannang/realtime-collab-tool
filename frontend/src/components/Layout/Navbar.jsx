import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import NotificationBell from "../Notifications/NotificationBell";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-base-900 border-b border-base-700 sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center font-bold text-white">
          F
        </div>
        <span className="font-semibold text-lg tracking-tight">FlowBoard</span>
      </Link>

      <div className="flex items-center gap-4">
        <NotificationBell />
        {user && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: user.avatarColor }}
            >
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-slate-300 hidden sm:inline">{user.name}</span>
          </div>
        )}
        <button
          onClick={() => dispatch(logout())}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
