import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      if (response.resetURL) {
        toast.info(`Reset link: ${response.resetURL}`);
      } else {
        toast.success('If an account exists, a reset link has been sent.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Forgot password?</h2>
        <p className="mt-2 text-sm text-slate-500">Enter your email and we’ll help you reset it.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            required
          />
          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-70">
            {loading ? 'Please wait...' : 'Send reset link'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-indigo-500">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
