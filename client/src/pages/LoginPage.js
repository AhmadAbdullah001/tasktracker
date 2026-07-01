import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage your tasks.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" required />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" required />
          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-70">
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">No account? <Link to="/signup" className="font-semibold text-indigo-500">Sign up</Link></p>
        <p className="mt-2 text-center text-sm text-slate-500"><Link to="/forgot-password" className="font-semibold text-indigo-500">Forgot password?</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;