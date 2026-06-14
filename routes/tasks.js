const express = require("express");
const { body } = require("express-validator");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} = require("../controllers/taskController");
const protect = require("../middleware/auth");

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.get("/", getTasks);

router.post(
  "/",
  [body("title").trim().notEmpty().withMessage("Task title is required")],
  createTask
);

router.put("/reorder", reorderTasks);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

module.exports = router;
