import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
    <div className="text-center">
      <h1 className="text-4xl font-semibold">404</h1>
      <p className="mt-2 text-slate-500">The page you are looking for doesn’t exist.</p>
      <Link to="/" className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white">Go home</Link>
    </div>
  </div>
);

export default NotFoundPage;