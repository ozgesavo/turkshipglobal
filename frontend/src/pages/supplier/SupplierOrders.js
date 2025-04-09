import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  Chip,
  Divider,
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
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterListIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const SupplierOrders = () => {
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [shippingInfoOpen, setShippingInfoOpen] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    trackingNumber: '',
    trackingUrl: '',
    shippingMethod: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/orders/supplier');
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showSnackbar(t('Failed to load orders'), 'error');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleOrderDetailsClose = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatusClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setUpdateStatusOpen(true);
  };

  const handleUpdateStatusClose = () => {
    setUpdateStatusOpen(false);
    setNewStatus('');
    setStatusNote('');
  };

  const handleUpdateStatus = async () => {
    try {
      const res = await axios.put(`/api/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote
      });
      
      // Update order in state
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? res.data : order
      ));
      
      showSnackbar(t('Order status updated successfully'), 'success');
      handleUpdateStatusClose();
    } catch (err) {
      console.error('Error updating order status:', err);
      showSnackbar(t('Failed to update order status'), 'error');
    }
  };

  const handleShippingInfoClick = (order) => {
    setSelectedOrder(order);
    setShippingInfo({
      trackingNumber: order.trackingNumber || '',
      trackingUrl: order.trackingUrl || '',
      shippingMethod: order.shippingMethod || ''
    });
    setShippingInfoOpen(true);
  };

  const handleShippingInfoClose = () => {
    setShippingInfoOpen(false);
    setShippingInfo({
      trackingNumber: '',
      trackingUrl: '',
      shippingMethod: ''
    });
  };

  const handleShippingInfoChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateShippingInfo = async () => {
    try {
      const res = await axios.put(`/api/orders/${selectedOrder._id}/shipping`, shippingInfo);
      
      // Update order in state
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? res.data : order
      ));
      
      showSnackbar(t('Shipping information updated successfully'), 'success');
      handleShippingInfoClose();
    } catch (err) {
      console.error('Error updating shipping information:', err);
      showSnackbar(t('Failed to update shipping information'), 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {t('Orders')}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate('/supplier/dashboard')}
          >
            {t('Back to Dashboard')}
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            sx={{ flexGrow: 1 }}
            variant="outlined"
            placeholder={t('Search orders by number, customer name or email')}
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
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">{t('Status')}</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label={t('Status')}
            >
              <MenuItem value="all">{t('All Statuses')}</MenuItem>
              <MenuItem value="pending">{t('Pending')}</MenuItem>
              <MenuItem value="processing">{t('Processing')}</MenuItem>
              <MenuItem value="shipped">{t('Shipped')}</MenuItem>
              <MenuItem value="delivered">{t('Delivered')}</MenuItem>
              <MenuItem value="cancelled">{t('Cancelled')}</MenuItem>
              <MenuItem value="refunded">{t('Refunded')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              {searchTerm || statusFilter !== 'all' ? t('No orders match your search') : t('No orders found')}
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Order Number')}</TableCell>
                  <TableCell>{t('Date')}</TableCell>
                  <TableCell>{t('Customer')}</TableCell>
                  <TableCell>{t('Total')}</TableCell>
                  <TableCell>{t('Status')}</TableCell>
                  <TableCell>{t('Payment')}</TableCell>
                  <TableCell align="right">{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.customerName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.customerEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {order.currency} {order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(order.status)} 
                        size="small" 
                        color={getStatusColor(order.status)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(order.paymentStatus)} 
                        size="small" 
                        color={getPaymentStatusColor(order.paymentStatus)} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('View Details')}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOrderClick(order)}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('Update Status')}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateStatusClick(order)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('Shipping Info')}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleShippingInfoClick(order)}
                          color="secondary"
                        >
                          <ShippingIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={handleOrderDetailsClose}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              {t('Order')} #{selectedOrder.orderNumber}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {t('Order Information')}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('Date')}:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('Status')}:
                    </Typography>
                    <Chip 
                      label={t(selectedOrder.status)} 
                      color={getStatusColor(selectedOrder.status)} 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('Payment Status')}:
                    </Typography>
                    <Chip 
                      label={t(selectedOrder.paymentStatus)} 
                      color={getPaymentStatusColor(selectedOrder.paymentStatus)} 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  {selectedOrder.trackingNumber && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('Tracking Number')}:
                      </Typography>
                      <Typography variant="body1">
                        {selectedOrder.trackingNumber}
                      </Typography>
                    </Box>
                  )}
                  {selectedOrder.shippingMethod && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        {t('Shipping Method')}:
                      </Typography>
                      <Typography variant="body1">
                        {selectedOrder.shippingMethod}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {t('Customer Information')}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('Name')}:
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.customerName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('Email')}:
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.customerEmail}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    {t('Shipping Address')}
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.shippingAddress.name}<br />
                    {selectedOrder.shippingAddress.address1}<br />
                    {selectedOrder.shippingAddress.address2 && (
                      <>{selectedOrder.shippingAddress.address2}<br /></>
                    )}
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}<br />
                    {selectedOrder.shippingAddress.country}<br />
                    {selectedOrder.shippingAddress.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    {t('Order Items')}
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('Product')}</TableCell>
                          <TableCell>{t('SKU')}</TableCell>
                          <TableCell align="right">{t('Price')}</TableCell>
                          <TableCell align="right">{t('Quantity')}</TableCell>
                          <TableCell align="right">{t('Total')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell align="right">
                              {selectedOrder.currency} {item.price.toFixed(2)}
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              {selectedOrder.currency} {item.totalPrice.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" display="inline" sx={{ mr: 2 }}>
                          {t('Subtotal')}:
                        </Typography>
                        <Typography variant="body1" display="inline">
                          {selectedOrder.currency} {selectedOrder.subtotal.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" display="inline" sx={{ mr: 2 }}>
                          {t('Shipping')}:
                        </Typography>
                        <Typography variant="body1" display="inline">
                          {selectedOrder.currency} {selectedOrder.shippingCost.toFixed(2)}
                        </Typography>
                      </Box>
                      {selectedOrder.tax > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" display="inline" sx={{ mr: 2 }}>
                            {t('Tax')}:
                          </Typography>
                          <Typography variant="body1" display="inline">
                            {selectedOrder.currency} {selectedOrder.tax.toFixed(2)}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" display="inline" sx={{ mr: 2, fontWeight: 'bold' }}>
                          {t('Total')}:
                        </Typography>
                        <Typography variant="body1" display="inline" fontWeight="bold">
                          {selectedOrder.currency} {selectedOrder.total.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" display="inline" sx={{ mr: 2, color: 'text.secondary' }}>
                          {t('Commission')}:
                        </Typography>
                        <Typography variant="body2" display="inline" color="text.secondary">
                          {selectedOrder.currency} {selectedOrder.commission.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" display="inline" sx={{ mr: 2, fontWeight: 'bold', color: 'success.main' }}>
                          {t('Payout Amount')}:
                        </Typography>
                        <Typography variant="body1" display="inline" fontWeight="bold" color="success.main">
                          {selectedOrder.currency} {selectedOrder.payoutAmount.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                {selectedOrder.notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      {t('Notes')}
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">
                        {selectedOrder.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    {t('Status History')}
                  </Typography>
                  <Stepper orientation="vertical">
                    {selectedOrder.statusHistory.map((history, index) => (
                      <Step key={index} active={true} completed={true}>
                        <StepLabel>
                          <Typography variant="body2" fontWeight="bold">
                            {t(history.status)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(history.timestamp).toLocaleString()}
                          </Typography>
                        </StepLabel>
                        {history.note && (
                          <Typography variant="body2" sx={{ ml: 2, mt: 0.5 }}>
                            {history.note}
                          </Typography>
                        )}
                      </Step>
                    ))}
                  </Stepper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleOrderDetailsClose}>
                {t('Close')}
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => handleUpdateStatusClick(selectedOrder)}
                startIcon={<EditIcon />}
              >
                {t('Update Status')}
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => handleShippingInfoClick(selectedOrder)}
                startIcon={<ShippingIcon />}
              >
                {t('Shipping Info')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={updateStatusOpen}
        onClose={handleUpdateStatusClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('Update Order Status')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="new-status-label">{t('Status')}</InputLabel>
              <Select
                labelId="new-status-label"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label={t('Status')}
              >
                <MenuItem value="pending">{t('Pending')}</MenuItem>
                <MenuItem value="processing">{t('Processing')}</MenuItem>
                <MenuItem value="shipped">{t('Shipped')}</MenuItem>
                <MenuItem value="delivered">{t('Delivered')}</MenuItem>
                <MenuItem value="cancelled">{t('Cancelled')}</MenuItem>
                <MenuItem value="refunded">{t('Refunded')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('Note (Optional)')}
              multiline
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateStatusClose}>
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained" 
            color="primary"
          >
            {t('Update')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shipping Info Dialog */}
      <Dialog
        open={shippingInfoOpen}
        onClose={handleShippingInfoClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('Update Shipping Information')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t('Tracking Number')}
              name="trackingNumber"
              value={shippingInfo.trackingNumber}
              onChange={handleShippingInfoChange}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label={t('Tracking URL')}
              name="trackingUrl"
              value={shippingInfo.trackingUrl}
              onChange={handleShippingInfoChange}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label={t('Shipping Method')}
              name="shippingMethod"
              value={shippingInfo.shippingMethod}
              onChange={handleShippingInfoChange}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShippingInfoClose}>
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleUpdateShippingInfo} 
            variant="contained" 
            color="primary"
          >
            {t('Update')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupplierOrders;
