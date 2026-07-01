import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../services/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Reset password</h2>
        <p className="mt-2 text-sm text-slate-500">Set a new password for your account.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" required />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" required />
          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-70">
            {loading ? 'Please wait...' : 'Reset password'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-indigo-500">Back to login</Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">Token: {token}</p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
