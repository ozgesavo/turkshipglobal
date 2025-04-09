import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Switch,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const EmployeeManagement = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    permissions: {
      manageProducts: false,
      manageOrders: false,
      manageInventory: false,
      manageEmployees: false,
      viewReports: false,
      manageSettings: false
    }
  });
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Determine if the current user is a supplier or dropshipper
      const userType = currentUser.userType;
      
      let endpoint = '';
      if (userType === 'supplier') {
        endpoint = '/api/employees/supplier';
      } else if (userType === 'dropshipper') {
        endpoint = '/api/employees/dropshipper';
      } else {
        showSnackbar(t('Unauthorized access'), 'error');
        navigate('/dashboard');
        return;
      }
      
      const res = await axios.get(endpoint);
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      showSnackbar(t('Failed to load employees'), 'error');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddClick = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      permissions: {
        manageProducts: false,
        manageOrders: false,
        manageInventory: false,
        manageEmployees: false,
        viewReports: false,
        manageSettings: false
      }
    });
    setOpenAddDialog(true);
  };
  
  const handleEditClick = (employee) => {
    // Find the user associated with this employee
    const user = employee.userId;
    
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      position: employee.position || '',
      department: employee.department || '',
      permissions: {
        manageProducts: employee.permissions.manageProducts || false,
        manageOrders: employee.permissions.manageOrders || false,
        manageInventory: employee.permissions.manageInventory || false,
        manageEmployees: employee.permissions.manageEmployees || false,
        viewReports: employee.permissions.viewReports || false,
        manageSettings: employee.permissions.manageSettings || false
      }
    });
    setSelectedEmployee(employee);
    setOpenEditDialog(true);
  };
  
  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedEmployee(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [name]: checked
      }
    });
  };
  
  const handleAddEmployee = async () => {
    try {
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.position) {
        showSnackbar(t('Please fill in all required fields'), 'error');
        return;
      }
      
      // Determine if the current user is a supplier or dropshipper
      const userType = currentUser.userType;
      
      let endpoint = '';
      if (userType === 'supplier') {
        endpoint = '/api/employees/supplier';
      } else if (userType === 'dropshipper') {
        endpoint = '/api/employees/dropshipper';
      } else {
        showSnackbar(t('Unauthorized access'), 'error');
        return;
      }
      
      const res = await axios.post(endpoint, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        permissions: formData.permissions
      });
      
      // Add the new employee to the state
      setEmployees([...employees, res.data]);
      
      showSnackbar(t('Employee added successfully'), 'success');
      handleCloseDialog();
    } catch (err) {
      console.error('Error adding employee:', err);
      showSnackbar(t('Failed to add employee'), 'error');
    }
  };
  
  const handleUpdateEmployee = async () => {
    try {
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.position) {
        showSnackbar(t('Please fill in all required fields'), 'error');
        return;
      }
      
      const res = await axios.put(`/api/employees/${selectedEmployee._id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        permissions: formData.permissions
      });
      
      // Update the employee in the state
      setEmployees(employees.map(emp => 
        emp._id === selectedEmployee._id ? res.data : emp
      ));
      
      showSnackbar(t('Employee updated successfully'), 'success');
      handleCloseDialog();
    } catch (err) {
      console.error('Error updating employee:', err);
      showSnackbar(t('Failed to update employee'), 'error');
    }
  };
  
  const handleDeleteEmployee = async () => {
    try {
      await axios.delete(`/api/employees/${selectedEmployee._id}`);
      
      // Remove the employee from the state
      setEmployees(employees.filter(emp => emp._id !== selectedEmployee._id));
      
      showSnackbar(t('Employee deleted successfully'), 'success');
      handleCloseDialog();
    } catch (err) {
      console.error('Error deleting employee:', err);
      showSnackbar(t('Failed to delete employee'), 'error');
    }
  };
  
  const filteredEmployees = employees.filter(employee => {
    const user = employee.userId;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const position = employee.position.toLowerCase();
    const department = employee.department ? employee.department.toLowerCase() : '';
    
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      position.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase())
    );
  });
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {t('Employee Management')}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            {t('Add Employee')}
          </Button>
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label={t('Employees')} />
          <Tab label={t('Tasks')} />
        </Tabs>
        
        {tabValue === 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('Search employees by name, email, position or department')}
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredEmployees.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  {searchTerm ? t('No employees match your search') : t('No employees found')}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddClick}
                  sx={{ mt: 2 }}
                >
                  {t('Add Your First Employee')}
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Name')}</TableCell>
                      <TableCell>{t('Email')}</TableCell>
                      <TableCell>{t('Position')}</TableCell>
                      <TableCell>{t('Department')}</TableCell>
                      <TableCell>{t('Status')}</TableCell>
                      <TableCell>{t('Permissions')}</TableCell>
                      <TableCell align="right">{t('Actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {employee.userId.firstName.charAt(0)}{employee.userId.lastName.charAt(0)}
                            </Avatar>
                            <Typography variant="body1">
                              {employee.userId.firstName} {employee.userId.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{employee.userId.email}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.department || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={t(employee.status)} 
                            size="small" 
                            color={getStatusColor(employee.status)} 
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {employee.permissions.manageProducts && (
                              <Chip label={t('Products')} size="small" color="primary" variant="outlined" />
                            )}
                            {employee.permissions.manageOrders && (
                              <Chip label={t('Orders')} size="small" color="primary" variant="outlined" />
                            )}
                            {employee.permissions.manageInventory && (
                              <Chip label={t('Inventory')} size="small" color="primary" variant="outlined" />
                            )}
                            {employee.permissions.manageEmployees && (
                              <Chip label={t('Employees')} size="small" color="primary" variant="outlined" />
                            )}
                            {employee.permissions.viewReports && (
                              <Chip label={t('Reports')} size="small" color="primary" variant="outlined" />
                            )}
                            {employee.permissions.manageSettings && (
                              <Chip label={t('Settings')} size="small" color="primary" variant="outlined" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={t('Edit')}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditClick(employee)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('Delete')}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteClick(employee)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('Task Management')}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {t('Task management functionality will be available soon.')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => navigate('/tasks')}
            >
              {t('Go to Task Management')}
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Add Employee Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('Add New Employee')}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('First Name')}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Last Name')}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Position')}
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Department')}
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('Permissions')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageProducts}
                        onChange={handlePermissionChange}
                        name="manageProducts"
                        color="primary"
                      />
                    }
                    label={t('Manage Products')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageOrders}
                        onChange={handlePermissionChange}
                        name="manageOrders"
                        color="primary"
                      />
                    }
                    label={t('Manage Orders')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageInventory}
                        onChange={handlePermissionChange}
                        name="manageInventory"
                        color="primary"
                      />
                    }
                    label={t('Manage Inventory')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageEmployees}
                        onChange={handlePermissionChange}
                        name="manageEmployees"
                        color="primary"
                      />
                    }
                    label={t('Manage Employees')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.viewReports}
                        onChange={handlePermissionChange}
                        name="viewReports"
                        color="primary"
                      />
                    }
                    label={t('View Reports')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageSettings}
                        onChange={handlePermissionChange}
                        name="manageSettings"
                        color="primary"
                      />
                    }
                    label={t('Manage Settings')}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleAddEmployee} 
            variant="contained" 
            color="primary"
          >
            {t('Add Employee')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Employee Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('Edit Employee')}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('First Name')}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Last Name')}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Position')}
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('Department')}
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('Permissions')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageProducts}
                        onChange={handlePermissionChange}
                        name="manageProducts"
                        color="primary"
                      />
                    }
                    label={t('Manage Products')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageOrders}
                        onChange={handlePermissionChange}
                        name="manageOrders"
                        color="primary"
                      />
                    }
                    label={t('Manage Orders')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageInventory}
                        onChange={handlePermissionChange}
                        name="manageInventory"
                        color="primary"
                      />
                    }
                    label={t('Manage Inventory')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageEmployees}
                        onChange={handlePermissionChange}
                        name="manageEmployees"
                        color="primary"
                      />
                    }
                    label={t('Manage Employees')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.viewReports}
                        onChange={handlePermissionChange}
                        name="viewReports"
                        color="primary"
                      />
                    }
                    label={t('View Reports')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.permissions.manageSettings}
                        onChange={handlePermissionChange}
                        name="manageSettings"
                        color="primary"
                      />
                    }
                    label={t('Manage Settings')}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleUpdateEmployee} 
            variant="contained" 
            color="primary"
          >
            {t('Update Employee')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Employee Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>{t('Delete Employee')}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {t('Are you sure you want to delete this employee?')} {selectedEmployee && `${selectedEmployee.userId.firstName} ${selectedEmployee.userId.lastName}`}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {t('This action cannot be undone.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleDeleteEmployee} 
            variant="contained" 
            color="error"
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeeManagement;
