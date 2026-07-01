import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { taskApi } from '../services/api';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await taskApi.getAll();
      setTasks(response.data.data || []);
    } catch (err) {
      setError('Unable to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await taskApi.getDashboard();
      setDashboard(response.data.data || null);
    } catch (err) {
      setError('Unable to load dashboard');
    }
  }, []);

  const createTask = useCallback(async (payload) => {
    try {
      const response = await taskApi.create(payload);
      setTasks((prev) => [response.data.data, ...prev]);
      toast.success('Task created');
      return response.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create task');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (taskId, payload) => {
    try {
      const response = await taskApi.update(taskId, payload);
      setTasks((prev) => prev.map((task) => (task._id === taskId ? response.data.data : task)));
      toast.success('Task updated');
      return response.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update task');
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await taskApi.delete(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete task');
      throw err;
    }
  }, []);

  const completeTask = useCallback(async (taskId) => {
    try {
      const response = await taskApi.complete(taskId);
      setTasks((prev) => prev.map((task) => (task._id === taskId ? response.data.data : task)));
      toast.success('Task completed');
      return response.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to complete task');
      throw err;
    }
  }, []);

  const searchTasks = useCallback(async (query) => {
    setLoading(true);
    try {
      const response = await taskApi.search(query);
      setTasks(response.data.data || []);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterTasks = useCallback(async (status) => {
    setLoading(true);
    try {
      const response = status ? await taskApi.getByStatus(status) : await taskApi.getAll();
      setTasks(response.data.data || []);
    } catch (err) {
      setError('Failed to filter tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const sortTasks = useCallback(async (sortBy) => {
    setLoading(true);
    try {
      const response = await taskApi.sort(sortBy);
      setTasks(response.data.data || []);
    } catch (err) {
      setError('Failed to sort tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    tasks,
    dashboard,
    loading,
    error,
    fetchTasks,
    fetchDashboard,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    searchTasks,
    filterTasks,
    sortTasks,
    setTasks,
  }), [
    tasks,
    dashboard,
    loading,
    error,
    fetchTasks,
    fetchDashboard,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    searchTasks,
    filterTasks,
    sortTasks,
  ]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => useContext(TaskContext);
