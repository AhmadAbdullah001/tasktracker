import React from 'react';
import { CalendarDays, Flag, CheckCircle2, Trash2, PencilLine } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onComplete }) => {
  const statusColors = {
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'In Progress': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  };

  const priorityColors = {
    Low: 'text-emerald-600',
    Moderate: 'text-amber-600',
    High: 'text-orange-600',
    Urgent: 'text-rose-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{task.description || 'No description provided.'}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[task.status]}`}>{task.status}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {new Date(task.dueDate).toLocaleDateString()}</span>
        <span className={`flex items-center gap-1 font-medium ${priorityColors[task.priority]}`}><Flag className="h-4 w-4" /> {task.priority}</span>
      </div>
      <div className="mt-5 flex items-center gap-2">
        {task.status !== 'Completed' && (
          <button onClick={() => onComplete(task._id)} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Complete
          </button>
        )}
        <button onClick={() => onEdit(task)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          <PencilLine className="h-4 w-4" /> Edit
        </button>
        <button onClick={() => onDelete(task._id)} className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40">
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;