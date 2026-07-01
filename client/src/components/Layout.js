import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun, CheckSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children, darkMode, setDarkMode }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
              <CheckSquare className="h-5 w-5 text-indigo-500" />
              TaskFlow
            </Link>
            <div className="flex items-center gap-2">
              <NavLink to="/" className="rounded px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Dashboard</NavLink>
              <NavLink to="/tasks" className="rounded px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Tasks</NavLink>
              <button onClick={() => setDarkMode((prev) => !prev)} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;