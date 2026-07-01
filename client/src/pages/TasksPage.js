import React, { useEffect, useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const TasksPage = () => {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, completeTask } = useTasks();
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async (formData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData);
      } else {
        await createTask(formData);
      }
      setEditingTask(null);
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      toast.error('Unable to save task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Tasks</h2>
          <p className="text-sm text-slate-500">Manage everything in one place.</p>
        </div>
        <button onClick={() => { setEditingTask(null); setShowForm(true); }} className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700">
          <Plus className="h-5 w-5" /> New Task
        </button>
      </div>

      {showForm && <TaskForm initialValues={editingTask} onSubmit={handleSubmit} onCancel={() => { setEditingTask(null); setShowForm(false); }} />}
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {loading ? <div className="text-sm text-slate-500">Loading tasks...</div> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onEdit={(taskItem) => { setEditingTask(taskItem); setShowForm(true); }} onDelete={async (taskId) => { await deleteTask(taskId); fetchTasks(); }} onComplete={async (taskId) => { await completeTask(taskId); fetchTasks(); }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;