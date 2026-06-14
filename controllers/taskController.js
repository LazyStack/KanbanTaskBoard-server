const { validationResult } = require("express-validator");
const Task = require("../models/Task");

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({
      status: 1,
      position: 1,
      createdAt: -1,
    });
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { title, description, status, priority, dueDate } = req.body;

    // Set position to end of the column
    const count = await Task.countDocuments({
      user: req.userId,
      status: status || "todo",
    });

    const task = await Task.create({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate,
      position: count,
      user: req.userId,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, status, priority, position, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (position !== undefined) task.position = position;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Update task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/tasks/reorder
exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // [{ id, status, position }]

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "Tasks array required" });
    }

    const bulkOps = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t.id, user: req.userId },
        update: { $set: { status: t.status, position: t.position } },
      },
    }));

    await Task.bulkWrite(bulkOps);
    res.json({ message: "Tasks reordered" });
  } catch (error) {
    console.error("Reorder error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
