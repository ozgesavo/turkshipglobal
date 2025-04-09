const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');

// Get all subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    console.error('Error getting subscription plans:', err);
    res.status(500).send('Server error');
  }
};

// Create a new subscription plan (admin only)
exports.createSubscriptionPlan = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      description,
      price,
      currency,
      interval,
      features,
      productLimit,
      commissionRate,
      isActive
    } = req.body;
    
    // Create new subscription plan
    const plan = new SubscriptionPlan({
      name,
      description,
      price,
      currency,
      interval,
      features,
      productLimit,
      commissionRate,
      isActive
    });
    
    await plan.save();
    
    res.json(plan);
  } catch (err) {
    console.error('Error creating subscription plan:', err);
    res.status(500).send('Server error');
  }
};

// Update a subscription plan (admin only)
exports.updateSubscriptionPlan = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      description,
      price,
      currency,
      interval,
      features,
      productLimit,
      commissionRate,
      isActive
    } = req.body;
    
    // Find and update the plan
    const plan = await SubscriptionPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ msg: 'Subscription plan not found' });
    }
    
    // Update fields
    if (name) plan.name = name;
    if (description) plan.description = description;
    if (price) plan.price = price;
    if (currency) plan.currency = currency;
    if (interval) plan.interval = interval;
    if (features) plan.features = features;
    if (productLimit !== undefined) plan.productLimit = productLimit;
    if (commissionRate !== undefined) plan.commissionRate = commissionRate;
    if (isActive !== undefined) plan.isActive = isActive;
    
    await plan.save();
    
    res.json(plan);
  } catch (err) {
    console.error('Error updating subscription plan:', err);
    res.status(500).send('Server error');
  }
};

// Delete a subscription plan (admin only)
exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ msg: 'Subscription plan not found' });
    }
    
    // Check if any active subscriptions use this plan
    const activeSubscriptions = await Subscription.countDocuments({
      planId: plan._id,
      status: 'active'
    });
    
    if (activeSubscriptions > 0) {
      return res.status(400).json({
        msg: 'Cannot delete plan with active subscriptions. Deactivate the plan instead.'
      });
    }
    
    await plan.remove();
    
    res.json({ msg: 'Subscription plan removed' });
  } catch (err) {
    console.error('Error deleting subscription plan:', err);
    res.status(500).send('Server error');
  }
};

// Subscribe to a plan
exports.subscribe = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { planId, paymentMethod, paymentDetails } = req.body;
    
    // Find the plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ msg: 'Subscription plan not found or inactive' });
    }
    
    // Find the supplier
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    // Check if supplier already has an active subscription
    const existingSubscription = await Subscription.findOne({
      supplierId: supplier._id,
      status: 'active'
    });
    
    if (existingSubscription) {
      return res.status(400).json({ msg: 'Supplier already has an active subscription' });
    }
    
    // Calculate dates
    const startDate = new Date();
    let endDate, nextBillingDate;
    
    if (plan.interval === 'monthly') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      nextBillingDate = new Date(endDate);
    } else if (plan.interval === 'yearly') {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      nextBillingDate = new Date(endDate);
    }
    
    // Create subscription
    const subscription = new Subscription({
      supplierId: supplier._id,
      userId: req.user.id,
      planId: plan._id,
      status: 'pending', // Will be updated to 'active' after payment
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      startDate,
      endDate,
      nextBillingDate,
      paymentMethod,
      paymentDetails,
      autoRenew: true
    });
    
    await subscription.save();
    
    // Create payment record
    const payment = new Payment({
      type: 'subscription',
      amount: plan.price,
      currency: plan.currency,
      status: 'pending',
      paymentMethod,
      userId: req.user.id,
      supplierId: supplier._id,
      subscriptionId: subscription._id,
      details: {
        planName: plan.name,
        interval: plan.interval
      }
    });
    
    await payment.save();
    
    // In a real implementation, we would process the payment here
    // For demo purposes, we'll simulate a successful payment
    
    // Update payment status
    payment.status = 'completed';
    payment.transactionId = 'demo_' + Date.now();
    await payment.save();
    
    // Update subscription status
    subscription.status = 'active';
    await subscription.save();
    
    // Update supplier subscription status
    supplier.subscriptionStatus = 'active';
    supplier.subscriptionId = subscription._id;
    supplier.subscriptionPlanId = plan._id;
    await supplier.save();
    
    res.json({
      subscription,
      payment
    });
  } catch (err) {
    console.error('Error subscribing to plan:', err);
    res.status(500).send('Server error');
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    // Find the supplier
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    // Find the subscription
    const subscription = await Subscription.findOne({
      supplierId: supplier._id,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(404).json({ msg: 'No active subscription found' });
    }
    
    // Update subscription
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    subscription.autoRenew = false;
    await subscription.save();
    
    // Update supplier
    supplier.subscriptionStatus = 'canceled';
    await supplier.save();
    
    res.json({
      msg: 'Subscription canceled',
      subscription
    });
  } catch (err) {
    console.error('Error canceling subscription:', err);
    res.status(500).send('Server error');
  }
};

// Get current subscription
exports.getCurrentSubscription = async (req, res) => {
  try {
    // Find the supplier
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    // Find the subscription
    const subscription = await Subscription.findOne({
      supplierId: supplier._id
    }).sort({ createdAt: -1 }).populate('planId');
    
    if (!subscription) {
      return res.status(404).json({ msg: 'No subscription found' });
    }
    
    res.json(subscription);
  } catch (err) {
    console.error('Error getting current subscription:', err);
    res.status(500).send('Server error');
  }
};

// Get subscription history
exports.getSubscriptionHistory = async (req, res) => {
  try {
    // Find the supplier
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    // Find all subscriptions
    const subscriptions = await Subscription.find({
      supplierId: supplier._id
    }).sort({ createdAt: -1 }).populate('planId');
    
    res.json(subscriptions);
  } catch (err) {
    console.error('Error getting subscription history:', err);
    res.status(500).send('Server error');
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    // Find the supplier
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    // Find all payments
    const payments = await Payment.find({
      supplierId: supplier._id
    }).sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Error getting payment history:', err);
    res.status(500).send('Server error');
  }
};

// Process commission payment for an order
exports.processCommission = async (orderId) => {
  try {
    // Find the order
    const order = await Order.findById(orderId).populate({
      path: 'items.productId',
      populate: {
        path: 'supplierId'
      }
    });
    
    if (!order) {
      console.error('Order not found for commission processing');
      return false;
    }
    
    // Group items by supplier
    const supplierItems = {};
    
    for (const item of order.items) {
      const supplierId = item.productId.supplierId._id.toString();
      
      if (!supplierItems[supplierId]) {
        supplierItems[supplierId] = {
          supplier: item.productId.supplierId,
          items: [],
          total: 0
        };
      }
      
      supplierItems[supplierId].items.push(item);
      supplierItems[supplierId].total += item.price * item.quantity;
    }
    
    // Process commission for each supplier
    for (const supplierId in supplierItems) {
      const supplierData = supplierItems[supplierId];
      
      // Get supplier's subscription plan
      const subscription = await Subscription.findOne({
        supplierId,
        status: 'active'
      }).populate('planId');
      
      if (!subscription) {
        console.error(`No active subscription found for supplier ${supplierId}`);
        continue;
      }
      
      // Calculate commission
      const commissionRate = subscription.planId.commissionRate;
      const commissionAmount = (supplierData.total * commissionRate) / 100;
      
      // Create payment record for commission
      const payment = new Payment({
        type: 'commission',
        amount: commissionAmount,
        currency: order.currency || 'TRY',
        status: 'completed',
        paymentMethod: 'system',
        userId: supplierData.supplier.userId,
        supplierId,
        orderId: order._id,
        transactionId: 'comm_' + Date.now() + '_' + supplierId,
        details: {
          orderNumber: order.orderNumber,
          commissionRate,
          orderTotal: supplierData.total
        }
      });
      
      await payment.save();
    }
    
    return true;
  } catch (err) {
    console.error('Error processing commission payment:', err);
    return false;
  }
};

// Process sourcing agent commission
exports.processSourcingAgentCommission = async (orderId) => {
  try {
    // Find the order
    const order = await Order.findById(orderId).populate({
      path: 'items.productId',
      populate: {
        path: 'sourcingAgentId'
      }
    });
    
    if (!order) {
      console.error('Order not found for sourcing agent commission processing');
      return false;
    }
    
    // Group items by sourcing agent
    const agentItems = {};
    
    for (const item of order.items) {
      if (!item.productId.sourcingAgentId) continue;
      
      const agentId = item.productId.sourcingAgentId._id.toString();
      
      if (!agentItems[agentId]) {
        agentItems[agentId] = {
          agent: item.productId.sourcingAgentId,
          items: [],
          total: 0
        };
      }
      
      agentItems[agentId].items.push(item);
      agentItems[agentId].total += item.price * item.quantity;
    }
    
    // Process commission for each sourcing agent
    for (const agentId in agentItems) {
      const agentData = agentItems[agentId];
      
      // Calculate commission (fixed 10% for sourcing agents)
      const commissionRate = 10;
      const commissionAmount = (agentData.total * commissionRate) / 100;
      
      // Create payment record for commission
      const payment = new Payment({
        type: 'commission',
        amount: commissionAmount,
        currency: order.currency || 'TRY',
        status: 'completed',
        paymentMethod: 'system',
        userId: agentData.agent.userId,
        sourcingAgentId: agentId,
        orderId: order._id,
        transactionId: 'sa_comm_' + Date.now() + '_' + agentId,
        details: {
          orderNumber: order.orderNumber,
          commissionRate,
          orderTotal: agentData.total
        }
      });
      
      await payment.save();
    }
    
    return true;
  } catch (err) {
    console.error('Error processing sourcing agent commission payment:', err);
    return false;
  }
};

// Get commission statistics for supplier
exports.getCommissionStatistics = async (req, res) => {
  try {
    // Find the supplier
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }
    
    // Get date range (default: last 30 days)
    const { startDate, endDate } = req.query;
    const queryStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const queryEndDate = endDate ? new Date(endDate) : new Date();
    
    // Find all commission payments
    const commissionPayments = await Payment.find({
      supplierId: supplier._id,
      type: 'commission',
      status: 'completed',
      createdAt: {
        $gte: queryStartDate,
        $lte: queryEndDate
      }
    }).sort({ createdAt: -1 });
    
    // Calculate total commission
    const totalCommission = commissionPayments.reduce((total, payment) => total + payment.amount, 0);
    
    // Group by day for chart data
    const chartData = {};
    commissionPayments.forEach(payment => {
      const date = payment.createdAt.toISOString().split('T')[0];
      if (!chartData[date]) {
        chartData[date] = 0;
      }
      chartData[date] += payment.amount;
    });
    
    // Convert to array format for frontend
    const chartDataArray = Object.keys(chartData).map(date => ({
      date,
      amount: chartData[date]
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    res.json({
      totalCommission,
      commissionCount: commissionPayments.length,
      recentCommissions: commissionPayments.slice(0, 10),
      chartData: chartDataArray
    });
  } catch (err) {
    console.error('Error getting commission statistics:', err);
    res.status(500).send('Server error');
  }
};

// Get commission statistics for sourcing agent
exports.getSourcingAgentCommissionStatistics = async (req, res) => {
  try {
    // Find the sourcing agent
    const sourcingAgent = await SourcingAgent.findOne({ userId: req.user.id });
    if (!sourcingAgent) {
      return res.status(404).json({ msg: 'Sourcing agent not found' });
    }
    
    // Get date range (default: last 30 days)
    const { startDate, endDate } = req.query;
    const queryStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const queryEndDate = endDate ? new Date(endDate) : new Date();
    
    // Find all commission payments
    const commissionPayments = await Payment.find({
      sourcingAgentId: sourcingAgent._id,
      type: 'commission',
      status: 'completed',
      createdAt: {
        $gte: queryStartDate,
        $lte: queryEndDate
      }
    }).sort({ createdAt: -1 });
    
    // Calculate total commission
    const totalCommission = commissionPayments.reduce((total, payment) => total + payment.amount, 0);
    
    // Group by day for chart data
    const chartData = {};
    commissionPayments.forEach(payment => {
      const date = payment.createdAt.toISOString().split('T')[0];
      if (!chartData[date]) {
        chartData[date] = 0;
      }
      chartData[date] += payment.amount;
    });
    
    // Convert to array format for frontend
    const chartDataArray = Object.keys(chartData).map(date => ({
      date,
      amount: chartData[date]
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    res.json({
      totalCommission,
      commissionCount: commissionPayments.length,
      recentCommissions: commissionPayments.slice(0, 10),
      chartData: chartDataArray
    });
  } catch (err) {
    console.error('Error getting sourcing agent commission statistics:', err);
    res.status(500).send('Server error');
  }
};
