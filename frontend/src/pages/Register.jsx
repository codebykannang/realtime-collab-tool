import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { register } from "../features/auth/authSlice";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  const submit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register({ name, email, password }));
    if (register.fulfilled.match(result)) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="w-full max-w-sm bg-white border border-paper-300 rounded-2xl p-8 panel-shadow"
      >
        <Link to="/" className="inline-flex w-10 h-10 rounded-lg bg-ink-900 items-center justify-center font-bold text-white font-display mb-5">
          F
        </Link>
        <h1 className="text-2xl font-bold mb-1 font-display">Create your account</h1>
        <p className="text-ink-600 text-sm mb-6">Start collaborating in real time</p>

        <label className="text-sm text-ink-700 font-medium">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full mt-1 mb-4 px-3 py-2 rounded-lg bg-paper-100 border border-paper-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <label className="text-sm text-ink-700 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mt-1 mb-4 px-3 py-2 rounded-lg bg-paper-100 border border-paper-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <label className="text-sm text-ink-700 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full mt-1 mb-6 px-3 py-2 rounded-lg bg-paper-100 border border-paper-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        {error && <p className="text-coral-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-2.5 rounded-lg bg-ink-900 text-white hover:bg-indigo-500 transition-colors font-medium disabled:opacity-50"
        >
          {status === "loading" ? "Creating..." : "Create Account"}
        </button>

        <p className="text-sm text-ink-600 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
