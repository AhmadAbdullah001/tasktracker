import React, { useEffect, useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const { tasks, dashboard, loading, error, fetchTasks, fetchDashboard, createTask, updateTask, deleteTask, completeTask, searchTasks, filterTasks, sortTasks } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchTasks();
    fetchDashboard();
  }, [fetchDashboard, fetchTasks]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData);
      } else {
        await createTask(formData);
      }
      setEditingTask(null);
      setShowForm(false);
      fetchTasks();
      fetchDashboard();
    } catch (error) {
      toast.error('Unable to save task');
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      await searchTasks(value);
    } else {
      fetchTasks();
    }
  };

  const handleFilter = async (value) => {
    setStatusFilter(value);
    await filterTasks(value);
  };

  const handleSort = async (value) => {
    setSortBy(value);
    await sortTasks(value);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-500 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-indigo-100">Overview</p>
            <h1 className="mt-2 text-3xl font-semibold">Your workspace is ready</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">Track priorities, monitor progress, and finish work faster from one dashboard.</p>
          </div>
          <button onClick={() => { setEditingTask(null); setShowForm(true); }} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-semibold text-indigo-700">
            <Plus className="h-5 w-5" /> New Task
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-semibold">{dashboard?.totalTasks ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{dashboard?.completedTasks ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{dashboard?.pendingTasks ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="mt-2 text-3xl font-semibold text-sky-600">{dashboard?.inProgressTasks ?? 0}</p>
        </div>
      </div>

      {showForm && (
        <TaskForm initialValues={editingTask} onSubmit={handleCreateOrUpdate} onCancel={() => { setShowForm(false); setEditingTask(null); }} />
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700">
          <Search className="h-4 w-4 text-slate-500" />
          <input value={query} onChange={handleSearch} placeholder="Search tasks" className="w-full bg-transparent outline-none" />
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700">
            <Filter className="h-4 w-4" />
            <select value={statusFilter} onChange={(e) => handleFilter(e.target.value)} className="bg-transparent outline-none">
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700">
            <ArrowUpDown className="h-4 w-4" />
            <select value={sortBy} onChange={(e) => handleSort(e.target.value)} className="bg-transparent outline-none">
              <option value="date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {loading ? <div className="text-sm text-slate-500">Loading tasks...</div> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {tasks.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">No tasks yet. Create your first task to get started.</div> : tasks.map((task) => (
            <TaskCard key={task._id} task={task} onEdit={(taskItem) => { setEditingTask(taskItem); setShowForm(true); }} onDelete={async (taskId) => { await deleteTask(taskId); fetchTasks(); fetchDashboard(); }} onComplete={async (taskId) => { await completeTask(taskId); fetchTasks(); fetchDashboard(); }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;