import React, { useEffect, useState } from 'react';

const emptyForm = {
  title: '',
  description: '',
  status: 'Pending',
  priority: 'Moderate',
  dueDate: '',
};

const TaskForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || '',
        description: initialValues.description || '',
        status: initialValues.status || 'Pending',
        priority: initialValues.priority || 'Moderate',
        dueDate: initialValues.dueDate ? initialValues.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <label className="mb-2 block text-sm font-medium">Title</label>
        <input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950">
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950">
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Due Date</label>
        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && <button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium">Cancel</button>}
        <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Task</button>
      </div>
    </form>
  );
};

export default TaskForm;