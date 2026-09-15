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
    if (register.fulfilled.match(result)) navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="w-full max-w-sm bg-base-900 border border-base-700 rounded-2xl p-8 card-shadow"
      >
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-slate-400 text-sm mb-6">Start collaborating in real time</p>

        <label className="text-sm text-slate-300">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full mt-1 mb-4 px-3 py-2 rounded-lg bg-base-800 border border-base-600 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />

        <label className="text-sm text-slate-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mt-1 mb-4 px-3 py-2 rounded-lg bg-base-800 border border-base-600 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />

        <label className="text-sm text-slate-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full mt-1 mb-6 px-3 py-2 rounded-lg bg-base-800 border border-base-600 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />

        {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-2.5 rounded-lg bg-accent-500 hover:bg-accent-400 transition-colors font-medium disabled:opacity-50"
        >
          {status === "loading" ? "Creating..." : "Create Account"}
        </button>

        <p className="text-sm text-slate-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-400 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
