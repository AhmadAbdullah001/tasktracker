const express = require('express');
const router = express.Router();
const Task = require('../Database/Schema/TaskSchema');
const fetchUser = require('../Middleware/fetchUser');

const TASK_STATUS = ['Pending', 'In Progress', 'Completed'];
const TASK_PRIORITY = ['Low', 'Moderate', 'High', 'Urgent'];

router.post('/', fetchUser, async (req, res, next) => {
  try {
    const { title, description = '', status, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!dueDate) {
      return res.status(400).json({ message: 'Due date is required' });
    }
    if (status && !TASK_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Status is invalid' });
    }
    if (priority && !TASK_PRIORITY.includes(priority)) {
      return res.status(400).json({ message: 'Priority is invalid' });
    }

    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      description: description.trim(),
      status: status || 'Pending',
      priority: priority || 'Moderate',
      dueDate,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

router.get('/', fetchUser, async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ dueDate: 1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/status/:status', fetchUser, async (req, res, next) => {
  try {
    const { status } = req.params;

    if (!TASK_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Status is invalid' });
    }

    const tasks = await Task.find({ user: req.user.id, status }).sort({ dueDate: 1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/search', fetchUser, async (req, res, next) => {
  try {
    const { query = '' } = req.query;

    const tasks = await Task.find({
      user: req.user.id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    }).sort({ dueDate: 1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/sort', fetchUser, async (req, res, next) => {
  try {
    const { sortBy = 'date' } = req.query;
    const sortCriteria = sortBy === 'priority' ? { priority: 1, dueDate: 1 } : { dueDate: 1 };

    const tasks = await Task.find({ user: req.user.id }).sort(sortCriteria);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', fetchUser, async (req, res, next) => {
  try {
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      Task.countDocuments({ user: req.user.id }),
      Task.countDocuments({ user: req.user.id, status: 'Completed' }),
      Task.countDocuments({ user: req.user.id, status: 'Pending' }),
      Task.countDocuments({ user: req.user.id, status: 'In Progress' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:taskId', fetchUser, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.user.id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

router.put('/:taskId', fetchUser, async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (status && !TASK_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Status is invalid' });
    }
    if (priority && !TASK_PRIORITY.includes(priority)) {
      return res.status(400).json({ message: 'Priority is invalid' });
    }

    const task = await Task.findOne({ _id: req.params.taskId, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

router.delete('/:taskId', fetchUser, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.put('/complete/:taskId', fetchUser, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'Completed';
    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

router.get('/status/:status', fetchUser, async (req, res, next) => {
  try {
    const { status } = req.params;

    if (!TASK_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Status is invalid' });
    }

    const tasks = await Task.find({ user: req.user.id, status }).sort({ dueDate: 1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/search', fetchUser, async (req, res, next) => {
  try {
    const { query = '' } = req.query;

    const tasks = await Task.find({
      user: req.user.id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    }).sort({ dueDate: 1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/sort', fetchUser, async (req, res, next) => {
  try {
    const { sortBy = 'date' } = req.query;
    const sortCriteria = sortBy === 'priority' ? { priority: 1, dueDate: 1 } : { dueDate: 1 };

    const tasks = await Task.find({ user: req.user.id }).sort(sortCriteria);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', fetchUser, async (req, res, next) => {
  try {
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      Task.countDocuments({ user: req.user.id }),
      Task.countDocuments({ user: req.user.id, status: 'Completed' }),
      Task.countDocuments({ user: req.user.id, status: 'Pending' }),
      Task.countDocuments({ user: req.user.id, status: 'In Progress' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;