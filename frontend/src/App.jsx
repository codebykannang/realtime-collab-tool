import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocket } from "./services/socket";
import { notificationReceived } from "./features/notifications/notificationSlice";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BoardPage from "./pages/BoardPage";
import Navbar from "./components/Layout/Navbar";

function ProtectedRoute({ children }) {
  const token = useSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicHome() {
  const token = useSelector((s) => s.auth.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    if (token) {
      const socket = connectSocket(token);
      socket.on("notification:new", (notif) => {
        dispatch(notificationReceived(notif));
      });
    } else {
      disconnectSocket();
    }
    return () => {
      const socket = getSocket();
      socket?.off("notification:new");
    };
  }, [token, dispatch]);

  return (
    <div className="min-h-screen text-ink-900">
      {token && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/boards/:boardId"
          element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
