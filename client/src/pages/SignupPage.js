import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [step, setStep] = useState('credentials');
  const { signup, generateOtp, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submitLabel = loading ? 'Please wait...' : step === 'credentials' ? 'Send OTP' : 'Verify & Sign up';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (step === 'credentials') {
        const response = await generateOtp({ email: form.email, purpose: 'signup' });
        setStep('otp');
        if (response.otp) {
          toast.info(`OTP: ${response.otp}`);
        } else {
          toast.info('OTP sent to your email');
        }
      } else {
        await verifyOtp({ email: form.email, otp: form.otp });
        await signup({ ...form, otp: form.otp });
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const response = await resendOtp({ email: form.email, purpose: 'signup' });
      if (response.otp) {
        toast.info(`Resent OTP: ${response.otp}`);
      } else {
        toast.info('A new OTP has been sent.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <p className="mt-2 text-sm text-slate-500">Start organizing your work today.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {step === 'credentials' && (
            <>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" required />
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" required />
            </>
          )}
          {step === 'otp' && (
            <>
              <input name="otp" value={form.otp} onChange={handleChange} placeholder="Enter OTP" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" required />
              <button type="button" onClick={handleResendOtp} disabled={resending || loading} className="text-sm font-semibold text-indigo-500 disabled:opacity-60">
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </>
          )}
          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-70">
            {submitLabel}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-indigo-500">Login</Link></p>
      </div>
    </div>
  );
};

export default SignupPage;
