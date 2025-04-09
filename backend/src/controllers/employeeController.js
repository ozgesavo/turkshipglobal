const Employee = require('../models/Employee');
const Task = require('../models/Task');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Dropshipper = require('../models/Dropshipper');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Get all employees for a supplier
exports.getSupplierEmployees = async (req, res) => {
  try {
    // Find the supplier associated with the current user
    const supplier = await Supplier.findOne({ userId: req.user.id });
    
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    // Find all employees for this supplier
    const employees = await Employee.find({ 
      employerType: 'supplier',
      employerId: supplier._id
    }).populate('userId', 'firstName lastName email phone');
    
    res.json(employees);
  } catch (err) {
    console.error('Error getting supplier employees:', err);
    res.status(500).send('Server error');
  }
};

// Get all employees for a dropshipper
exports.getDropshipperEmployees = async (req, res) => {
  try {
    // Find the dropshipper associated with the current user
    const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
    
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper not found' });
    }
    
    // Find all employees for this dropshipper
    const employees = await Employee.find({ 
      employerType: 'dropshipper',
      employerId: dropshipper._id
    }).populate('userId', 'firstName lastName email phone');
    
    res.json(employees);
  } catch (err) {
    console.error('Error getting dropshipper employees:', err);
    res.status(500).send('Server error');
  }
};

// Add a new employee for a supplier
exports.addSupplierEmployee = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { firstName, lastName, email, phone, position, department, permissions } = req.body;
    
    // Find the supplier associated with the current user
    const supplier = await Supplier.findOne({ userId: req.user.id });
    
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    // Check if user with this email already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Check if this user is already an employee for this supplier
      const existingEmployee = await Employee.findOne({
        userId: user._id,
        employerType: 'supplier',
        employerId: supplier._id
      });
      
      if (existingEmployee) {
        return res.status(400).json({ msg: 'Employee already exists' });
      }
    } else {
      // Create a new user
      const password = generateRandomPassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = new User({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        userType: 'employee'
      });
      
      await user.save();
      
      // Send email with login credentials
      await sendWelcomeEmail(email, firstName, password);
    }
    
    // Create a new employee
    const employee = new Employee({
      userId: user._id,
      employerType: 'supplier',
      employerId: supplier._id,
      position,
      department,
      permissions,
      status: 'pending'
    });
    
    await employee.save();
    
    // Populate the user data for the response
    await employee.populate('userId', 'firstName lastName email phone');
    
    res.status(201).json(employee);
  } catch (err) {
    console.error('Error adding supplier employee:', err);
    res.status(500).send('Server error');
  }
};

// Add a new employee for a dropshipper
exports.addDropshipperEmployee = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { firstName, lastName, email, phone, position, department, permissions } = req.body;
    
    // Find the dropshipper associated with the current user
    const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
    
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper not found' });
    }
    
    // Check if user with this email already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Check if this user is already an employee for this dropshipper
      const existingEmployee = await Employee.findOne({
        userId: user._id,
        employerType: 'dropshipper',
        employerId: dropshipper._id
      });
      
      if (existingEmployee) {
        return res.status(400).json({ msg: 'Employee already exists' });
      }
    } else {
      // Create a new user
      const password = generateRandomPassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = new User({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        userType: 'employee'
      });
      
      await user.save();
      
      // Send email with login credentials
      await sendWelcomeEmail(email, firstName, password);
    }
    
    // Create a new employee
    const employee = new Employee({
      userId: user._id,
      employerType: 'dropshipper',
      employerId: dropshipper._id,
      position,
      department,
      permissions,
      status: 'pending'
    });
    
    await employee.save();
    
    // Populate the user data for the response
    await employee.populate('userId', 'firstName lastName email phone');
    
    res.status(201).json(employee);
  } catch (err) {
    console.error('Error adding dropshipper employee:', err);
    res.status(500).send('Server error');
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { firstName, lastName, email, phone, position, department, permissions } = req.body;
    
    // Find the employee
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    
    // Check if the current user is authorized to update this employee
    if (req.user.userType === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user.id });
      
      if (!supplier || employee.employerType !== 'supplier' || employee.employerId.toString() !== supplier._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
    } else if (req.user.userType === 'dropshipper') {
      const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
      
      if (!dropshipper || employee.employerType !== 'dropshipper' || employee.employerId.toString() !== dropshipper._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
    } else if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Update the user data
    const user = await User.findById(employee.userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    
    // If email is changed, check if it's already in use
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
      
      user.email = email;
    }
    
    await user.save();
    
    // Update the employee data
    employee.position = position;
    employee.department = department;
    employee.permissions = permissions;
    
    await employee.save();
    
    // Populate the user data for the response
    await employee.populate('userId', 'firstName lastName email phone');
    
    res.json(employee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).send('Server error');
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    // Find the employee
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    
    // Check if the current user is authorized to delete this employee
    if (req.user.userType === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user.id });
      
      if (!supplier || employee.employerType !== 'supplier' || employee.employerId.toString() !== supplier._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
    } else if (req.user.userType === 'dropshipper') {
      const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
      
      if (!dropshipper || employee.employerType !== 'dropshipper' || employee.employerId.toString() !== dropshipper._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
    } else if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Delete the employee
    await employee.remove();
    
    // Note: We don't delete the user account, as they might be an employee for other employers
    
    res.json({ msg: 'Employee removed' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).send('Server error');
  }
};

// Get all tasks for an employee
exports.getEmployeeTasks = async (req, res) => {
  try {
    // Find the employee
    const employee = await Employee.findOne({ userId: req.user.id });
    
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    
    // Find all tasks assigned to this employee
    const tasks = await Task.find({ 
      assignedTo: employee._id
    }).populate('assignedBy', 'firstName lastName');
    
    res.json(tasks);
  } catch (err) {
    console.error('Error getting employee tasks:', err);
    res.status(500).send('Server error');
  }
};

// Get all tasks assigned by a user
exports.getAssignedTasks = async (req, res) => {
  try {
    // Find all tasks assigned by this user
    const tasks = await Task.find({ 
      assignedBy: req.user.id
    }).populate('assignedTo', 'userId');
    
    // Populate the employee user data
    for (let task of tasks) {
      await task.populate('assignedTo.userId', 'firstName lastName');
    }
    
    res.json(tasks);
  } catch (err) {
    console.error('Error getting assigned tasks:', err);
    res.status(500).send('Server error');
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, description, assignedTo, priority, dueDate } = req.body;
    
    // Find the employee
    const employee = await Employee.findById(assignedTo);
    
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    
    // Check if the current user is authorized to assign tasks to this employee
    if (req.user.userType === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user.id });
      
      if (!supplier || employee.employerType !== 'supplier' || employee.employerId.toString() !== supplier._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
    } else if (req.user.userType === 'dropshipper') {
      const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
      
      if (!dropshipper || employee.employerType !== 'dropshipper' || employee.employerId.toString() !== dropshipper._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
    } else if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Create a new task
    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      employerType: employee.employerType,
      employerId: employee.employerId,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });
    
    await task.save();
    
    // Populate the employee data for the response
    await task.populate('assignedTo', 'userId');
    await task.populate('assignedTo.userId', 'firstName lastName');
    await task.populate('assignedBy', 'firstName lastName');
    
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).send('Server error');
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, description, status, priority, dueDate } = req.body;
    
    // Find the task
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    // Check if the current user is authorized to update this task
    if (req.user.userType === 'employee') {
      const employee = await Employee.findOne({ userId: req.user.id });
      
      if (!employee || task.assignedTo.toString() !== employee._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
      
      // Employees can only update the status
      task.status = status;
    } else if (req.user.userType === 'supplier' || req.user.userType === 'dropshipper') {
      // Check if the current user is the one who assigned the task
      if (task.assignedBy.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
      
      // Update all fields
      task.title = title;
      task.description = description;
      task.status = status;
      task.priority = priority;
      if (dueDate) task.dueDate = new Date(dueDate);
    } else if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // If the status is changed to completed, set the completedDate
    if (task.status === 'completed' && !task.completedDate) {
      task.completedDate = new Date();
    }
    
    await task.save();
    
    // Populate the employee data for the response
    await task.populate('assignedTo', 'userId');
    await task.populate('assignedTo.userId', 'firstName lastName');
    await task.populate('assignedBy', 'firstName lastName');
    
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).send('Server error');
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    // Find the task
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    // Check if the current user is authorized to delete this task
    if (req.user.userType === 'supplier' || req.user.userType === 'dropshipper') {
      // Check if the current user is the one who assigned the task
      if (task.assignedBy.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
    } else if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Delete the task
    await task.remove();
    
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).send('Server error');
  }
};

// Helper function to generate a random password
const generateRandomPassword = () => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

// Helper function to send welcome email with login credentials
const sendWelcomeEmail = async (email, firstName, password) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      // Configure email transport (implementation depends on your email provider)
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to the Dropshipping Platform',
      html: `
        <h1>Welcome to the Dropshipping Platform</h1>
        <p>Hello ${firstName},</p>
        <p>You have been added as an employee to our dropshipping platform. Here are your login credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please login and change your password as soon as possible.</p>
        <p>Best regards,<br>The Dropshipping Platform Team</p>
      `
    });
  } catch (err) {
    console.error('Error sending welcome email:', err);
  }
};
