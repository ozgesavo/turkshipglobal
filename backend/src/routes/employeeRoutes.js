const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const employeeController = require('../controllers/employeeController');

// @route   GET /api/employees/supplier
// @desc    Get all employees for a supplier
// @access  Private (supplier only)
router.get('/supplier', auth(['supplier']), employeeController.getSupplierEmployees);

// @route   GET /api/employees/dropshipper
// @desc    Get all employees for a dropshipper
// @access  Private (dropshipper only)
router.get('/dropshipper', auth(['dropshipper']), employeeController.getDropshipperEmployees);

// @route   POST /api/employees/supplier
// @desc    Add a new employee for a supplier
// @access  Private (supplier only)
router.post(
  '/supplier',
  [
    auth(['supplier']),
    [
      check('firstName', 'First name is required').not().isEmpty(),
      check('lastName', 'Last name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('position', 'Position is required').not().isEmpty()
    ]
  ],
  employeeController.addSupplierEmployee
);

// @route   POST /api/employees/dropshipper
// @desc    Add a new employee for a dropshipper
// @access  Private (dropshipper only)
router.post(
  '/dropshipper',
  [
    auth(['dropshipper']),
    [
      check('firstName', 'First name is required').not().isEmpty(),
      check('lastName', 'Last name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('position', 'Position is required').not().isEmpty()
    ]
  ],
  employeeController.addDropshipperEmployee
);

// @route   PUT /api/employees/:id
// @desc    Update an employee
// @access  Private (supplier, dropshipper, admin)
router.put(
  '/:id',
  [
    auth(['supplier', 'dropshipper', 'admin']),
    [
      check('firstName', 'First name is required').not().isEmpty(),
      check('lastName', 'Last name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('position', 'Position is required').not().isEmpty()
    ]
  ],
  employeeController.updateEmployee
);

// @route   DELETE /api/employees/:id
// @desc    Delete an employee
// @access  Private (supplier, dropshipper, admin)
router.delete('/:id', auth(['supplier', 'dropshipper', 'admin']), employeeController.deleteEmployee);

// @route   GET /api/employees/tasks
// @desc    Get all tasks for an employee
// @access  Private (employee only)
router.get('/tasks', auth(['employee']), employeeController.getEmployeeTasks);

// @route   GET /api/employees/assigned-tasks
// @desc    Get all tasks assigned by a user
// @access  Private (supplier, dropshipper, admin)
router.get('/assigned-tasks', auth(['supplier', 'dropshipper', 'admin']), employeeController.getAssignedTasks);

// @route   POST /api/employees/tasks
// @desc    Create a new task
// @access  Private (supplier, dropshipper, admin)
router.post(
  '/tasks',
  [
    auth(['supplier', 'dropshipper', 'admin']),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('assignedTo', 'Assigned employee is required').not().isEmpty()
    ]
  ],
  employeeController.createTask
);

// @route   PUT /api/employees/tasks/:id
// @desc    Update a task
// @access  Private (supplier, dropshipper, employee, admin)
router.put(
  '/tasks/:id',
  [
    auth(['supplier', 'dropshipper', 'employee', 'admin']),
    [
      check('status', 'Status is required').not().isEmpty()
    ]
  ],
  employeeController.updateTask
);

// @route   DELETE /api/employees/tasks/:id
// @desc    Delete a task
// @access  Private (supplier, dropshipper, admin)
router.delete('/tasks/:id', auth(['supplier', 'dropshipper', 'admin']), employeeController.deleteTask);

module.exports = router;
